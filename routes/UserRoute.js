const express = require('express');
const router = express.Router();
const {register, login, updateUser, getAllStudents} = require('../controllers/UserController');


router.post('/register', register);
router.post('/login', login);
router.put('/update/:id', updateUser);


module.exports = router;