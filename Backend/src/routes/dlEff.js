const express = require('express');
const router = express.Router();
const { getOverview, getDetail, getFilters } = require('../controllers/dlEffController');

router.get('/overview', getOverview);
router.get('/detail', getDetail);
router.get('/filters', getFilters);

module.exports = router;
