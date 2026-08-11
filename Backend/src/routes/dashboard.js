const express = require('express');
const router = express.Router();
const { getMachinePerformance, getFilterOptions } = require('../controllers/dashboardController');

router.get('/machine-performance', getMachinePerformance);
router.get('/filters', getFilterOptions);

module.exports = router;
