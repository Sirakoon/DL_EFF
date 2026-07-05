const express = require('express');
const router = express.Router();
const {
  getAll, getMachines, getProducts, getShifts, getFilters, create, update, remove, exportCsv,
} = require('../controllers/pdInputController');

router.get('/export', exportCsv);
router.get('/', getAll);
router.get('/master/machines', getMachines);   // dropdown เครื่องจักร → auto-fill oee_target
router.get('/master/products', getProducts);   // dropdown product   → auto-fill mc_speed, group
router.get('/master/shifts', getShifts);     // dropdown shift
router.get('/filters', getFilters);    // filter bar (distinct จาก data จริง)
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', remove);

module.exports = router;
