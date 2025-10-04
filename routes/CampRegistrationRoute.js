const express = require('express');
const router = express.Router();
const { registerForACamp, getByUser, getAllRegistrations, checkUserRegistration } = require('../controllers/CampRegistrationController');



router.post('/register', registerForACamp);
router.get('/user/:userId', getByUser);
router.get('/', getAllRegistrations);
router.get('/check', checkUserRegistration);

module.exports = router;
