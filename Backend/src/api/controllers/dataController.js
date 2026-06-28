const { sql, getPool } = require('../../config/db');

const getAll = async (req, res, next) => {
  try {
    const pool = getPool();
    const result = await pool.request().query('SELECT * FROM RawDataTest');
    res.json({ success: true, data: result.recordset });
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const pool = getPool();
    const result = await pool
      .request()
      .input('id', sql.Int, parseInt(req.params.id))
      .query('SELECT * FROM RawDataTest WHERE id = @id');

    if (result.recordset.length === 0)
      return res.status(404).json({ success: false, message: 'Not found' });

    res.json({ success: true, data: result.recordset[0] });
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const pool = getPool();
    const { name, value } = req.body;

    const result = await pool
      .request()
      .input('name', sql.NVarChar, name)
      .input('value', sql.NVarChar, value)
      .query(`
        INSERT INTO RawDataTest (name, value, createdAt)
        OUTPUT INSERTED.*
        VALUES (@name, @value, GETDATE())
      `);

    res.status(201).json({ success: true, data: result.recordset[0] });
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const pool = getPool();
    const { name, value } = req.body;

    const result = await pool
      .request()
      .input('id', sql.Int, parseInt(req.params.id))
      .input('name', sql.NVarChar, name)
      .input('value', sql.NVarChar, value)
      .query(`
        UPDATE RawDataTest
        SET name = @name, value = @value, updatedAt = GETDATE()
        OUTPUT INSERTED.*
        WHERE id = @id
      `);

    if (result.recordset.length === 0)
      return res.status(404).json({ success: false, message: 'Not found' });

    res.json({ success: true, data: result.recordset[0] });
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const pool = getPool();

    const result = await pool
      .request()
      .input('id', sql.Int, parseInt(req.params.id))
      .query('DELETE FROM RawDataTest OUTPUT DELETED.id WHERE id = @id');

    if (result.recordset.length === 0)
      return res.status(404).json({ success: false, message: 'Not found' });

    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getById, create, update, remove };
