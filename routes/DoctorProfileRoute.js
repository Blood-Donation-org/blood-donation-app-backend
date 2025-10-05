const express = require('express');
const router = express.Router();
const { createDoctorWithProfile, getDoctorProfileByUserId, getAllDoctorProfiles, deleteDoctor } = require('../controllers/DoctorProfileController');


router.post('/create', createDoctorWithProfile);
router.get('/user/:userId', getDoctorProfileByUserId);
router.get('/', getAllDoctorProfiles);
router.delete('/delete/:userId', deleteDoctor);

module.exports = router;
