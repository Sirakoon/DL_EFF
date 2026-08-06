const { sql, getPool } = require('../config/db');
const { validateDateRangeQuery, validatePagination } = require('../utils/queryValidation');

// GET /api/dashboard/machine-performance
const getMachinePerformance = async (req, res, next) => {
  try {
    const errors = [...validateDateRangeQuery(req.query), ...validatePagination(req.query)];
    if (errors.length) return res.status(400).json({ error: errors.join('; ') });

    const { dateFrom, dateTo, machine, shift, productGroup } = req.query;
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;

    const pool = getPool();
    const result = await pool.request()
      .input('dateFrom', sql.Date, dateFrom || null)
      .input('dateTo', sql.Date, dateTo || null)
      .input('machine', sql.VarChar(30), machine || null)
      .input('shift', sql.Char(1), shift || null)
      .input('productGroup', sql.VarChar(50), productGroup || null)
      .input('page', sql.Int, page)
      .input('pageSize', sql.Int, pageSize)
      .execute('sp_get_dashboard_machine_performance');

    const [
      [kpi], [highLossRow], lossByMachine, outputByMachine, runTimeVsLoss,
      machines, rankingRows, [{ total: rankingTotal }],
    ] = result.recordsets;

    const highLoss = highLossRow || { MACHINE: '-', lossRate: 0 };
    const statusSummary = machines.reduce(
      (acc, m) => { const r = m.lossRate || 0; if (r > 10) acc.problem++; else if (r > 5) acc.watch++; else acc.normal++; return acc; },
      { normal: 0, watch: 0, problem: 0 }
    );
    const rankingWithStatus = rankingRows.map((row) => ({
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
      lossByMachine,
      outputByMachine,
      runTimeVsLoss,
      machineStatus: { total: machines.length, ...statusSummary },
      ranking: {
        data: rankingWithStatus,
        total: rankingTotal,
        page,
        pageSize,
        totalPages: Math.ceil(rankingTotal / pageSize),
      },
    });
  } catch (err) { next(err); }
};

// GET /api/dashboard/filters
const getFilterOptions = async (req, res, next) => {
  try {
    const pool = getPool();
    const result = await pool.request().execute('sp_get_dashboard_filters');
    const [machines, shifts, productGroups] = result.recordsets;
    res.json({
      machines: machines.map((r) => r.val),
      shifts: shifts.map((r) => r.val),
      productGroups: productGroups.map((r) => r.val),
    });
  } catch (err) { next(err); }
};

module.exports = { getMachinePerformance, getFilterOptions };
