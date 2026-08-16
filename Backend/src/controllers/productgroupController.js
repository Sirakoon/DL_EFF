const { sql, getPool } = require('../config/db');
const { notifyDataChanged } = require('../realtime');

/* ── server-side validation ─────────────────────────────────────── */

function validateBody(body) {
  const errors = [];

  const REQUIRED = [
    'product_group_name'
  ];

  REQUIRED.forEach((k) => {
    if (body[k] == null || body[k] === '') {
      errors.push(`${k} is required`);
    }
  });

  return errors;
}


/* ═══════════════════════════════════════════════════════════════════
   GET /api/product-group
═══════════════════════════════════════════════════════════════════ */


const getAllProductGroups = async (req, res, next) => {
  try {
    const pool = getPool();

    const result = await pool.request().query(`
      SELECT product_group_id, product_group_name
      FROM dim_product_group
      ORDER BY product_group_name
    `);

    res.json({
      data: result.recordset,
    });

  } catch (err) {
    next(err);
  }
};


/* ═══════════════════════════════════════════════════════════════════
   GET /api/product-group/:id
═══════════════════════════════════════════════════════════════════ */

const getProductGroupById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const pool = getPool();

    const result = await pool.request()
      .input('id', sql.Int, Number(id))
      .query(`
        SELECT
          product_group_id,
          product_group_name
        FROM dim_product_group
        WHERE product_group_id = @id
      `);

    if (!result.recordset.length) {
      return res.status(404).json({
        error: 'Product Group not found',
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
   POST /api/product-group
═══════════════════════════════════════════════════════════════════ */

const createProductGroup = async (req, res, next) => {
  try {
    const errs = validateBody(req.body);

    if (errs.length) {
      return res.status(400).json({
        error: errs.join('; '),
      });
    }

    const {
      product_group_name
    } = req.body;

    const pool = getPool();

    /* เช็ก product_group_name ซ้ำ */
    const duplicate = await pool.request()
      .input('product_group_name', sql.VarChar(50), product_group_name)
      .query(`
        SELECT product_group_id
        FROM dim_product_group
        WHERE product_group_name = @product_group_name
      `);

    if (duplicate.recordset.length) {
      return res.status(409).json({
        error: 'product_group_name already exists',
      });
    }

    const result = await pool.request()
      .input('product_group_name', sql.VarChar(50), product_group_name)
      .query(`
        INSERT INTO dim_product_group (product_group_name)
        OUTPUT INSERTED.*
        VALUES (@product_group_name)
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
   PUT /api/product-group/:id
═══════════════════════════════════════════════════════════════════ */

const updateProductGroup = async (req, res, next) => {
  try {
    const errs = validateBody(req.body);

    if (errs.length) {
      return res.status(400).json({
        error: errs.join('; '),
      });
    }

    const { id } = req.params;

    const { product_group_name} = req.body;

    const pool = getPool();

    /* เช็ก product_code ซ้ำกับสินค้าตัวอื่น */
    const duplicate = await pool.request()
      .input('id', sql.Int, Number(id))
      .input('product_group_name', sql.VarChar(30), product_group_name)
      .query(`
        SELECT product_group_id
        FROM dim_product_group
        WHERE product_group_name = @product_group_name
          AND product_group_id <> @id
      `);

    if (duplicate.recordset.length) {
      return res.status(409).json({
        error: 'product_group_name already exists',
      });
    }

    const result = await pool.request()
      .input('id', sql.Int, Number(id))
      .input('product_group_name', sql.VarChar(50), product_group_name)
      .query(`
        UPDATE dim_product_group
        SET
          product_group_name = @product_group_name
        WHERE product_group_id = @id
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({
        error: 'Product Group not found',
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
   DELETE /api/product-group/:id
═══════════════════════════════════════════════════════════════════ */

const removeProductGroup = async (req, res, next) => {
  try {
    const { id } = req.params;

    const pool = getPool();

    const result = await pool.request()
      .input('id', sql.Int, Number(id))
      .query(`
        DELETE FROM dim_product_group
        WHERE product_group_id = @id
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({
        error: 'Product Group not found',
      });
    }

    notifyDataChanged('product-data');

    res.json({
      message: 'Deleted successfully',
    });

  } catch (err) {
    if (err.number === 547) {
      return res.status(409).json({
        error: 'Cannot delete: product is referenced by existing production records',
      });
    }
    next(err);
  }
};


module.exports = {
  getAllProductGroups,
  getProductGroupById,
  createProductGroup,
  updateProductGroup,
  removeProductGroup,
};
