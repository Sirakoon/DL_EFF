const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth');
const { getAllProducts, getProductGroups, getProductById, createProduct, updateProduct, removeProduct } = require('../controllers/productController');


router.get('/', getAllProducts);
router.get('/groups', getProductGroups);
router.get('/:id', getProductById);
router.post('/', authenticate, requireRole('admin'), createProduct);
router.put('/:id', authenticate, requireRole('admin'), updateProduct);
router.delete('/:id', authenticate, requireRole('admin'), removeProduct);

module.exports = router;
