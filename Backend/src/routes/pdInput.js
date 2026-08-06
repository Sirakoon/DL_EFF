const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth');
const {
  getAll, getMachines, getProducts, getShifts, getFilters, create, update, remove, exportCsv,
} = require('../controllers/pdInputController');

/* ดู/เพิ่มข้อมูล — เปิดอิสระ ไม่บังคับ login */
router.get('/export', exportCsv);
router.get('/', getAll);
router.get('/master/machines', getMachines);   // dropdown เครื่องจักร 
router.get('/master/products', getProducts);   // dropdown product  
router.get('/master/shifts', getShifts);     // dropdown shift
router.get('/filters', getFilters);    // filter bar 
router.post('/', create);


router.put('/:id', authenticate, requireRole('admin', 'editor'), update);
router.delete('/:id', authenticate, requireRole('admin', 'editor'), remove);

module.exports = router;
