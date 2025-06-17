const express = require('express');
const authController = require('./../controller/authController');
const { isAuth, restrict } = require('../meddlewares');


const router = express.Router();

router.post('/signup',authController.signup);
router.post('/login',authController.login);
router.post('/verify',authController.verifyOtp);
router.post('/token',authController.token);
router.get('/logout',isAuth,authController.logout);
module.exports = router;