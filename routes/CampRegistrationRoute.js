const express = require('express');
const router = express.Router();
const { registerForACamp, getByUser, getAllRegistrations } = require('../controllers/CampRegistrationController');


router.post('/register', registerForACamp);
router.get('/user/:userId', getByUser);
router.get('/', getAllRegistrations);

module.exports = router;
