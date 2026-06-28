const { sql, getPool } = require('../config/db');

// Build WHERE clause from query params
function buildWhere(req) {
  const { dateFrom, dateTo, machine, shift, productGroup } = req.query;
  const conditions = [];
  const inputs = [];

  if (dateFrom) {
    conditions.push('PRODUCTION_DATE >= @dateFrom');
    inputs.push({ name: 'dateFrom', type: sql.DateTime2, value: dateFrom });
  }
  if (dateTo) {
    conditions.push('PRODUCTION_DATE <= @dateTo');
    inputs.push({ name: 'dateTo', type: sql.DateTime2, value: dateTo });
  }
  if (machine && machine !== 'ทั้งหมด') {
    conditions.push('MACHINE = @machine');
    inputs.push({ name: 'machine', type: sql.VarChar(100), value: machine });
  }
  if (shift && shift !== 'ทั้งหมด') {
    conditions.push('SHIFT = @shift');
    inputs.push({ name: 'shift', type: sql.VarChar(10), value: shift });
  }
  if (productGroup && productGroup !== 'ทั้งหมด') {
    conditions.push('PRODUCT_GROUP = @productGroup');
    inputs.push({ name: 'productGroup', type: sql.VarChar(150), value: productGroup });
  }

  return {
    where: conditions.length ? 'WHERE ' + conditions.join(' AND ') : '',
    inputs,
  };
}

function applyInputs(request, inputs) {
  inputs.forEach(({ name, type, value }) => request.input(name, type, value));
  return request;
}

// GET /api/dashboard/machine-performance
const getMachinePerformance = async (req, res, next) => {
  try {
    const pool = getPool();
    const { where, inputs } = buildWhere(req);

    // KPI Summary
    const kpiResult = await applyInputs(pool.request(), inputs).query(`
      SELECT
        COUNT(DISTINCT MACHINE)          AS machineCount,
        SUM(MC_RUN_TIME) / 60.0          AS totalRunTime,
        SUM(LOSS_HOUR)                   AS totalLossHour,
        SUM(ACTUAL_OUTPUT) / NULLIF(SUM(MC_RUN_TIME) / 60.0, 0) AS avgOutputPerHr
      FROM RawDataTest
      ${where}
    `);
    const kpi = kpiResult.recordset[0];

    // Machine with highest loss rate
    const highLossResult = await applyInputs(pool.request(), inputs).query(`
      SELECT TOP 1
        MACHINE,
        SUM(LOSS_HOUR) / NULLIF(SUM(MC_RUN_TIME) / 60.0, 0) * 100 AS lossRate
      FROM RawDataTest
      ${where}
      GROUP BY MACHINE
      ORDER BY lossRate DESC
    `);
    const highLoss = highLossResult.recordset[0] || { MACHINE: '-', lossRate: 0 };

    // Loss Hour by Machine Top 10
    const lossByMachineResult = await applyInputs(pool.request(), inputs).query(`
      SELECT TOP 10
        MACHINE,
        ROUND(SUM(LOSS_HOUR), 1) AS lossHour
      FROM RawDataTest
      ${where}
      GROUP BY MACHINE
      ORDER BY lossHour DESC
    `);

    // Output/Hr by Machine (top 10 by output)
    const outputByMachineResult = await applyInputs(pool.request(), inputs).query(`
      SELECT TOP 10
        MACHINE,
        CAST(ROUND(SUM(ACTUAL_OUTPUT) / NULLIF(SUM(MC_RUN_TIME) / 60.0, 0), 0) AS INT) AS outputPerHr
      FROM RawDataTest
      ${where}
      GROUP BY MACHINE
      ORDER BY outputPerHr DESC
    `);

    // Run Time vs Loss Hour by Machine
    const rtVsLossResult = await applyInputs(pool.request(), inputs).query(`
      SELECT TOP 10
        MACHINE,
        ROUND(SUM(MC_RUN_TIME) / 60.0, 1) AS runTime,
        ROUND(SUM(LOSS_HOUR), 1)           AS lossHour
      FROM RawDataTest
      ${where}
      GROUP BY MACHINE
      ORDER BY runTime DESC
    `);

    // Machine Status (derived from loss rate thresholds)
    const statusResult = await applyInputs(pool.request(), inputs).query(`
      SELECT
        MACHINE,
        SUM(LOSS_HOUR) / NULLIF(SUM(MC_RUN_TIME) / 60.0, 0) * 100 AS lossRate
      FROM RawDataTest
      ${where}
      GROUP BY MACHINE
    `);
    const machines = statusResult.recordset;
    const statusSummary = machines.reduce(
      (acc, m) => {
        const rate = m.lossRate || 0;
        if (rate > 10) acc.problem++;
        else if (rate > 5) acc.watch++;
        else acc.normal++;
        return acc;
      },
      { normal: 0, watch: 0, problem: 0 }
    );

    // Machine Ranking (paginated)
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const offset = (page - 1) * pageSize;

    const rankingResult = await applyInputs(pool.request(), inputs).query(`
      SELECT
        MACHINE,
        MAX(PRODUCT_GROUP) AS productGroup,
        CAST(ROUND(SUM(ACTUAL_OUTPUT), 0) AS BIGINT) AS totalOutput,
        ROUND(SUM(MC_RUN_TIME) / 60.0, 1)  AS runTime,
        ROUND(SUM(LOSS_HOUR), 1)            AS lossHour,
        ROUND(SUM(LOSS_HOUR) / NULLIF(SUM(MC_RUN_TIME) / 60.0, 0) * 100, 2) AS lossRate
      FROM RawDataTest
      ${where}
      GROUP BY MACHINE
      ORDER BY totalOutput DESC
      OFFSET ${offset} ROWS FETCH NEXT ${pageSize} ROWS ONLY
    `);

    const countResult = await applyInputs(pool.request(), inputs).query(`
      SELECT COUNT(DISTINCT MACHINE) AS total FROM RawDataTest ${where}
    `);
    const totalMachines = countResult.recordset[0].total;

    // Add status to each ranking row
    const rankingWithStatus = rankingResult.recordset.map((row) => ({
      ...row,
      status: row.lossRate > 10 ? 'ปัญหา' : row.lossRate > 5 ? 'เฝ้าระวัง' : 'ปกติ',
    }));

    res.json({
      kpi: {
        machineCount: kpi.machineCount || 0,
        totalRunTime: Math.round((kpi.totalRunTime || 0) * 10) / 10,
        totalLossHour: Math.round((kpi.totalLossHour || 0) * 10) / 10,
        avgOutputPerHr: Math.round(kpi.avgOutputPerHr || 0),
        highestLossMachine: highLoss.MACHINE,
        highestLossRate: Math.round((highLoss.lossRate || 0) * 100) / 100,
      },
      lossByMachine: lossByMachineResult.recordset,
      outputByMachine: outputByMachineResult.recordset,
      runTimeVsLoss: rtVsLossResult.recordset,
      machineStatus: {
        total: machines.length,
        normal: statusSummary.normal,
        watch: statusSummary.watch,
        problem: statusSummary.problem,
      },
      ranking: {
        data: rankingWithStatus,
        total: totalMachines,
        page,
        pageSize,
        totalPages: Math.ceil(totalMachines / pageSize),
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/dashboard/filters — distinct values for filter dropdowns
const getFilterOptions = async (req, res, next) => {
  try {
    const pool = getPool();
    const [machines, shifts, productGroups] = await Promise.all([
      pool.request().query('SELECT DISTINCT MACHINE FROM RawDataTest ORDER BY MACHINE'),
      pool.request().query('SELECT DISTINCT SHIFT FROM RawDataTest ORDER BY SHIFT'),
      pool.request().query('SELECT DISTINCT PRODUCT_GROUP FROM RawDataTest ORDER BY PRODUCT_GROUP'),
    ]);
    res.json({
      machines: machines.recordset.map((r) => r.MACHINE),
      shifts: shifts.recordset.map((r) => r.SHIFT),
      productGroups: productGroups.recordset.map((r) => r.PRODUCT_GROUP),
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getMachinePerformance, getFilterOptions };
