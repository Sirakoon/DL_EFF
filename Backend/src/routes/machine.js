const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth');
const { getAllMachines,getMachineById,updateMachine,removeMachine,createMachine } = require('../controllers/machineController');


router.get('/', getAllMachines);
router.get('/:id', getMachineById);
router.post('/', authenticate, requireRole('admin'), createMachine);
router.put('/:id', authenticate, requireRole('admin'), updateMachine);
router.delete('/:id', authenticate, requireRole('admin'), removeMachine);

module.exports = router;
