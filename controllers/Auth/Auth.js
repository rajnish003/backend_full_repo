const { default: mongoose } = require("mongoose");
const User = require("../../models/User");
const OTP = require("../../models/OTP");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const Profile = require("../../models/Profile");
const jwt = require("jsonwebtoken");
const mailSender = require("../../utils/mailSender");
const generateOTPEmailTemplate = require("../../mail/template/otpEmailTemplate");
// const updatePassword = require("../../mail/template/updataPassword");
const otpService = require("../../utils/otpService");
const redisUtils = require("../../utils/redisUtils")

// send Otp
// exports.sendOTP = async (req, res) => {
//   try {
//     // take user email from request ki body
//     const { email, firstName } = req.body;

//     // check user exist or not
//     const checkUserExist = await User.findOne({ email });

//     // validate
//     if (checkUserExist) {
//       return res.status(403).json({
//         success: false,
//         message: "User already exist ! try another email",
//       });
//     }

//     // for generating otp we can use library which generate the OTP without intraction with Database
//     var otp = otpGenerator.generate(6, {
//       upperCaseAlphabets: false,
//       lowerCaseAlphabets: false,
//       specialChars: false,
//     });
//     console.log("Generated Otp: ", otp);

//     // check generated otp is uniqe or not
//     const result = await OTP.findOne({ otp: otp });

//     // if otp is exist we generate again
//     if (result) {
//       otp = otpGenerator.generate(6, {
//         upperCaseAlphabets: false,
//         lowerCaseAlphabets: false,
//         specialChars: false,
//       });

//       result = await OTP.findOne({ otp: otp });
//     }

//     const otpPayload = {
//       email,
//       otp,
//       expiresAt: new Date(Date.now() + 5 * 60 * 1000),
//     };

//     // create the entry in database for otp

//     // const otpBody = await OTP.create(otpPayload);
//     // // console.log (otpBody);

//     await OTP.updateOne(
//       { email: otpPayload.email }, // filter
//       { $set: otpPayload }, // update data
//       { upsert: true } // enable upsert
//     );

//     // Send OTP via email

//     const emailSubject = "Your OTP Verification Code ";
//     const emailBody = generateOTPEmailTemplate(firstName || "User", otp);

//     await mailSender(email, emailSubject, emailBody);

//     res.status(200).json({
//       success: true,
//       message: "Otp send Successfully",
//       otp: process.env.NODE_ENV === "development" ? otp : undefined,
//     });
//   } catch (error) {
//     console.log("OTP sending error:", error);
//     return res.status(500).json({
//       sucess: false,
//       message: error.message,
//       error: process.env.NODE_ENV === "development" ? error.message : undefined,
//     });
//   }
// };



// signup controller

exports.signUp = async (req, res) => {
  try {
    const { fullname, phoneNo, email, password } = req.body;

    // 1. Validate input
    if (!fullname || !phoneNo || !email || !password) {
      return res.status(403).json({
        success: false,
        message: "All fields are required!",
      });
    }

    // 2. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already registered",
      });
    }

    // 3. Hash the password but don't save user yet
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Save temporary user data in Redis 
    await redisUtils.setTempUser(email, {
      fullname,
      phoneNo,
      email,
      password: hashedPassword,
    }, 10 * 60); // expires in 10 min

    // 5. Generate OTP
    const otpGeneration = await otpService.generateOTP(email, fullname);
    if (!otpGeneration.success) {
      return res.status(400).json({
        success: false,
        message: otpGeneration.message || "Failed to generate OTP",
      });
    }

    return res.status(200).json({
      success: true,
      message: "OTP sent to email. Please verify to complete registration.",
    });

  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
};

// login controller

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // 2. Check if user exists
    const user = await User.findOne({ email }).populate("additionalDetails");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not registered. Please sign up first.",
      });
    }

    // 3. Compare password
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password",
      });
    }

    // 4. Generate JWT token
    const payload = {
      id: user._id,
      email: user.email,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });

    // 5. Prepare user object to send
    user.password = undefined;

    // 6. Send response (you can skip setting cookies for mobile)
    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Login failed. Please try again.",
    });
  }
};

// changePassword controller

exports.changepassword = async (req, res) => {
  try {
    // Get data from request body
    const { email, oldPassword, newPassword, confirmPassword } = req.body;

    // Validate all fields
    if (!email || !oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required!",
      });
    }

    // Check if new passwords match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password and Confirm password do not match!",
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found!",
      });
    }

    // Verify old password
    const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Old password is incorrect",
      });
    }

    // Hash and save new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    await user.save();

    // Send email notification
    const emailSubject = "Password Changed Successfully";
    const emailBody = updatePassword(user.fullname || "User");
    
    try {
      await mailSender(email, emailSubject, emailBody);
    } catch (emailError) {
      console.error("Error sending email:", emailError);
      // Continue even if email fails
    }

    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });

  } catch (error) {
    console.error("Error changing password:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong, please try again",
      error: error.message,
    });
  }
};




