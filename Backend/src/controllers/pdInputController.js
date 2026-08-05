/**
 * pdInputController.js
 *
 * CRUD สำหรับ production record โดยใช้ schema ใหม่:
 *
 *   READ   → vw_oee_productivity  (view รวมทุก field พร้อม dl_eff_percent)
 *   CREATE → EXEC sp_add_production_record  (SP handle FK lookup + refresh summary)
 *   UPDATE → UPDATE fact_production_record  (แก้ field ที่ user กรอก)
 *   DELETE → DELETE fact_production_record
 *
 *   Master dropdown (ใน modal) :
 *     GET /master/machines  → dim_machine   (machine_code, oee_target)
 *     GET /master/products  → dim_product JOIN dim_product_group
 *                             (product_code, group, mc_speed, capacity)
 *     GET /master/shifts    → dim_shift
 */

const { sql, getPool } = require('../config/db');

/* ── server-side validation ─────────────────────────────────────── */
function validateBody(body) {
  const errors = [];
  const REQUIRED = [
    'production_date', 'shift_code', 'machine_code', 'product_code',
    'machine_run_time', 'std_hc', 'std_hour', 'hour_piece_rate',
    'actual_output', 'actual_hc', 'loss_hour',
  ];
  REQUIRED.forEach((k) => {
    if (body[k] == null || body[k] === '') errors.push(`${k} is required`);
  });
  const today = new Date().toISOString().slice(0, 10);
  if (body.production_date && body.production_date > today)
    errors.push('production_date cannot be in the future');
  if (body.shift_code && !['A', 'B', 'C'].includes(body.shift_code))
    errors.push('shift_code must be A, B, or C');
  const rng = (k, lo, hi) => {
    const v = Number(body[k]);
    if (body[k] != null && body[k] !== '' && (isNaN(v) || v < lo || v > hi))
      errors.push(`${k} must be ${lo}–${hi}`);
  };
  rng('machine_run_time', 0, 24);
  rng('std_hc', 0, 25);
  rng('std_hour', 0, 99);
  rng('hour_piece_rate', 0, 99999);
  rng('actual_output', 0, 9999999999);
  rng('actual_hc', 0, 25);
  rng('loss_hour', 0, 13);
  rng('actual_bulk_hr', 0, 13);
  rng('actual_pallet_hr', 0, 13);
  rng('actual_assist_hr', 0, 13);
  return errors;
}

/* ═══════════════════════════════════════════════════════════════════
   GET /api/pd-input
   ─────────────────────────────────────────────────────────────────
   ดึง record จาก vw_oee_productivity
   รองรับ filter: dateFrom, dateTo, shift, productGroup, productCode
   และ pagination: page (default 1), pageSize (default 100)
═══════════════════════════════════════════════════════════════════ */
const getAll = async (req, res, next) => {
  try {
    const { dateFrom, dateTo, shift, productGroup, productCode, page = 1, pageSize = 100 } = req.query;

    const conditions = [];
    const pool = getPool();
    const request = pool.request();

    if (dateFrom) { conditions.push('production_date >= @dateFrom'); request.input('dateFrom', sql.Date, dateFrom); }
    if (dateTo) { conditions.push('production_date <= @dateTo'); request.input('dateTo', sql.Date, dateTo); }
    if (shift) { conditions.push('shift_code = @shift'); request.input('shift', sql.Char(1), shift); }
    if (productGroup) { conditions.push('product_group_name = @productGroup'); request.input('productGroup', sql.VarChar(50), productGroup); }
    if (productCode) { conditions.push('product_code = @productCode'); request.input('productCode', sql.VarChar(30), productCode); }

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
    const offset = (Number(page) - 1) * Number(pageSize);
    request.input('offset', sql.Int, offset);
    request.input('pageSize', sql.Int, Number(pageSize));

    const result = await request.query(`
      SELECT
        record_id, production_date, shift_code, machine_code,
        product_group_name, product_code, product_description,
        mc_speed_pcs_hr, capacity_pcs_hr, oee_target,
        machine_run_time, std_hc, std_hour, hour_piece_rate,
        actual_output, loss_hour, actual_bulk_hr, actual_pallet_hr,
        actual_assist_hr, actual_hc,
        cal_output_at_oee, std_output,
        productivity_std_pcs_mh, actual_hour, total_loss_hour,
        productivity_ac_pcs_mh,
        ROUND(dl_eff_percent, 2) AS dl_eff_percent,
        is_undone, entry_datetime
      FROM vw_oee_productivity
      ${where}
      ORDER BY production_date DESC, record_id DESC
      OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY
    `);

    /* total count (ใช้ request ใหม่เพื่อ re-bind param) */
    const cntReq = pool.request();
    if (dateFrom) cntReq.input('dateFrom', sql.Date, dateFrom);
    if (dateTo) cntReq.input('dateTo', sql.Date, dateTo);
    if (shift) cntReq.input('shift', sql.Char(1), shift);
    if (productGroup) cntReq.input('productGroup', sql.VarChar(50), productGroup);
    if (productCode) cntReq.input('productCode', sql.VarChar(30), productCode);

    const cntResult = await cntReq.query(`SELECT COUNT(*) AS total FROM vw_oee_productivity ${where}`);

    res.json({
      data: result.recordset,
      total: cntResult.recordset[0].total,
      page: Number(page),
      pageSize: Number(pageSize),
    });
  } catch (err) { next(err); }
};

/* ═══════════════════════════════════════════════════════════════════
   GET /api/pd-input/master/machines
   ─────────────────────────────────────────────────────────────────
   ดึง dim_machine ทั้งหมด → ใช้ populate dropdown "เลือกเครื่อง" ใน modal
   ส่งคืน machine_code + oee_target (auto-fill ใน form)
═══════════════════════════════════════════════════════════════════ */
const getMachines = async (req, res, next) => {
  try {
    const pool = getPool();
    const result = await pool.request().query(`
      SELECT machine_id, machine_code, oee_target
      FROM dim_machine
      WHERE is_active = 1
      ORDER BY machine_code
    `);
    res.json({ data: result.recordset });
  } catch (err) { next(err); }
};

/* ═══════════════════════════════════════════════════════════════════
   GET /api/pd-input/master/products
   ─────────────────────────────────────────────────────────────────
   ดึง dim_product JOIN dim_product_group → ใช้ populate dropdown "เลือก product"
   พอ user เลือก product_code → frontend auto-fill:
     mc_speed_pcs_hr, capacity_pcs_hr, product_group_name
═══════════════════════════════════════════════════════════════════ */
const getProducts = async (req, res, next) => {
  try {
    const pool = getPool();
    const result = await pool.request().query(`
      SELECT
        p.product_id,
        p.product_code,
        p.product_description,
        p.mc_speed_pcs_hr,
        p.capacity_pcs_hr,
        pg.product_group_name
      FROM dim_product p
      JOIN dim_product_group pg ON pg.product_group_id = p.product_group_id
      WHERE p.is_active = 1
      ORDER BY pg.product_group_name, p.product_code
    `);
    res.json({ data: result.recordset });
  } catch (err) { next(err); }
};

/* ═══════════════════════════════════════════════════════════════════
   GET /api/pd-input/master/shifts
   ─────────────────────────────────────────────────────────────────
   ดึง dim_shift → ใช้ populate dropdown shift ใน modal
═══════════════════════════════════════════════════════════════════ */
const getShifts = async (req, res, next) => {
  try {
    const pool = getPool();
    const result = await pool.request().query(`
      SELECT shift_code, shift_name, start_time, end_time
      FROM dim_shift
      ORDER BY shift_code
    `);
    res.json({ data: result.recordset });
  } catch (err) { next(err); }
};

/* ═══════════════════════════════════════════════════════════════════
   GET /api/pd-input/filters
   ─────────────────────────────────────────────────────────────────
   Distinct values สำหรับ filter bar ใน list page
   (ดึงจาก fact_production_record เพื่อแสดงเฉพาะที่มีข้อมูลจริง)
═══════════════════════════════════════════════════════════════════ */
const getFilters = async (req, res, next) => {
  try {
    const pool = getPool();
    const [shifts, groups, codes] = await Promise.all([
      pool.request().query(`
        SELECT DISTINCT s.shift_code AS val, s.shift_name
        FROM fact_production_record f
        JOIN dim_shift s ON s.shift_code = f.shift_code
        ORDER BY val
      `),
      pool.request().query(`
        SELECT DISTINCT pg.product_group_name AS val
        FROM fact_production_record f
        JOIN dim_product p  ON p.product_id = f.product_id
        JOIN dim_product_group pg ON pg.product_group_id = p.product_group_id
        ORDER BY val
      `),
      pool.request().query(`
        SELECT DISTINCT p.product_code AS val
        FROM fact_production_record f
        JOIN dim_product p ON p.product_id = f.product_id
        ORDER BY val
      `),
    ]);
    res.json({
      shifts: shifts.recordset.map((r) => ({ code: r.val, name: r.shift_name })),
      productGroups: groups.recordset.map((r) => r.val),
      productCodes: codes.recordset.map((r) => r.val),
    });
  } catch (err) { next(err); }
};

/* ═══════════════════════════════════════════════════════════════════
   POST /api/pd-input
   ─────────────────────────────────────────────────────────────────
   เรียก sp_add_production_record ซึ่ง:
     1. Lookup machine → ดึง oee_target
     2. Lookup product → ดึง mc_speed, capacity
     3. Validate machine-product-group mapping
     4. INSERT fact_production_record
     5. EXEC sp_refresh_daily_summary สำหรับวันนั้น

   Field ที่ user กรอกใน modal:
     production_date, shift_code, machine_code, product_code,
     machine_run_time, std_hc, std_hour, hour_piece_rate,
     actual_output, loss_hour, actual_hc
     (actual_bulk_hr, actual_pallet_hr, actual_assist_hr optional)

   Field ที่ auto-fill จาก master (ไม่ต้องส่งมา — SP จัดการเอง):
     mc_speed_pcs_hr, capacity_pcs_hr, oee_target
═══════════════════════════════════════════════════════════════════ */
const create = async (req, res, next) => {
  try {
    const errs = validateBody(req.body);
    if (errs.length) return res.status(400).json({ error: errs.join('; ') });

    const {
      production_date, shift_code, machine_code, product_code,
      machine_run_time, std_hc, std_hour, hour_piece_rate,
      actual_output, loss_hour, actual_hc,
      actual_bulk_hr = 0, actual_pallet_hr = 0, actual_assist_hr = 0,
      created_by = null,
    } = req.body;

    const pool = getPool();
    await pool.request()
      .input('production_date', sql.Date, production_date)
      .input('shift_code', sql.Char(1), shift_code)
      .input('machine_code', sql.VarChar(30), machine_code)
      .input('product_code', sql.VarChar(30), product_code)
      .input('machine_run_time', sql.Decimal(4, 1), machine_run_time)
      .input('std_hc', sql.Decimal(5, 2), std_hc)
      .input('std_hour', sql.Decimal(5, 2), std_hour)
      .input('hour_piece_rate', sql.Decimal(6, 2), hour_piece_rate)
      .input('actual_output', sql.BigInt, actual_output)
      .input('loss_hour', sql.Decimal(5, 2), loss_hour)
      .input('actual_bulk_hr', sql.Decimal(5, 2), actual_bulk_hr)
      .input('actual_pallet_hr', sql.Decimal(5, 2), actual_pallet_hr)
      .input('actual_assist_hr', sql.Decimal(5, 2), actual_assist_hr)
      .input('actual_hc', sql.Int, actual_hc)
      .input('source_system', sql.VarChar(20), 'API')
      .input('created_by', sql.VarChar(50), created_by)
      .query(`
        EXEC sp_add_production_record
          @production_date  = @production_date,
          @shift_code       = @shift_code,
          @machine_code     = @machine_code,
          @product_code     = @product_code,
          @machine_run_time = @machine_run_time,
          @std_hc           = @std_hc,
          @std_hour         = @std_hour,
          @hour_piece_rate  = @hour_piece_rate,
          @actual_output    = @actual_output,
          @loss_hour        = @loss_hour,
          @actual_bulk_hr   = @actual_bulk_hr,
          @actual_pallet_hr = @actual_pallet_hr,
          @actual_assist_hr = @actual_assist_hr,
          @actual_hc        = @actual_hc,
          @source_system    = @source_system,
          @created_by       = @created_by
      `);

    res.status(201).json({ message: 'Created successfully' });
  } catch (err) { next(err); }
};

/* ═══════════════════════════════════════════════════════════════════
   PUT /api/pd-input/:id
   ─────────────────────────────────────────────────────────────────
   UPDATE fact_production_record ตรงๆ
   แก้ได้เฉพาะ field ที่ user กรอก (ไม่รวม computed columns)
   หลัง update → เรียก sp_refresh_daily_summary เพื่ออัปเดต summary
═══════════════════════════════════════════════════════════════════ */
const update = async (req, res, next) => {
  try {
    const errs = validateBody(req.body);
    if (errs.length) return res.status(400).json({ error: errs.join('; ') });

    const { id } = req.params;
    const {
      production_date, shift_code, machine_run_time, std_hc, std_hour,
      hour_piece_rate, actual_output, loss_hour, actual_hc,
      actual_bulk_hr = 0, actual_pallet_hr = 0, actual_assist_hr = 0,
      updated_by = null,
    } = req.body;

    const pool = getPool();
    const result = await pool.request()
      .input('id', sql.BigInt, Number(id))
      .input('production_date', sql.Date, production_date)
      .input('shift_code', sql.Char(1), shift_code)
      .input('machine_run_time', sql.Decimal(4, 1), machine_run_time)
      .input('std_hc', sql.Decimal(5, 2), std_hc)
      .input('std_hour', sql.Decimal(5, 2), std_hour)
      .input('hour_piece_rate', sql.Decimal(6, 2), hour_piece_rate)
      .input('actual_output', sql.BigInt, actual_output)
      .input('loss_hour', sql.Decimal(5, 2), loss_hour)
      .input('actual_bulk_hr', sql.Decimal(5, 2), actual_bulk_hr)
      .input('actual_pallet_hr', sql.Decimal(5, 2), actual_pallet_hr)
      .input('actual_assist_hr', sql.Decimal(5, 2), actual_assist_hr)
      .input('actual_hc', sql.Int, actual_hc)
      .input('updated_by', sql.VarChar(50), updated_by)
      .query(`
        UPDATE fact_production_record SET
          production_date  = @production_date,
          shift_code       = @shift_code,
          machine_run_time = @machine_run_time,
          std_hc           = @std_hc,
          std_hour         = @std_hour,
          hour_piece_rate  = @hour_piece_rate,
          actual_output    = @actual_output,
          loss_hour        = @loss_hour,
          actual_bulk_hr   = @actual_bulk_hr,
          actual_pallet_hr = @actual_pallet_hr,
          actual_assist_hr = @actual_assist_hr,
          actual_hc        = @actual_hc,
          updated_by       = @updated_by,
          updated_at       = GETDATE()
        WHERE record_id = @id
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }

    /* refresh daily summary สำหรับวันที่แก้ไข */
    await pool.request()
      .input('d', sql.Date, production_date)
      .query(`EXEC sp_refresh_daily_summary @date_from = @d, @date_to = @d`);

    res.json({ message: 'Updated successfully' });
  } catch (err) { next(err); }
};

/* ═══════════════════════════════════════════════════════════════════
   DELETE /api/pd-input/:id
   ─────────────────────────────────────────────────────────────────
   ลบจาก fact_production_record (ลบ record จริง)
   หรือจะ soft-delete โดยเปลี่ยน is_undone = 1 แทน → comment สลับด้านล่าง
═══════════════════════════════════════════════════════════════════ */
const remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pool = getPool();

    /* === HARD DELETE (default) === */
    const result = await pool.request()
      .input('id', sql.BigInt, Number(id))
      .query(`DELETE FROM fact_production_record WHERE record_id = @id`);

    /* === SOFT DELETE (สลับถ้าต้องการเก็บประวัติ) ===
    const result = await pool.request()
      .input('id', sql.BigInt, Number(id))
      .query(`UPDATE fact_production_record SET is_undone = 1, updated_at = GETDATE() WHERE record_id = @id`);
    */

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }
    res.json({ message: 'Deleted successfully' });
  } catch (err) { next(err); }
};

/* ═══════════════════════════════════════════════════════════════════
   GET /api/pd-input/export   → CSV download (all filtered rows, no pagination)
═══════════════════════════════════════════════════════════════════ */
const exportCsv = async (req, res, next) => {
  try {
    const { dateFrom, dateTo, shift, productGroup, productCode } = req.query;
    const conditions = [];
    const pool = getPool();
    const request = pool.request();

    if (dateFrom) { conditions.push('production_date >= @dateFrom'); request.input('dateFrom', sql.Date, dateFrom); }
    if (dateTo) { conditions.push('production_date <= @dateTo'); request.input('dateTo', sql.Date, dateTo); }
    if (shift) { conditions.push('shift_code = @shift'); request.input('shift', sql.Char(1), shift); }
    if (productGroup) { conditions.push('product_group_name = @productGroup'); request.input('productGroup', sql.VarChar(50), productGroup); }
    if (productCode) { conditions.push('product_code = @productCode'); request.input('productCode', sql.VarChar(30), productCode); }

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
    const result = await request.query(`
      SELECT
        record_id, production_date, shift_code, machine_code,
        product_group_name, product_code, product_description,
        mc_speed_pcs_hr, oee_target,
        machine_run_time, std_hc, std_hour, hour_piece_rate,
        actual_output, loss_hour, actual_bulk_hr, actual_pallet_hr, actual_assist_hr, actual_hc,
        cal_output_at_oee, std_output,
        productivity_std_pcs_mh, actual_hour, productivity_ac_pcs_mh,
        ROUND(dl_eff_percent, 2) AS dl_eff_percent,
        entry_datetime
      FROM vw_oee_productivity
      ${where}
      ORDER BY production_date DESC, record_id DESC
    `);

    const rows = result.recordset;
    if (!rows.length) return res.status(404).json({ error: 'No data to export' });

    const headers = Object.keys(rows[0]);
    const escape = (v) => {
      if (v == null) return '';
      const s = String(v);
      return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const csv = [headers.join(','), ...rows.map((r) => headers.map((h) => escape(r[h])).join(','))].join('\r\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="pd_records_${new Date().toISOString().slice(0, 10)}.csv"`);
    res.send('﻿' + csv); // BOM for Excel UTF-8 compat
  } catch (err) { next(err); }
};

module.exports = { getAll, getMachines, getProducts, getShifts, getFilters, create, update, remove, exportCsv };
