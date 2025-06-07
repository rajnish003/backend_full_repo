const { default: mongoose } = require("mongoose");
const User = require("../../models/User");
const OTP = require ("../../models/OTP");
const otpGenerator = require('otp-generator')
const bcrypt = require('bcrypt');
const Profile = require("../../models/Profile");
const jwt = require("jsonwebtoken");
const mailSender = require('../../utils/mailSender');

// send Otp 
exports.sendOTP = async (req, res)=>{
    try {
        // take user email from request ki body
        const {email} = req.body;
        
        // check user exist or not 
        const checkUserExist = await User.findOne({email});

        // validate
        if(checkUserExist){
            return res.status(403).json({
                success:false,
                message:'User already exist ! try another email'
            })
        }

    // for generating otp we can use library which generate the OTP without intraction with Database
        var otp = otpGenerator.generate(6,{
               upperCaseAlphabets: false,
               lowerCaseAlphabets: false,
               specialChars: false,
            });
            console.log("Generated Otp: ",otp);

            // check generated otp is uniqe or not 
            const result = await OTP.findOne({otp:otp});

            // if otp is exist we generate again 
            if(result){
              otp = otpGenerator.generate(6,{
               upperCaseAlphabets: false,
               lowerCaseAlphabets: false,
               specialChars: false,
                });  

            result  = await OTP.findOne({otp:otp});
            }

            const otpPayload = {email , otp, expiresAt: new Date(Date.now() + 5 * 60 * 1000),};

            // create the entry in database for otp

            const otpBody = await OTP.create(otpPayload);
            // console.log (otpBody);


            res.status(200).json({
                success:true,
                message:'Otp send Successfully',
                otp, // Don't send in production!
            }) ;


    } catch (error) {
    console.log(error);
    return res.status(500).json({
      sucess: false,
      message: error.message,
    });
    }
}

// signup controller
exports.signUp = async (req, res) => {
  try {
    // 1. Fetch data from request body
    const { fullname, email, password, confirmPassword, otp } = req.body;

    // 2. Validate input
    if (!fullname || !email || !password || !confirmPassword || !otp) {
      return res.status(403).json({
        success: false,
        message: "All fields are required",
      });
    }

    // 3. Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password and confirm password do not match. Try again.",
      });
    }

    // 4. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already registered",
      });
    }

    // 5. Fetch the most recent OTP
    const recentOtpRecord = await OTP.find({ email })
      .sort({ createdAt: -1 })
      .limit(1);

    console.log("Recent OTP is", recentOtpRecord);

    // 6. Validate OTP
    if (recentOtpRecord.length === 0) {
      return res.status(400).json({
        success: false,
        message: "OTP not found",
      });
    }

    if (otp !== recentOtpRecord[0].otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // 7. Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 8. Create profile
    const profileDetails = await Profile.create({
      gender: null,
      contactNumber: null,
    });

    // 9. Create user
    const user = await User.create({
      fullname,
      email,
      contactNumber: null,
      password: hashedPassword,
      additionalDetails: profileDetails._id,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${fullname}`,
    });

    // 10. Send success response
    return res.status(200).json({
      success: true,
      message: "User registered successfully",
      user,
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

exports.changepassword = async (req , res)=>{
  try {
    // get oldPassword, newPassword , confirmpassword from req ki body
    const {email , oldPassword , newPassword , confirmPassword} = req.body;

    // validate the fields
    if(!email || !oldPassword || !newPassword || !confirmPassword){
      return res.status(403).json({
        success:false,
        message:"All fields required !"
      })
    }

    // compare new password and newPassword

    if(newPassword !== confirmPassword){
      return res.status(403).json({
        success:false,
        message:'Password and Confirm password does not match !'
      })
    }

    //  find the email from the database
    const user = await User.findOne({email});

    // validation 
    if(!user){
      return res.status(402).json({
        success:false,
        message:'Email not found !'
      })
    }

    // compare the oldpassword(enter by user ) and password  form the database
    const isPasswordMatch = await bcrypt.compare(oldPassword,user.password);

    if(!isPasswordMatch){
      return res.status(400).json({
          success:false,
          message:'Old password is not match'
      })
    }

    // hashed the new created password 
    const hashnewPassword = await bcrypt.hash(newPassword,10);
    user.password = newPassword;
    await user.save();

     // send email notification
    const mailBody = `
    <h2>Password Changed Successfully</h2>
    <p>Hello ${user.fullname},</p>
    <p>Your password has been changed successfully. If you did not make this change, please contact support immediately.</p>
    <p>Regards,<br/>Homeasy Automation Pvt Ltd Team</p>
  `;  

  await mailSender(user.email, "Password Changed Successfully", mailBody);

      return res.status(200).json({
        success:true,
        message:'Password Update sucessfully',
      })


  } catch (error) {
       console.log("Error changing the password");
       return res.status(500).json({
        success:false,
        message:'Something went wrong , please try again',
       })
  }
}




