const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth');
const { getAllProductGroups, getProductGroupById, createProductGroup, updateProductGroup, removeProductGroup } = require('../controllers/productgroupController');


router.get('/', getAllProductGroups);
router.get('/:id', getProductGroupById);
router.post('/', authenticate, requireRole('admin'), createProductGroup);
router.put('/:id', authenticate, requireRole('admin'), updateProductGroup);
router.delete('/:id', authenticate, requireRole('admin'), removeProductGroup);

module.exports = router;
