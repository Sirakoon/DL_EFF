

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sql, getPool } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';
const ROLES = ['admin', 'editor', 'viewer'];

const publicUser = (u) => ({
  user_id: u.user_id,
  username: u.username,
  role: u.role,
  status: u.status,
  created_at: u.created_at,
  last_login: u.last_login,
});

/* ═══════════════════════════════════════════════════════════════════
   POST /api/auth/register
═══════════════════════════════════════════════════════════════════ */
const register = async (req, res, next) => {
  try {
    const { username, password, role } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'username and password are required' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
    if (!ROLES.includes(role)) return res.status(400).json({ error: 'Please select a role' });

    const pool = getPool();
    const existing = await pool.request()
      .input('username', sql.VarChar(50), username)
      .query('SELECT user_id FROM app_user WHERE username = @username');
    if (existing.recordset.length) return res.status(409).json({ error: 'Username already taken' });

    const countResult = await pool.request().query('SELECT COUNT(*) AS c FROM app_user');
    const isFirstUser = countResult.recordset[0].c === 0;

    const passwordHash = await bcrypt.hash(password, 10);

    await pool.request()
      .input('username', sql.VarChar(50), username)
      .input('password_hash', sql.VarChar(255), passwordHash)
      .input('role', sql.VarChar(20), isFirstUser ? 'admin' : role)
      .input('status', sql.VarChar(20), isFirstUser ? 'approved' : 'pending')
      .query(`
        INSERT INTO app_user (username, password_hash, role, status)
        VALUES (@username, @password_hash, @role, @status)
      `);

    res.status(201).json({
      message: isFirstUser
        ? 'Registered successfully as the first admin — you can log in now'
        : 'Registered successfully, please wait for admin approval before logging in',
      autoApproved: isFirstUser,
    });
  } catch (err) { next(err); }
};

/* ═══════════════════════════════════════════════════════════════════
   POST /api/auth/login
═══════════════════════════════════════════════════════════════════ */
const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'username and password are required' });

    const pool = getPool();
    const result = await pool.request()
      .input('username', sql.VarChar(50), username)
      .query('SELECT * FROM app_user WHERE username = @username');
    const user = result.recordset[0];
    if (!user) return res.status(401).json({ error: 'Invalid username or password' });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: 'Invalid username or password' });

    if (user.status === 'pending') return res.status(403).json({ error: 'Your account is still waiting for admin approval' });
    if (user.status === 'rejected') return res.status(403).json({ error: 'Your registration was rejected' });

    await pool.request()
      .input('id', sql.Int, user.user_id)
      .query('UPDATE app_user SET last_login = SYSUTCDATETIME() WHERE user_id = @id');

    const token = jwt.sign(
      { user_id: user.user_id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({ token, user: { user_id: user.user_id, username: user.username, role: user.role } });
  } catch (err) { next(err); }
};

/* ═══════════════════════════════════════════════════════════════════
   GET /api/auth/me
═══════════════════════════════════════════════════════════════════ */
const me = (req, res) => res.json({ user: req.user });

/* ═══════════════════════════════════════════════════════════════════
   GET /api/auth/users   (admin only)
═══════════════════════════════════════════════════════════════════ */
const listUsers = async (req, res, next) => {
  try {
    const { status } = req.query;
    const pool = getPool();
    const request = pool.request();
    let where = '';
    if (status) { where = 'WHERE status = @status'; request.input('status', sql.VarChar(20), status); }

    const result = await request.query(`
      SELECT user_id, username, role, status, created_at, last_login
      FROM app_user
      ${where}
      ORDER BY created_at DESC
    `);
    res.json({ data: result.recordset.map(publicUser) });
  } catch (err) { next(err); }
};

/* ═══════════════════════════════════════════════════════════════════
   POST /api/auth/users/:id/approve   (admin only)
═══════════════════════════════════════════════════════════════════ */
const approveUser = async (req, res, next) => {
  try {
    const pool = getPool();
    const result = await pool.request()
      .input('id', sql.Int, Number(req.params.id))
      .input('approvedBy', sql.Int, req.user.user_id)
      .query(`
        UPDATE app_user SET status = 'approved', approved_by = @approvedBy, approved_at = SYSUTCDATETIME()
        WHERE user_id = @id AND status = 'pending'
      `);
    if (result.rowsAffected[0] === 0) return res.status(404).json({ error: 'Pending user not found' });
    res.json({ message: 'User approved' });
  } catch (err) { next(err); }
};

/* ═══════════════════════════════════════════════════════════════════
   POST /api/auth/users/:id/reject   (admin only)
═══════════════════════════════════════════════════════════════════ */
const rejectUser = async (req, res, next) => {
  try {
    const pool = getPool();
    const result = await pool.request()
      .input('id', sql.Int, Number(req.params.id))
      .input('approvedBy', sql.Int, req.user.user_id)
      .query(`
        UPDATE app_user SET status = 'rejected', approved_by = @approvedBy, approved_at = SYSUTCDATETIME()
        WHERE user_id = @id AND status = 'pending'
      `);
    if (result.rowsAffected[0] === 0) return res.status(404).json({ error: 'Pending user not found' });
    res.json({ message: 'User rejected' });
  } catch (err) { next(err); }
};

/* ═══════════════════════════════════════════════════════════════════
   POST /api/auth/users/:id/reset-password   (admin only)
   body: { newPassword }
═══════════════════════════════════════════════════════════════════ */
const resetPassword = async (req, res, next) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }
    const passwordHash = await bcrypt.hash(newPassword, 10);
    const pool = getPool();
    const result = await pool.request()
      .input('id', sql.Int, Number(req.params.id))
      .input('password_hash', sql.VarChar(255), passwordHash)
      .query('UPDATE app_user SET password_hash = @password_hash WHERE user_id = @id');
    if (result.rowsAffected[0] === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'Password reset successfully' });
  } catch (err) { next(err); }
};

/* ═══════════════════════════════════════════════════════════════════
   POST /api/auth/change-password   (logged-in user, self-service)
   body: { currentPassword, newPassword }
═══════════════════════════════════════════════════════════════════ */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ error: 'currentPassword and newPassword are required' });
    if (newPassword.length < 6) return res.status(400).json({ error: 'New password must be at least 6 characters' });

    const pool = getPool();
    const result = await pool.request()
      .input('id', sql.Int, req.user.user_id)
      .query('SELECT password_hash FROM app_user WHERE user_id = @id');
    const user = result.recordset[0];
    if (!user) return res.status(404).json({ error: 'User not found' });

    const match = await bcrypt.compare(currentPassword, user.password_hash);
    if (!match) return res.status(401).json({ error: 'Current password is incorrect' });

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await pool.request()
      .input('id', sql.Int, req.user.user_id)
      .input('password_hash', sql.VarChar(255), passwordHash)
      .query('UPDATE app_user SET password_hash = @password_hash WHERE user_id = @id');

    res.json({ message: 'Password changed successfully' });
  } catch (err) { next(err); }
};

/* ═══════════════════════════════════════════════════════════════════
   POST /api/auth/forgot-password   (public, self-service — no email/OTP)
   body: { username, newPassword }
═══════════════════════════════════════════════════════════════════ */
const forgotPassword = async (req, res, next) => {
  try {
    const { username, newPassword } = req.body;
    if (!username || !newPassword) return res.status(400).json({ error: 'username and newPassword are required' });
    if (newPassword.length < 6) return res.status(400).json({ error: 'New password must be at least 6 characters' });

    const pool = getPool();
    const result = await pool.request()
      .input('username', sql.VarChar(50), username)
      .query('SELECT user_id, status FROM app_user WHERE username = @username');
    const user = result.recordset[0];
    if (!user) return res.status(404).json({ error: 'Username not found' });
    if (user.status !== 'approved') return res.status(403).json({ error: 'Account is not approved yet' });

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await pool.request()
      .input('id', sql.Int, user.user_id)
      .input('password_hash', sql.VarChar(255), passwordHash)
      .query('UPDATE app_user SET password_hash = @password_hash WHERE user_id = @id');

    res.json({ message: 'Password reset successfully, please log in with your new password' });
  } catch (err) { next(err); }
};

module.exports = { register, login, me, listUsers, approveUser, rejectUser, resetPassword, changePassword, forgotPassword };
