const { sql } = require('../config/db');

/** เช็กว่า value ซ้ำกับที่มีอยู่ใน column ของ table หรือไม่ (ไม่รวม excludeId ถ้ามี) */
async function isDuplicate(pool, { table, idColumn, column, varcharLen, value, excludeId }) {
  const request = pool.request().input('value', sql.VarChar(varcharLen), value);
  let where = `${column} = @value`;
  if (excludeId != null) {
    request.input('excludeId', sql.Int, excludeId);
    where += ` AND ${idColumn} <> @excludeId`;
  }
  const result = await request.query(`SELECT ${idColumn} FROM ${table} WHERE ${where}`);
  return result.recordset.length > 0;
}

/** ตอบ 409 มาตรฐานเวลาลบไม่ได้เพราะติด FK constraint (SQL error 547) */
function fkViolationResponse(res, message) {
  return res.status(409).json({ error: message });
}

module.exports = { isDuplicate, fkViolationResponse };
