const express = require("express");
const router = express.Router();

// const { sendOTP } = require("../../controllers/Auth/Auth");
const otpService = require("../../utils/otpService");

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
module.exports = router;