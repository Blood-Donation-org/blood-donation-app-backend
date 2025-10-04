const express = require('express');
const router = express.Router();
const {register, login, updateUser, getAllUsers, getByUserRole, getUserById} = require('../controllers/UserController');



router.post('/register', register);
router.post('/login', login);
router.put('/update/:id', updateUser);
router.get('/', getAllUsers);
router.get('/role/:role', getByUserRole);
router.get('/:id', getUserById);


module.exports = router;