const redisUtils = require('./redisUtils');
const otpGenerator = require('otp-generator');
const Otp = require('../models/OTP');
const mailSender = require('../utils/mailSender');
const generateOTPEmailTemplate = require('../mail/template/otpEmailTemplate');
const  Profile = require('../models/Profile');
const User = require('../models/User');
const jwt = require("jsonwebtoken");
class OTPService {
  constructor() {
    this.otpExpiry = 300; // 5 minutes in seconds
  }

  // gerate OTP and store it in Redis and MongoDB
  /* Generate OTP for email and store it in Redis and MongoDB */
  async generateOTP(email , firstName) {
    try {
      // Generate 6-digit OTP
      const otp = otpGenerator.generate(6, {
        digits: true,
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false, 
        specialChars: false 
      });

      console.log("Generated OTP:", otp);

      // Create OTP data object
      const otpData = {
        email,
        firstName,
        otp,
        createdAt: new Date().toISOString(),
        attempts: 0,
        maxAttempts: 3,
      };

   
      // Store OTP in Redis with expiration
      const success = await redisUtils.setOTP(email, otpData, Number(this.otpExpiry));
    if (!success) {
      console.error('Redis SET operation failed');
      throw new Error('Failed to store OTP in Redis');
    }

      // Save OTP in MongoDB (for audit/logging)
      await Otp.create({
        email,
        firstName,
        otp,
        expiresAt: new Date(Date.now() + this.otpExpiry * 1000),
      });

    const emailSubject = "Your OTP Verification Code ";
    const emailBody = generateOTPEmailTemplate(firstName || "User", otp);

    await mailSender(email, emailSubject, emailBody);


      return {
        success: true,
         ...(process.env.NODE_ENV !== 'production' && { otp }),
        expiresIn: this.otpExpiry,
        message: 'OTP generated successfully',
      };
    } catch (error) {
      console.error('OTP generation error:', error);
      return {
        success: false,
        message: 'Failed to generate OTP',
        error: error.message,
      };
    }
  }

  /*
    Verify OTP for email
   */
async verifyOtpRegister(email, otp) {
  try {
    let otpData = await redisUtils.getOTP(email);

    if (!otpData) {
      const record = await Otp.findOne({ email, otp });
      if (!record) {
        return { success: false, message: "OTP not found or expired" };
      }
      await Otp.deleteOne({ _id: record._id });
    }

    // OTP matches
    if ((otpData && otpData.otp === otp) || !otpData) {
      //  Get temp user from Redis
      const tempUser = await redisUtils.getTempUser(email);
      if (!tempUser) {
        return { success: false, message: "User session expired, please signup again" };
      }

      // 1. Create profile
      const profileDetails = await Profile.create({
        gender: null,
        contactNumber: null,
      });

      // 2. Create user
      const user = await User.create({
        fullname: tempUser.fullname,
        phoneNo: tempUser.phoneNo,
        email: tempUser.email,
        password: tempUser.password, // already hashed
        additionalDetails: profileDetails._id,
        image: `https://api.dicebear.com/5.x/initials/svg?seed=${tempUser.fullname}`,
        role: "user",
      });

      // 3. Delete temp data + OTP
      await redisUtils.deleteTempUser(email);
      await redisUtils.deleteOTP(email);

      // 4. Generate JWT
      const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "2h" }
      );

      return {
        success: true,
        message: "OTP verified & user registered successfully",
        token,
        user: {
          id: user._id,
          fullname: user.fullname,
          email: user.email,
          role: user.role,
        },
      };
    }

  } catch (error) {
    console.error("OTP verification error:", error);
    return {
      success: false,
      message: "Failed to verify OTP",
      error: error.message,
    };
  }
}

  /*
   Resend OTP for email
   */
  async resendOTP(email, firstName) {
    try {
      // Delete existing OTP if any
      await redisUtils.deleteOTP(email);

      // Generate new OTP
      return await this.generateOTP(email, firstName);
    } catch (error) {
      console.error('OTP resend error:', error);
      return {
        success: false,
        message: 'Failed to resend OTP',
        error: error.message
      };
    }
  }

  /*
   Check if OTP exists for email
   */
  async checkOTPExists(email) {
    try {
      const otpData = await redisUtils.getOTP(email);
      
      if (!otpData) {
        return {
          exists: false,
          message: 'No OTP found for this email'
        };
      }

      // Calculate remaining time
      const createdAt = new Date(otpData.createdAt);
      const now = new Date();
      const elapsedSeconds = Math.floor((now - createdAt) / 1000);
      const remainingSeconds = this.otpExpiry - elapsedSeconds;

      return {
        exists: true,
        remainingTime: Math.max(0, remainingSeconds),
        attempts: otpData.attempts,
        maxAttempts: otpData.maxAttempts
      };
    } catch (error) {
      console.error('OTP check error:', error);
      return {
        exists: false,
        message: 'Failed to check OTP',
        error: error.message
      };
    }
  }

  /*
   Delete OTP for email
   */
  async deleteOTP(email) {
    try {
      const success = await redisUtils.deleteOTP(email);
      
      return {
        success,
        message: success ? 'OTP deleted successfully' : 'Failed to delete OTP'
      };
    } catch (error) {
      console.error('OTP deletion error:', error);
      return {
        success: false,
        message: 'Failed to delete OTP',
        error: error.message
      };
    }
  }

  /*
   Get OTP statistics
   */
  async getOTPStats() {
    try {
      const client = redisUtils.redis.getClient();
      if (!client) {
        return {
          success: false,
          message: 'Redis not connected'
        };
      }

      // Get all OTP keys
      const keys = await client.keys('otp:*');
      const totalOTPs = keys.length;

      // Get active OTPs (not expired)
      let activeOTPs = 0;
      for (const key of keys) {
        const exists = await client.exists(key);
        if (exists) {
          activeOTPs++;
        }
      }

      return {
        success: true,
        data: {
          totalOTPs,
          activeOTPs,
          expiredOTPs: totalOTPs - activeOTPs
        }
      };
    } catch (error) {
      console.error('OTP stats error:', error);
      return {
        success: false,
        message: 'Failed to get OTP statistics',
        error: error.message
      };
    }
  }

  /*
    Clean up expired OTPs
   */
  async cleanupExpiredOTPs() {
    try {
      const client = redisUtils.redis.getClient();
      if (!client) {
        return {
          success: false,
          message: 'Redis not connected'
        };
      }

      // Get all OTP keys
      const keys = await client.keys('otp:*');
      let cleanedCount = 0;

      for (const key of keys) {
        const exists = await client.exists(key);
        if (!exists) {
          cleanedCount++;
        }
      }

      return {
        success: true,
        data: {
          cleanedCount,
          message: `Cleaned up ${cleanedCount} expired OTPs`
        }
      };
    } catch (error) {
      console.error('OTP cleanup error:', error);
      return {
        success: false,
        message: 'Failed to cleanup expired OTPs',
        error: error.message
      };
    }
  }
}

module.exports = new OTPService(); 