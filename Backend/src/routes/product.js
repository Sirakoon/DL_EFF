const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth');
const { getAllProducts, getProductById, createProduct, updateProduct, removeProduct } = require('../controllers/productController');


router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.post('/', authenticate, requireRole('admin'), createProduct);
router.put('/:id', authenticate, requireRole('admin'), updateProduct);
router.delete('/:id', authenticate, requireRole('admin'), removeProduct);

module.exports = router;
