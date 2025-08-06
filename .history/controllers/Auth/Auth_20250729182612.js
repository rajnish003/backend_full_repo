const { default: mongoose } = require("mongoose");
const User = require("../../models/User");
const OTP = require("../../models/OTP");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const Profile = require("../../models/Profile");
const jwt = require("jsonwebtoken");
const mailSender = require("../../utils/mailSender");
const generateOTPEmailTemplate = require("../../mail/template/otpEmailTemplate");
const updatePassword = require("../../mail/template/updataPassword");

// send Otp
exports.sendOTP = async (req, res) => {
  try {
    // take user email from request ki body
    const { email, firstName } = req.body;

    // check user exist or not
    const checkUserExist = await User.findOne({ email });

    // validate
    if (checkUserExist) {
      return res.status(403).json({
        success: false,
        message: "User already exist ! try another email",
      });
    }

    // for generating otp we can use library which generate the OTP without intraction with Database
    var otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    console.log("Generated Otp: ", otp);

    // check generated otp is uniqe or not
    const result = await OTP.findOne({ otp: otp });

    // if otp is exist we generate again
    if (result) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });

      result = await OTP.findOne({ otp: otp });
    }

    const otpPayload = {
      email,
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    };

    // create the entry in database for otp

    // const otpBody = await OTP.create(otpPayload);
    // // console.log (otpBody);

    await OTP.updateOne(
      { email: otpPayload.email }, // filter
      { $set: otpPayload }, // update data
      { upsert: true } // enable upsert
    );

    // Send OTP via email

    const emailSubject = "Your OTP Verification Code ";
    const emailBody = generateOTPEmailTemplate(firstName || "User", otp);

    await mailSender(email, emailSubject, emailBody);

    res.status(200).json({
      success: true,
      message: "Otp send Successfully",
      otp: process.env.NODE_ENV === "development" ? otp : undefined,
    });
  } catch (error) {
    console.log("OTP sending error:", error);
    return res.status(500).json({
      sucess: false,
      message: error.message,
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// signup controller
exports.signUp = async (req, res) => {
  try {
    const { fullname, email, password, confirmPassword, otp } = req.body;

    // 1. Validate input
    if (!fullname || !email || !password || !confirmPassword || !otp) {
      return res.status(403).json({
        success: false,
        message: "All fields are required",
      });
    }

    // 2. Check password match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password and confirm password do not match. Try again.",
      });
    }

    // 3. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already registered",
      });
    }

    // 4. Fetch most recent OTP
    const recentOtpRecord = await OTP.findOne({ email }).sort({ createdAt: -1 });

    if (!recentOtpRecord) {
      return res.status(400).json({
        success: false,
        message: "OTP not found",
      });
    }

    if (otp !== recentOtpRecord.otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // 5. Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 6. Create profile
    const profileDetails = await Profile.create({
      gender: null,
      contactNumber: null,
    });

    // 7. Create user
    const user = await User.create({
      fullname,
      email,
      password: hashedPassword,
      contactNumber: null,
      additionalDetails: profileDetails._id,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${fullname}`,
      role: "user", // static role
    });

    // 8. Generate JWT token
    const payload = {
      id: user._id,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });

    // 9. Set token in cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 2 * 60 * 60 * 1000, // 2 hours
    });

    // 10. Send response
    return res.status(200).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        fullname: user.fullname,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({
      success: false,
      message: "User cannot be registered. Please try again.",
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
