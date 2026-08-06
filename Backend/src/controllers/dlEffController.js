const { sql, getPool } = require('../config/db');
const { validateDateRangeQuery } = require('../utils/queryValidation');


const GROUP_MAP = {
  'CLSP': { main: 'Gown', target: 3.1 },
  'CLHP': { main: 'Gown', target: 3.1 },
  'FPP': { main: 'Gown', target: 3.1 },
  'Blueline': { main: 'Gown', target: 3.1 },
  'Urology': { main: 'Gown', target: 3.1 },
  'Armsleeve': { main: 'Gown', target: 3.1 },
  'Autodrape': { main: 'Drape', target: 3.1 },
  'Manualdrape': { main: 'Drape', target: 3.1 },
  'MeporeAuto': { main: 'CWC', target: 6.0 },
  'MeporeManual': { main: 'CWC', target: 6.0 },
  'MefixAuto': { main: 'CWC', target: 6.0 },
  'MefixManual': { main: 'CWC', target: 6.0 },
};

const MAIN_TARGETS = { Gown: 3.1, Drape: 3.1, CWC: 6.0 };
const MAIN_ORDER = ['Gown', 'Drape', 'CWC'];

function resolveGroup(pgName) {
  if (!pgName) return { main: pgName, target: null };
  if (GROUP_MAP[pgName]) return GROUP_MAP[pgName];
  const key = Object.keys(GROUP_MAP).find(
    (k) => k.toLowerCase() === pgName.toLowerCase()
  );
  return key ? GROUP_MAP[key] : { main: pgName, target: null };
}

function aggregateToSubGroups(rows) {
  const subMap = {};

  rows.forEach((r) => {
    const pg = r.product_group_name;
    if (!subMap[pg]) subMap[pg] = { shifts: {}, totalEff: 0, totalCount: 0 };
    const s = subMap[pg];
    const eff = r.avg_dl_eff != null ? Number(r.avg_dl_eff) : null;
    if (eff !== null) { s.totalEff += eff; s.totalCount++; }
    s.shifts[r.shift_code] = eff != null ? Math.round(eff * 100) / 100 : null;
  });

  return Object.entries(subMap).map(([pg, s]) => {
    const { main, target } = resolveGroup(pg);
    const dlEff = s.totalCount > 0 ? Math.round((s.totalEff / s.totalCount) * 100) / 100 : null;
    return {
      subGroup: pg,
      mainGroup: main,
      target,
      dlEff,
      meetsTarget: dlEff !== null && target !== null ? dlEff >= target : null,
      shifts: Object.entries(s.shifts)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([shift, dlEff]) => ({ shift, dlEff })),
    };
  });
}

const getOverview = async (req, res, next) => {
  try {
    const errors = validateDateRangeQuery(req.query);
    if (errors.length) return res.status(400).json({ error: errors.join('; ') });

    const { dateFrom, dateTo, shift } = req.query;
    const pool = getPool();
    const result = await pool.request()
      .input('dateFrom', sql.Date, dateFrom || null)
      .input('dateTo', sql.Date, dateTo || null)
      .input('shift', sql.Char(1), shift || null)
      .execute('sp_get_dl_eff_overview');

    const subGroups = aggregateToSubGroups(result.recordset);

    const mainMap = {};
    MAIN_ORDER.forEach((m) => {
      mainMap[m] = { group: m, target: MAIN_TARGETS[m], subGroups: [], totalEff: 0, totalCount: 0 };
    });

    subGroups.forEach((sg) => {
      const main = sg.mainGroup;
      if (!mainMap[main]) {
        mainMap[main] = { group: main, target: null, subGroups: [], totalEff: 0, totalCount: 0 };
      }
      mainMap[main].subGroups.push(sg);
      if (sg.dlEff !== null) { mainMap[main].totalEff += sg.dlEff; mainMap[main].totalCount++; }
    });

    const data = MAIN_ORDER.map((m) => {
      const mg = mainMap[m];
      const dlEff = mg.totalCount > 0 ? Math.round((mg.totalEff / mg.totalCount) * 100) / 100 : null;
      return {
        group: mg.group,
        target: mg.target,
        dlEff,
        meetsTarget: dlEff !== null && mg.target !== null ? dlEff >= mg.target : null,
        subGroups: mg.subGroups,
      };
    });

    res.json({ data });
  } catch (err) { next(err); }
};

const getDetail = async (req, res, next) => {
  try {
    const errors = validateDateRangeQuery(req.query);
    if (errors.length) return res.status(400).json({ error: errors.join('; ') });

    const { dateFrom, dateTo, shift, productGroup } = req.query;
    const pool = getPool();
    const result = await pool.request()
      .input('dateFrom', sql.Date, dateFrom || null)
      .input('dateTo', sql.Date, dateTo || null)
      .input('shift', sql.Char(1), shift || null)
      .input('productGroup', sql.VarChar(50), productGroup || null)
      .execute('sp_get_dl_eff_detail');

    // topReasons is always empty — the current schema has no loss-reason breakdown table.
    res.json({ data: result.recordset, topReasons: [] });
  } catch (err) { next(err); }
};

const getFilters = async (req, res, next) => {
  try {
    const pool = getPool();
    const result = await pool.request().execute('sp_get_dl_eff_filters');
    const [shifts, groups] = result.recordsets;
    res.json({
      shifts: shifts.map((r) => r.val),
      productGroups: groups.map((r) => r.val),
    });
  } catch (err) { next(err); }
};

module.exports = { getOverview, getDetail, getFilters };
