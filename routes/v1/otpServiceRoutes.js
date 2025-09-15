const express = require("express");
const router = express.Router();
const otpService = require("../../utils/otpService");

// const { sendOTP } = require("../../controllers/Auth/Auth");

router.post('/generate-otp', async (req, res) => {
  try {
    const { email, firstName } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const result = await otpService.generateOTP(email, firstName);
    
    return res.status(200).json({
      success: true,
      message: 'OTP generated successfully',
      expiresIn: result.expiresIn,
      ...(process.env.NODE_ENV !== 'production' && { otp: result.otp })
    });

  } catch (error) {
    console.error('Route handler error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate OTP'
    });
  }

  
});

router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required'
      });
    }

    const isValid = await otpService.verifyOtpRegister(email, otp);

    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'OTP verified successfully'
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to verify OTP'
    });
  }
});

module.exports = router;