const { sql, getPool } = require('../config/db');
const { notifyDataChanged } = require('../realtime');
const { isDuplicate, fkViolationResponse } = require('../utils/crudHelpers');

/* ── server-side validation ─────────────────────────────────────── */

function validateBody(body) {
  const errors = [];

  const REQUIRED = [
    'product_code',
    'product_group_id',
    'is_active',
  ];

  REQUIRED.forEach((k) => {
    if (body[k] == null || body[k] === '') {
      errors.push(`${k} is required`);
    }
  });

  if (body.capacity_pcs_hr != null && body.capacity_pcs_hr !== '') {
    const value = Number(body.capacity_pcs_hr);
    if (isNaN(value) || value < 0) {
      errors.push('capacity_pcs_hr must be a positive number');
    }
  }

  if (body.mc_speed_pcs_hr != null && body.mc_speed_pcs_hr !== '') {
    const value = Number(body.mc_speed_pcs_hr);
    if (isNaN(value) || value < 0) {
      errors.push('mc_speed_pcs_hr must be a positive number');
    }
  }

  if (
    body.is_active != null &&
    ![0, 1, true, false].includes(body.is_active)
  ) {
    errors.push('is_active must be 0 or 1');
  }

  return errors;
}


/* ═══════════════════════════════════════════════════════════════════
   GET /api/product
═══════════════════════════════════════════════════════════════════ */

const getAllProducts = async (req, res, next) => {
  try {
    const pool = getPool();

    const result = await pool.request().query(`
      SELECT
        p.product_id,
        p.product_code,
        p.product_description,
        p.product_group_id,
        pg.product_group_name,
        p.capacity_pcs_hr,
        p.mc_speed_pcs_hr,
        p.is_active,
        p.updated_at
      FROM dim_product p
      JOIN dim_product_group pg ON pg.product_group_id = p.product_group_id
      ORDER BY p.updated_at DESC, p.product_id DESC
    `);

    res.json({
      data: result.recordset,
    });

  } catch (err) {
    next(err);
  }
};


/* ═══════════════════════════════════════════════════════════════════
   GET /api/product/:id
═══════════════════════════════════════════════════════════════════ */

const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const pool = getPool();

    const result = await pool.request()
      .input('id', sql.Int, Number(id))
      .query(`
        SELECT
          p.product_id,
          p.product_code,
          p.product_description,
          p.product_group_id,
          pg.product_group_name,
          p.capacity_pcs_hr,
          p.mc_speed_pcs_hr,
          p.is_active,
          p.updated_at
        FROM dim_product p
        JOIN dim_product_group pg ON pg.product_group_id = p.product_group_id
        WHERE p.product_id = @id
      `);

    if (!result.recordset.length) {
      return res.status(404).json({
        error: 'Product not found',
      });
    }

    res.json({
      data: result.recordset[0],
    });

  } catch (err) {
    next(err);
  }
};


/* ═══════════════════════════════════════════════════════════════════
   POST /api/product
═══════════════════════════════════════════════════════════════════ */

const createProduct = async (req, res, next) => {
  try {
    const errs = validateBody(req.body);

    if (errs.length) {
      return res.status(400).json({
        error: errs.join('; '),
      });
    }

    const {
      product_code,
      product_group_id,
      product_description = null,
      capacity_pcs_hr = null,
      mc_speed_pcs_hr = null,
      is_active,
    } = req.body;

    const pool = getPool();

    /* เช็ก product_code ซ้ำ */
    const duplicate = await isDuplicate(pool, {
      table: 'dim_product',
      idColumn: 'product_id',
      column: 'product_code',
      varcharLen: 30,
      value: product_code,
    });

    if (duplicate) {
      return res.status(409).json({
        error: 'product_code already exists',
      });
    }

    const result = await pool.request()
      .input('product_code', sql.VarChar(30), product_code)
      .input('product_group_id', sql.Int, Number(product_group_id))
      .input('product_description', sql.VarChar(200), product_description || null)
      .input('capacity_pcs_hr', sql.Decimal(10, 2), capacity_pcs_hr === '' ? null : capacity_pcs_hr)
      .input('mc_speed_pcs_hr', sql.Decimal(10, 2), mc_speed_pcs_hr === '' ? null : mc_speed_pcs_hr)
      .input('is_active', sql.Bit, is_active)
      .query(`
        INSERT INTO dim_product (
          product_code,
          product_group_id,
          product_description,
          capacity_pcs_hr,
          mc_speed_pcs_hr,
          is_active,
          updated_at
        )
        OUTPUT INSERTED.*
        VALUES (
          @product_code,
          @product_group_id,
          @product_description,
          @capacity_pcs_hr,
          @mc_speed_pcs_hr,
          @is_active,
          SYSUTCDATETIME()
        )
      `);

    notifyDataChanged('product-data');

    res.status(201).json({
      message: 'Created successfully',
      data: result.recordset[0],
    });

  } catch (err) {
    next(err);
  }
};


/* ═══════════════════════════════════════════════════════════════════
   PUT /api/product/:id
═══════════════════════════════════════════════════════════════════ */

const updateProduct = async (req, res, next) => {
  try {
    const errs = validateBody(req.body);

    if (errs.length) {
      return res.status(400).json({
        error: errs.join('; '),
      });
    }

    const { id } = req.params;

    const {
      product_code,
      product_group_id,
      product_description = null,
      capacity_pcs_hr = null,
      mc_speed_pcs_hr = null,
      is_active,
    } = req.body;

    const pool = getPool();

    /* เช็ก product_code ซ้ำกับสินค้าตัวอื่น */
    const duplicate = await isDuplicate(pool, {
      table: 'dim_product',
      idColumn: 'product_id',
      column: 'product_code',
      varcharLen: 30,
      value: product_code,
      excludeId: Number(id),
    });

    if (duplicate) {
      return res.status(409).json({
        error: 'product_code already exists',
      });
    }

    const result = await pool.request()
      .input('id', sql.Int, Number(id))
      .input('product_code', sql.VarChar(30), product_code)
      .input('product_group_id', sql.Int, Number(product_group_id))
      .input('product_description', sql.VarChar(200), product_description || null)
      .input('capacity_pcs_hr', sql.Decimal(10, 2), capacity_pcs_hr === '' ? null : capacity_pcs_hr)
      .input('mc_speed_pcs_hr', sql.Decimal(10, 2), mc_speed_pcs_hr === '' ? null : mc_speed_pcs_hr)
      .input('is_active', sql.Bit, is_active)
      .query(`
        UPDATE dim_product
        SET
          product_code = @product_code,
          product_group_id = @product_group_id,
          product_description = @product_description,
          capacity_pcs_hr = @capacity_pcs_hr,
          mc_speed_pcs_hr = @mc_speed_pcs_hr,
          is_active = @is_active,
          updated_at = SYSUTCDATETIME()
        WHERE product_id = @id
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({
        error: 'Product not found',
      });
    }

    notifyDataChanged('product-data');

    res.json({
      message: 'Updated successfully',
    });

  } catch (err) {
    next(err);
  }
};


/* ═══════════════════════════════════════════════════════════════════
   DELETE /api/product/:id
═══════════════════════════════════════════════════════════════════ */

const removeProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const pool = getPool();

    const result = await pool.request()
      .input('id', sql.Int, Number(id))
      .query(`
        DELETE FROM dim_product
        WHERE product_id = @id
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({
        error: 'Product not found',
      });
    }

    notifyDataChanged('product-data');

    res.json({
      message: 'Deleted successfully',
    });

  } catch (err) {
    if (err.number === 547) {
      return fkViolationResponse(res, 'Cannot delete: product is referenced by existing production records');
    }
    next(err);
  }
};


module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  removeProduct,
};
