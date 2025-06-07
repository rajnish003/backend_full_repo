const express = require("express");
const router = express.Router();
 

const {signUp,sendOTP,login} = require('../../controllers/Auth/Auth');
const {resetPassword,sendResetOTP} = require('../../controllers/Auth/ResetPasword');
// const auth = require('../../middlewares/Auth/auth');

// Auth router 
router.post("/signup",signUp);
router.post("/otp",sendOTP);
router.post("/login",login);

// for reset password
router.post("/reset-password",resetPassword);
router.post("/send-reset-otp",sendResetOTP);


module.exports = router ; 