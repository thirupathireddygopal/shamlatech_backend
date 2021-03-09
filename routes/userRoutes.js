const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// admin registration and login
router.post('/register', userController.register);
router.post('/login', userController.login);

router.post('/saveUsers', userController.save_users);
router.post('/createUser', userController.create_user);
router.get('/getUsers', userController.get_users);
router.post('/getUserInfo', userController.get_user_info);
router.post('/updateUser', userController.update_user);
router.post('/deleteUser', userController.delete_user)


module.exports = router;