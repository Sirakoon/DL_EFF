const { sql, getPool } = require('../config/db');
const { notifyDataChanged } = require('../realtime');

/* ── server-side validation ─────────────────────────────────────── */

function validateBody(body) {
  const errors = [];

  const REQUIRED = [
    'machine_code',
    'oee_target',
    'is_active',
    'product_group'
  ];

  REQUIRED.forEach((k) => {
    if (body[k] == null || body[k] === '') {
      errors.push(`${k} is required`);
    }
  });

  if (body.oee_target != null && body.oee_target !== '') {
    const value = Number(body.oee_target);

    if (isNaN(value) || value < 0 || value > 1) {
      errors.push('oee_target must be 0–1');
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
   GET /api/machines
═══════════════════════════════════════════════════════════════════ */

const getAllMachines = async (req, res, next) => {
  try {
    const pool = getPool();

    const result = await pool.request().query(`
      SELECT
        m.machine_id,
        m.machine_code,
        m.oee_target,
        m.version,
        m.is_active,
        m.updated_at,
        (
          SELECT 
            mpg.product_group_id,
            dpg.product_group_name
          FROM map_machine_product_group mpg
          INNER JOIN dim_product_group dpg 
            ON mpg.product_group_id = dpg.product_group_id
          WHERE mpg.machine_id = m.machine_id
          FOR JSON PATH
        ) AS product_group
      FROM dim_machine m
      ORDER BY m.updated_at DESC, m.machine_id DESC
    `);

    const formattedData = result.recordset.map((row) => ({
      ...row,
      product_group: JSON.parse(row.product_group || '[]') 
    }));

    res.json({
      data: formattedData,
    });

  } catch (err) {
    next(err);
  }
};


/* ═══════════════════════════════════════════════════════════════════
   GET /api/machines/:id
═══════════════════════════════════════════════════════════════════ */

const getMachineById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const pool = getPool();

    const result = await pool.request()
      .input('id', sql.Int, Number(id))
      .query(`
        SELECT
          machine_id,
          machine_code,
          oee_target,
          version,
          is_active,
          updated_at
        FROM dim_machine
        WHERE machine_id = @id
      `);

    if (!result.recordset.length) {
      return res.status(404).json({
        error: 'Machine not found',
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
   POST /api/machines
═══════════════════════════════════════════════════════════════════ */

const createMachine = async (req, res, next) => {
  try {
    const errs = validateBody(req.body);

    if (errs.length) {
      return res.status(400).json({ error: errs.join('; ') });
    }

    const {
      machine_code,
      oee_target,
      version = null,
      is_active,
      product_group = [], 
    } = req.body;

    const productGroupJson = JSON.stringify(product_group); 

    const pool = getPool();


    try {
      const result = await pool.request()
        .input('machine_code', sql.VarChar(30), machine_code)
        .input('oee_target', sql.Decimal(5, 3), Number(oee_target))
        .input('version', sql.Int, version)
        .input('is_active', sql.Bit, is_active)
        .input('product_group_json', sql.NVarChar(sql.MAX), productGroupJson) 
        .execute('sp_CreateMachineWithMapping');

      notifyDataChanged('machine-data');

      return res.status(201).json({
        message: 'Created successfully',
        data: result.recordset[0],
      });

    } catch (dbErr) {
      if (dbErr.number === 50001) {
        return res.status(409).json({ error: 'machine_code already exists' });
      }
      throw dbErr; 
    }

  } catch (err) {
    next(err);
  }
};


/* ═══════════════════════════════════════════════════════════════════
   PUT /api/machines/:id
═══════════════════════════════════════════════════════════════════ */

const updateMachine = async (req, res, next) => {
  try {
    const errs = validateBody(req.body);

    if (errs.length) {
      return res.status(400).json({ error: errs.join('; ') });
    }

    const { id } = req.params;
    const {
      machine_code,
      oee_target,
      version = null,
      is_active,
      product_group = [], 
    } = req.body;

    const productGroupJson = JSON.stringify(product_group);
    const pool = getPool();

    try {
      await pool.request()
        .input('machine_id', sql.Int, Number(id))
        .input('machine_code', sql.VarChar(30), machine_code)
        .input('oee_target', sql.Decimal(5, 3), Number(oee_target))
        .input('version', sql.Int, version)
        .input('is_active', sql.Bit, is_active)
        .input('product_group_json', sql.NVarChar(sql.MAX), productGroupJson)
        .execute('sp_UpdateMachineWithMapping'); 

      notifyDataChanged('machine-data');

      res.json({ message: 'Updated successfully' });

    } catch (dbErr) {
      if (dbErr.number === 50001) {
        return res.status(409).json({ error: 'machine_code already exists' });
      }
      if (dbErr.number === 50004) {
        return res.status(404).json({ error: 'Machine not found' });
      }
      throw dbErr;
    }
  } catch (err) {
    next(err);
  }
};


/* ═══════════════════════════════════════════════════════════════════
   DELETE /api/machines/:id
═══════════════════════════════════════════════════════════════════ */

const removeMachine = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pool = getPool();

    try {
      await pool.request()
        .input('machine_id', sql.Int, Number(id))
        .execute('sp_DeleteMachineWithMapping'); 

      notifyDataChanged('machine-data');

      res.json({ message: 'Deleted successfully' });

    } catch (dbErr) {
      if (dbErr.number === 50004) {
        return res.status(404).json({ error: 'Machine not found' });
      }
      throw dbErr;
    }
  } catch (err) {
    next(err);
  }
};


module.exports = {
  getAllMachines,
  getMachineById,
  createMachine,
  updateMachine,
  removeMachine,
};