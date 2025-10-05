const express = require('express');
const router = express.Router();
const { createBloodInventory, updateBloodInventory, deleteBloodInventory, getBloodInventoryById, getAllBloodInventory, issueBlood } = require('../controllers/BloodInventoryController');

router.post('/create', createBloodInventory);
router.put('/update/:id', updateBloodInventory);
router.delete('/delete/:id', deleteBloodInventory);
router.get('/:id', getBloodInventoryById);
router.get('/', getAllBloodInventory);
router.post('/issue', issueBlood);

module.exports = router;