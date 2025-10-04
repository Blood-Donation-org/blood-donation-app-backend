const express = require('express');
const router = express.Router();
const { createCamp, updateCamp, deleteCamp, getCampById, getAllCamps } = require('../controllers/CampController');

router.post('/create', createCamp);
router.put('/update/:id', updateCamp);
router.delete('/delete/:id', deleteCamp);
router.get('/:id', getCampById);
router.get('/', getAllCamps);

module.exports = router;