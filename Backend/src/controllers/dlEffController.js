/**
 * dlEffController.js
 *
 * ใช้ข้อมูลจาก schema ใหม่:
 *   - vw_oee_productivity  : view รวมทุก field + dl_eff_percent (คำนวณไว้แล้ว)
 *   - dim_shift            : master shift
 *   - dim_product_group    : master product group
 *
 * product_group_name (จาก dim_product_group) map ไปหา main group (Gown/Drape/CWC)
 * ผ่าน GROUP_MAP ด้านล่าง  →  เพิ่ม/แก้ mapping ตรงนี้เมื่อมี product group ใหม่
 */

const { sql, getPool } = require('../config/db');

/* ─── product group mapping ─────────────────────────────────────────
   key   = product_group_name ใน dim_product_group (ตรงตัว / case-insensitive)
   value = { main: 'Gown'|'Drape'|'CWC', target: DL Eff % target }
─────────────────────────────────────────────────────────────────── */
const GROUP_MAP = {
  'CLSP':        { main: 'Gown',  target: 3.1 },
  'CLHP':        { main: 'Gown',  target: 3.1 },
  'FPP':         { main: 'Gown',  target: 3.1 },
  'Blueline':    { main: 'Gown',  target: 3.1 },
  'Urology':     { main: 'Gown',  target: 3.1 },
  'Armsleeve':   { main: 'Gown',  target: 3.1 },
  'Autodrape':   { main: 'Drape', target: 3.1 },
  'Manualdrape': { main: 'Drape', target: 3.1 },
  'MeporeAuto':  { main: 'CWC',   target: 6.0 },
  'MeporeManual':{ main: 'CWC',   target: 6.0 },
  'MefixAuto':   { main: 'CWC',   target: 6.0 },
  'MefixManual': { main: 'CWC',   target: 6.0 },
};

const MAIN_TARGETS = { Gown: 3.1, Drape: 3.1, CWC: 6.0 };
const MAIN_ORDER = ['Gown', 'Drape', 'CWC'];

/** หา main group จาก product_group_name (case-insensitive fallback) */
function resolveGroup(pgName) {
  if (!pgName) return { main: pgName, target: null };
  if (GROUP_MAP[pgName]) return GROUP_MAP[pgName];
  const key = Object.keys(GROUP_MAP).find(
    (k) => k.toLowerCase() === pgName.toLowerCase()
  );
  return key ? GROUP_MAP[key] : { main: pgName, target: null };
}

/* ─── shared WHERE builder ──────────────────────────────────────── */
function buildWhere(query) {
  const { dateFrom, dateTo, shift } = query;
  const conditions = [];
  const inputs = [];

  if (dateFrom) {
    conditions.push('production_date >= @dateFrom');
    inputs.push({ name: 'dateFrom', type: sql.Date, value: dateFrom });
  }
  if (dateTo) {
    conditions.push('production_date <= @dateTo');
    inputs.push({ name: 'dateTo', type: sql.Date, value: dateTo });
  }
  if (shift) {
    conditions.push('shift_code = @shift');
    inputs.push({ name: 'shift', type: sql.Char(1), value: shift });
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

/* ─── aggregate helper ──────────────────────────────────────────── */
/**
 * rows: [{ product_group_name, shift_code, avg_dl_eff }]
 * ส่งคืน array ของ subGroup object พร้อม shifts[] และ main group info
 */
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

/* ═══════════════════════════════════════════════════════════════════
   GET /api/dl-eff/overview
   ─────────────────────────────────────────────────────────────────
   รวม dl_eff_percent เฉลี่ยต่อ product_group + shift
   จาก vw_oee_productivity (view คำนวณ dl_eff_percent ไว้แล้ว)
   ส่งคืน array ของ main group (Gown/Drape/CWC) แต่ละอันมี subGroups[]
═══════════════════════════════════════════════════════════════════ */
const getOverview = async (req, res, next) => {
  try {
    const pool = getPool();
    const { where, inputs } = buildWhere(req.query);

    const result = await applyInputs(pool.request(), inputs).query(`
      SELECT
        product_group_name,
        shift_code,
        ROUND(AVG(dl_eff_percent), 2) AS avg_dl_eff
      FROM vw_oee_productivity
      ${where}
      GROUP BY product_group_name, shift_code
      ORDER BY product_group_name, shift_code
    `);

    const subGroups = aggregateToSubGroups(result.recordset);

    /* สร้าง main group structure (Gown / Drape / CWC) */
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

/* ═══════════════════════════════════════════════════════════════════
   GET /api/dl-eff/detail
   ─────────────────────────────────────────────────────────────────
   รายแถว จาก vw_oee_productivity
   filter เพิ่มด้วย ?productGroup=CLSP
   ส่งคืน { data[], topReasons: [] }  (topReasons ว่างเสมอ — schema ใหม่ไม่มี breakdown)
═══════════════════════════════════════════════════════════════════ */
const getDetail = async (req, res, next) => {
  try {
    const pool = getPool();
    const { where, inputs } = buildWhere(req.query);
    const { productGroup } = req.query;

    let pgClause = '';
    if (productGroup) {
      pgClause = where ? ' AND product_group_name = @productGroup'
        : ' WHERE product_group_name = @productGroup';
      inputs.push({ name: 'productGroup', type: sql.VarChar(50), value: productGroup });
    }

    const result = await applyInputs(pool.request(), inputs).query(`
      SELECT
        record_id             AS ID,
        production_date       AS PRODUCTION_DATE,
        shift_code            AS SHIFT,
        machine_code          AS MACHINE,
        product_group_name    AS PRODUCT_GROUP,
        product_code          AS PRODUCT_CODE,
        product_description   AS PRODUCT_DESC,
        actual_hc             AS ACTUAL_HC,
        std_hc                AS STD_HC,
        machine_run_time      AS MC_RUN_TIME,
        std_hour              AS STD_HOUR,
        hour_piece_rate       AS HOUR_PIECE_RATE,
        loss_hour             AS LOSS_HOUR,
        actual_bulk_hr        AS ACTUAL_BULK,
        actual_pallet_hr      AS ACTUAL_PALLET,
        actual_assist_hr      AS ACTUAL_ASSIST,
        actual_output         AS ACTUAL_OUTPUT,
        productivity_std_pcs_mh,
        productivity_ac_pcs_mh,
        ROUND(dl_eff_percent, 2) AS dlEff
      FROM vw_oee_productivity
      ${where}${pgClause}
      ORDER BY production_date DESC, shift_code
    `);

    res.json({ data: result.recordset, topReasons: [] });
  } catch (err) { next(err); }
};

/* ═══════════════════════════════════════════════════════════════════
   GET /api/dl-eff/filters
   ─────────────────────────────────────────────────────────────────
   Distinct shifts จาก dim_shift, product groups จาก dim_product_group
   ใช้ populate filter dropdowns ใน frontend
═══════════════════════════════════════════════════════════════════ */
const getFilters = async (req, res, next) => {
  try {
    const pool = getPool();
    const [shifts, groups] = await Promise.all([
      pool.request().query(`SELECT shift_code AS val FROM dim_shift ORDER BY shift_code`),
      pool.request().query(`SELECT product_group_name AS val FROM dim_product_group ORDER BY product_group_name`),
    ]);
    res.json({
      shifts: shifts.recordset.map((r) => r.val),
      productGroups: groups.recordset.map((r) => r.val),
    });
  } catch (err) { next(err); }
};

module.exports = { getOverview, getDetail, getFilters };
