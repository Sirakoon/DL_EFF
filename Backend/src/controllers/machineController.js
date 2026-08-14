const { sql, getPool } = require('../config/db');
const { notifyDataChanged } = require('../realtime');

/* ── server-side validation ─────────────────────────────────────── */

function validateBody(body) {
  const errors = [];

  const REQUIRED = [
    'machine_code',
    'oee_target',
    'is_active',
  ];

  REQUIRED.forEach((k) => {
    if (body[k] == null || body[k] === '') {
      errors.push(`${k} is required`);
    }
  });

  // oee_target ต้องอยู่ระหว่าง 0 - 1
  if (body.oee_target != null && body.oee_target !== '') {
    const value = Number(body.oee_target);

    if (isNaN(value) || value < 0 || value > 1) {
      errors.push('oee_target must be 0–1');
    }
  }

  // is_active ต้องเป็น 0 หรือ 1
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
        machine_id,
        machine_code,
        oee_target,
        version,
        is_active,
        updated_at
      FROM dim_machine
      ORDER BY updated_at DESC, machine_id DESC
    `);

    res.json({
      data: result.recordset,
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
      return res.status(400).json({
        error: errs.join('; '),
      });
    }

    const {
      machine_code,
      oee_target,
      version = null,
      is_active,
    } = req.body;

    const pool = getPool();

    /* เช็ก machine_code ซ้ำ */
    const duplicate = await pool.request()
      .input('machine_code', sql.VarChar(30), machine_code)
      .query(`
        SELECT machine_id
        FROM dim_machine
        WHERE machine_code = @machine_code
      `);

    if (duplicate.recordset.length) {
      return res.status(409).json({
        error: 'machine_code already exists',
      });
    }

    const result = await pool.request()
      .input('machine_code', sql.VarChar(30), machine_code)
      .input('oee_target', sql.Decimal(5, 3), Number(oee_target))
      .input('version', sql.Int, version)
      .input('is_active', sql.Bit, is_active)
      .query(`
        INSERT INTO dim_machine (
          machine_code,
          oee_target,
          version,
          is_active,
          updated_at
        )
        OUTPUT INSERTED.*
        VALUES (
          @machine_code,
          @oee_target,
          @version,
          @is_active,
          SYSUTCDATETIME()
        )
      `);

    notifyDataChanged('machine-data');

    res.status(201).json({
      message: 'Created successfully',
      data: result.recordset[0],
    });

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
      return res.status(400).json({
        error: errs.join('; '),
      });
    }

    const { id } = req.params;

    const {
      machine_code,
      oee_target,
      version = null,
      is_active,
    } = req.body;

    const pool = getPool();

    /* เช็ก machine_code ซ้ำกับ machine ตัวอื่น */
    const duplicate = await pool.request()
      .input('id', sql.Int, Number(id))
      .input('machine_code', sql.VarChar(30), machine_code)
      .query(`
        SELECT machine_id
        FROM dim_machine
        WHERE machine_code = @machine_code
          AND machine_id <> @id
      `);

    if (duplicate.recordset.length) {
      return res.status(409).json({
        error: 'machine_code already exists',
      });
    }

    const result = await pool.request()
      .input('id', sql.Int, Number(id))
      .input('machine_code', sql.VarChar(30), machine_code)
      .input('oee_target', sql.Decimal(5, 3), Number(oee_target))
      .input('version', sql.Int, version)
      .input('is_active', sql.Bit, is_active)
      .query(`
        UPDATE dim_machine
        SET
          machine_code = @machine_code,
          oee_target   = @oee_target,
          version      = @version,
          is_active    = @is_active,
          updated_at   = SYSUTCDATETIME()
        WHERE machine_id = @id
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({
        error: 'Machine not found',
      });
    }

    notifyDataChanged('machine-data');

    res.json({
      message: 'Updated successfully',
    });

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

    const result = await pool.request()
      .input('id', sql.Int, Number(id))
      .query(`
        DELETE FROM dim_machine
        WHERE machine_id = @id
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({
        error: 'Machine not found',
      });
    }

    notifyDataChanged('machine-data');

    res.json({
      message: 'Deleted successfully',
    });

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