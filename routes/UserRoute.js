const express = require('express');
const router = express.Router();
const {register, login, updateUser, getAllUsers, getByUserRole, getUserById, changePassword, forgotPassword, resetPassword} = require('../controllers/UserController');

router.post('/register', register);
router.post('/login', login);
router.put('/update/:id', updateUser);
router.get('/', getAllUsers);
router.get('/role/:role', getByUserRole);
router.get('/:id', getUserById);
router.put('/change-password/:id', changePassword);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);


module.exports = router;