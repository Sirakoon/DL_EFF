const { sql, getPool } = require('../config/db');

function buildWhere(req) {
  const { dateFrom, dateTo, machine, shift, productGroup } = req.query;
  const conditions = [];
  const inputs = [];

  if (dateFrom) { conditions.push('production_date >= @dateFrom'); inputs.push({ name: 'dateFrom', type: sql.Date, value: dateFrom }); }
  if (dateTo)   { conditions.push('production_date <= @dateTo');   inputs.push({ name: 'dateTo',   type: sql.Date, value: dateTo });   }
  if (machine)  { conditions.push('machine_code = @machine');      inputs.push({ name: 'machine',  type: sql.VarChar(30), value: machine }); }
  if (shift)    { conditions.push('shift_code = @shift');          inputs.push({ name: 'shift',    type: sql.Char(1),    value: shift });    }
  if (productGroup) { conditions.push('product_group_name = @productGroup'); inputs.push({ name: 'productGroup', type: sql.VarChar(50), value: productGroup }); }

  return { where: conditions.length ? 'WHERE ' + conditions.join(' AND ') : '', inputs };
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
    const VIEW = 'vw_oee_productivity';

    const kpiResult = await applyInputs(pool.request(), inputs).query(`
      SELECT
        COUNT(DISTINCT machine_code)                                          AS machineCount,
        SUM(machine_run_time)                                                 AS totalRunTime,
        SUM(loss_hour)                                                        AS totalLossHour,
        SUM(CAST(actual_output AS FLOAT)) / NULLIF(SUM(actual_hour), 0)      AS avgOutputPerHr
      FROM ${VIEW} ${where}
    `);
    const kpi = kpiResult.recordset[0];

    const highLossResult = await applyInputs(pool.request(), inputs).query(`
      SELECT TOP 1
        machine_code AS MACHINE,
        SUM(loss_hour) / NULLIF(SUM(machine_run_time), 0) * 100 AS lossRate
      FROM ${VIEW} ${where}
      GROUP BY machine_code
      ORDER BY lossRate DESC
    `);
    const highLoss = highLossResult.recordset[0] || { MACHINE: '-', lossRate: 0 };

    const lossByMachineResult = await applyInputs(pool.request(), inputs).query(`
      SELECT TOP 10
        machine_code AS MACHINE,
        ROUND(SUM(loss_hour), 1) AS lossHour
      FROM ${VIEW} ${where}
      GROUP BY machine_code
      ORDER BY lossHour DESC
    `);

    const outputByMachineResult = await applyInputs(pool.request(), inputs).query(`
      SELECT TOP 10
        machine_code AS MACHINE,
        CAST(ROUND(SUM(CAST(actual_output AS FLOAT)) / NULLIF(SUM(actual_hour), 0), 0) AS INT) AS outputPerHr
      FROM ${VIEW} ${where}
      GROUP BY machine_code
      ORDER BY outputPerHr DESC
    `);

    const rtVsLossResult = await applyInputs(pool.request(), inputs).query(`
      SELECT TOP 10
        machine_code AS MACHINE,
        ROUND(SUM(machine_run_time), 1) AS runTime,
        ROUND(SUM(loss_hour), 1)        AS lossHour
      FROM ${VIEW} ${where}
      GROUP BY machine_code
      ORDER BY runTime DESC
    `);

    const statusResult = await applyInputs(pool.request(), inputs).query(`
      SELECT
        machine_code AS MACHINE,
        SUM(loss_hour) / NULLIF(SUM(machine_run_time), 0) * 100 AS lossRate
      FROM ${VIEW} ${where}
      GROUP BY machine_code
    `);
    const machines = statusResult.recordset;
    const statusSummary = machines.reduce(
      (acc, m) => { const r = m.lossRate || 0; if (r > 10) acc.problem++; else if (r > 5) acc.watch++; else acc.normal++; return acc; },
      { normal: 0, watch: 0, problem: 0 }
    );

    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const offset = (page - 1) * pageSize;

    const rankingResult = await applyInputs(pool.request(), inputs).query(`
      SELECT
        machine_code                    AS MACHINE,
        MAX(product_group_name)         AS productGroup,
        CAST(SUM(CAST(actual_output AS BIGINT)) AS BIGINT) AS totalOutput,
        ROUND(SUM(machine_run_time), 1) AS runTime,
        ROUND(SUM(loss_hour), 1)        AS lossHour,
        ROUND(SUM(loss_hour) / NULLIF(SUM(machine_run_time), 0) * 100, 2) AS lossRate
      FROM ${VIEW} ${where}
      GROUP BY machine_code
      ORDER BY totalOutput DESC
      OFFSET ${offset} ROWS FETCH NEXT ${pageSize} ROWS ONLY
    `);

    const countResult = await applyInputs(pool.request(), inputs).query(`
      SELECT COUNT(DISTINCT machine_code) AS total FROM ${VIEW} ${where}
    `);

    const rankingWithStatus = rankingResult.recordset.map((row) => ({
      ...row,
      status: row.lossRate > 10 ? 'Problem' : row.lossRate > 5 ? 'Watch' : 'Normal',
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
      machineStatus: { total: machines.length, ...statusSummary },
      ranking: {
        data: rankingWithStatus,
        total: countResult.recordset[0].total,
        page,
        pageSize,
        totalPages: Math.ceil(countResult.recordset[0].total / pageSize),
      },
    });
  } catch (err) { next(err); }
};

// GET /api/dashboard/filters
const getFilterOptions = async (req, res, next) => {
  try {
    const pool = getPool();
    const [machines, shifts, productGroups] = await Promise.all([
      pool.request().query('SELECT DISTINCT machine_code AS val FROM vw_oee_productivity ORDER BY val'),
      pool.request().query('SELECT DISTINCT shift_code   AS val FROM vw_oee_productivity ORDER BY val'),
      pool.request().query('SELECT DISTINCT product_group_name AS val FROM vw_oee_productivity ORDER BY val'),
    ]);
    res.json({
      machines: machines.recordset.map((r) => r.val),
      shifts: shifts.recordset.map((r) => r.val),
      productGroups: productGroups.recordset.map((r) => r.val),
    });
  } catch (err) { next(err); }
};

module.exports = { getMachinePerformance, getFilterOptions };
