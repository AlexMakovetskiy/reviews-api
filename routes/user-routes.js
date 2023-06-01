const express = require('express');
const { body } = require('express-validator');

const UserController = require('../controllers/user-controller');
const authMiddleware = require('../middleware/auth-middleware');

const router = express.Router();

router.post(
    '/registration',
    body('email').isEmail(),
    body('password').isLength({min: 3, max: 32}),
    UserController.registration);
router.post('/login', UserController.login);
router.post('/logout', UserController.logout);
router.get('/activate/:link', UserController.activate);
router.get('/refresh', UserController.refresh);
// router.get('/users',authMiddleware, UserController.getUsers);
router.get('/users', UserController.getUsers);
router.options('/*', UserController.handleOptions);

module.exports = router;   