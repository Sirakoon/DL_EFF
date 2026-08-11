const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth');
const {
  register, login, me, listUsers, approveUser, rejectUser, resetPassword, changePassword, forgotPassword,
} = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.get('/me', authenticate, me);
router.post('/change-password', authenticate, changePassword);

/* admin-only user management */
router.get('/users', authenticate, requireRole('admin'), listUsers);
router.post('/users/:id/approve', authenticate, requireRole('admin'), approveUser);
router.post('/users/:id/reject', authenticate, requireRole('admin'), rejectUser);
router.post('/users/:id/reset-password', authenticate, requireRole('admin'), resetPassword);

module.exports = router;
