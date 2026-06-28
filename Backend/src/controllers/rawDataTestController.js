const { sql, getPool } = require('../config/db');

const getAll = async (req, res, next) => {
  try {
    const pool = getPool();
    const result = await pool.request().query('SELECT * FROM RawDataTest ORDER BY ID DESC');
    res.json(result.recordset);
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const pool = getPool();
    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .query('SELECT * FROM RawDataTest WHERE ID = @id');

    if (result.recordset.length === 0) return res.status(404).json({ error: 'Record not found' });
    res.json(result.recordset[0]);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const {
      PRODUCTION_DATE, SHIFT, MACHINE, PRODUCT_GROUP, PRODUCT_CODE,
      PRODUCT_DESC, MC_SPEED, CAPACITY, OEE_TARGET, MC_RUN_TIME,
      STD_HC, STD_HOUR, HOUR_PIECE_RATE, ACTUAL_OUTPUT, LOSS_HOUR,
      ACTUAL_BULK, ACTUAL_PALLET, ACTUAL_ASSIT, ACTUAL_HC,
      ENTRY_DATE, UNDONE,
    } = req.body;

    const pool = getPool();
    const result = await pool.request()
      .input('PRODUCTION_DATE', sql.DateTime2, PRODUCTION_DATE)
      .input('SHIFT', sql.VarChar(10), SHIFT)
      .input('MACHINE', sql.VarChar(100), MACHINE)
      .input('PRODUCT_GROUP', sql.VarChar(150), PRODUCT_GROUP)
      .input('PRODUCT_CODE', sql.VarChar(100), PRODUCT_CODE)
      .input('PRODUCT_DESC', sql.NVarChar(sql.MAX), PRODUCT_DESC)
      .input('MC_SPEED', sql.Int, MC_SPEED)
      .input('CAPACITY', sql.Int, CAPACITY)
      .input('OEE_TARGET', sql.Float, OEE_TARGET)
      .input('MC_RUN_TIME', sql.Int, MC_RUN_TIME)
      .input('STD_HC', sql.Float, STD_HC)
      .input('STD_HOUR', sql.Float, STD_HOUR)
      .input('HOUR_PIECE_RATE', sql.Float, HOUR_PIECE_RATE)
      .input('ACTUAL_OUTPUT', sql.Float, ACTUAL_OUTPUT)
      .input('LOSS_HOUR', sql.Float, LOSS_HOUR)
      .input('ACTUAL_BULK', sql.Float, ACTUAL_BULK)
      .input('ACTUAL_PALLET', sql.Float, ACTUAL_PALLET)
      .input('ACTUAL_ASSIT', sql.Float, ACTUAL_ASSIT)
      .input('ACTUAL_HC', sql.Int, ACTUAL_HC)
      .input('ENTRY_DATE', sql.DateTime2, ENTRY_DATE)
      .input('UNDONE', sql.VarChar(50), UNDONE)
      .query(`
        INSERT INTO RawDataTest (
          PRODUCTION_DATE, SHIFT, MACHINE, PRODUCT_GROUP, PRODUCT_CODE,
          PRODUCT_DESC, MC_SPEED, CAPACITY, OEE_TARGET, MC_RUN_TIME,
          STD_HC, STD_HOUR, HOUR_PIECE_RATE, ACTUAL_OUTPUT, LOSS_HOUR,
          ACTUAL_BULK, ACTUAL_PALLET, ACTUAL_ASSIT, ACTUAL_HC,
          ENTRY_DATE, UNDONE
        )
        OUTPUT INSERTED.ID
        VALUES (
          @PRODUCTION_DATE, @SHIFT, @MACHINE, @PRODUCT_GROUP, @PRODUCT_CODE,
          @PRODUCT_DESC, @MC_SPEED, @CAPACITY, @OEE_TARGET, @MC_RUN_TIME,
          @STD_HC, @STD_HOUR, @HOUR_PIECE_RATE, @ACTUAL_OUTPUT, @LOSS_HOUR,
          @ACTUAL_BULK, @ACTUAL_PALLET, @ACTUAL_ASSIT, @ACTUAL_HC,
          @ENTRY_DATE, @UNDONE
        )
      `);

    res.status(201).json({ ID: result.recordset[0].ID });
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const {
      PRODUCTION_DATE, SHIFT, MACHINE, PRODUCT_GROUP, PRODUCT_CODE,
      PRODUCT_DESC, MC_SPEED, CAPACITY, OEE_TARGET, MC_RUN_TIME,
      STD_HC, STD_HOUR, HOUR_PIECE_RATE, ACTUAL_OUTPUT, LOSS_HOUR,
      ACTUAL_BULK, ACTUAL_PALLET, ACTUAL_ASSIT, ACTUAL_HC,
      ENTRY_DATE, UNDONE,
    } = req.body;

    const pool = getPool();
    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .input('PRODUCTION_DATE', sql.DateTime2, PRODUCTION_DATE)
      .input('SHIFT', sql.VarChar(10), SHIFT)
      .input('MACHINE', sql.VarChar(100), MACHINE)
      .input('PRODUCT_GROUP', sql.VarChar(150), PRODUCT_GROUP)
      .input('PRODUCT_CODE', sql.VarChar(100), PRODUCT_CODE)
      .input('PRODUCT_DESC', sql.NVarChar(sql.MAX), PRODUCT_DESC)
      .input('MC_SPEED', sql.Int, MC_SPEED)
      .input('CAPACITY', sql.Int, CAPACITY)
      .input('OEE_TARGET', sql.Float, OEE_TARGET)
      .input('MC_RUN_TIME', sql.Int, MC_RUN_TIME)
      .input('STD_HC', sql.Float, STD_HC)
      .input('STD_HOUR', sql.Float, STD_HOUR)
      .input('HOUR_PIECE_RATE', sql.Float, HOUR_PIECE_RATE)
      .input('ACTUAL_OUTPUT', sql.Float, ACTUAL_OUTPUT)
      .input('LOSS_HOUR', sql.Float, LOSS_HOUR)
      .input('ACTUAL_BULK', sql.Float, ACTUAL_BULK)
      .input('ACTUAL_PALLET', sql.Float, ACTUAL_PALLET)
      .input('ACTUAL_ASSIT', sql.Float, ACTUAL_ASSIT)
      .input('ACTUAL_HC', sql.Int, ACTUAL_HC)
      .input('ENTRY_DATE', sql.DateTime2, ENTRY_DATE)
      .input('UNDONE', sql.VarChar(50), UNDONE)
      .query(`
        UPDATE RawDataTest SET
          PRODUCTION_DATE = @PRODUCTION_DATE,
          SHIFT           = @SHIFT,
          MACHINE         = @MACHINE,
          PRODUCT_GROUP   = @PRODUCT_GROUP,
          PRODUCT_CODE    = @PRODUCT_CODE,
          PRODUCT_DESC    = @PRODUCT_DESC,
          MC_SPEED        = @MC_SPEED,
          CAPACITY        = @CAPACITY,
          OEE_TARGET      = @OEE_TARGET,
          MC_RUN_TIME     = @MC_RUN_TIME,
          STD_HC          = @STD_HC,
          STD_HOUR        = @STD_HOUR,
          HOUR_PIECE_RATE = @HOUR_PIECE_RATE,
          ACTUAL_OUTPUT   = @ACTUAL_OUTPUT,
          LOSS_HOUR       = @LOSS_HOUR,
          ACTUAL_BULK     = @ACTUAL_BULK,
          ACTUAL_PALLET   = @ACTUAL_PALLET,
          ACTUAL_ASSIT    = @ACTUAL_ASSIT,
          ACTUAL_HC       = @ACTUAL_HC,
          ENTRY_DATE      = @ENTRY_DATE,
          UNDONE          = @UNDONE
        WHERE ID = @id
      `);

    if (result.rowsAffected[0] === 0) return res.status(404).json({ error: 'Record not found' });
    res.json({ message: 'Updated successfully' });
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const pool = getPool();
    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .query('DELETE FROM RawDataTest WHERE ID = @id');

    if (result.rowsAffected[0] === 0) return res.status(404).json({ error: 'Record not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getById, create, update, remove };
