const express = require('express');
const router = express.Router();
const {register, login, updateUser, getAllUsers, getByUserRole, getUserById, changePassword} = require('../controllers/UserController');

router.post('/register', register);
router.post('/login', login);
router.put('/update/:id', updateUser);
router.get('/', getAllUsers);
router.get('/role/:role', getByUserRole);
router.get('/:id', getUserById);
router.put('/change-password/:id', changePassword);


module.exports = router;