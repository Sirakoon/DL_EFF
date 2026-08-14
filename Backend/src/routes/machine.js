const express = require('express');
const router = express.Router();
const { getAllMachines,getMachineById,updateMachine,removeMachine,createMachine } = require('../controllers/machineController');


router.get('/', getAllMachines);
router.get('/:id', getMachineById);
router.post('/', createMachine);
router.put('/:id', updateMachine);
router.delete('/:id', removeMachine);

module.exports = router;
