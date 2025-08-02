const express = require("express");
const router = express.Router();
 

const {signUp,sendOTP,login,changepassword} = require('../../controllers/Auth/Auth');
const {resetPassword,sendResendOTP} = require('../../controllers/Auth/ResetPasword');
const {checkAuth} = require('../../middlewares/Auth/auth');
const { adminLogin } = require("../../controllers/admin/adminController");

// Auth router 
router.post("/signup",signUp);
router.post("/otp",sendOTP);
router.post("/login",login);

// admin login 
router.post("/admin-login",adminLogin);

// for reset password
router.post("/change-password",checkAuth,changepassword);
router.post("/reset-password",checkAuth,resetPassword);
router.post("/send-resend-otp",checkAuth,sendResendOTP);


module.exports = router ; 