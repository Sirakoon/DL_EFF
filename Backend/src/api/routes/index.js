const express = require('express');
const router = express.Router();
const dataController = require('../controllers/dataController');

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Data routes
router.get('/data', dataController.getAll);
router.get('/data/:id', dataController.getById);
router.post('/data', dataController.create);
router.put('/data/:id', dataController.update);
router.delete('/data/:id', dataController.remove);

module.exports = router;
