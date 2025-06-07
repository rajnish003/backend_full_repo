const bcrypt = require('bcrypt');
const OTP = require('../../models/OTP');
const User = require('../../models/User');
const otpGenerator = require('otp-generator');

exports.sendResetOTP= async(req , res)=>{
        try {
            const {email} = req.body;

            if(!email){
                res.status(401).json({
                    success:false,
                    message:'All fields required'
                })
            }

           const checkUserExist = OTP.findOne({email});

           if(!checkUserExist){
            res.status(404).json({
                success:false,
                message:'User not found',
            })
           }

        // for generating otp we can use library which generate the OTP without intraction with Database
        var otp = otpGenerator.generate(6,{
               upperCaseAlphabets: false,
               lowerCaseAlphabets: false,
               specialChars: false,
            });
            // console.log("Generated Otp: ",otp);

        // check generated otp is uniqe or not 
        let result = OTP.findOne({otp:otp});

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

        // create the entry in the data base 

        const otpBody = await OTP.create(otpPayload);
        console.log(otpBody);

        // here we use node mailer to send the otp on the email 

        // return the response
            res.status(200).json({
                success:true,
                message:"OTP sent successfully",
            })


        } catch (error) {
            console.log(error);
            res.status(500).json({
                success:false,
                message:"Internal Server error, Please try again !",
            })
        }
};

exports.resetPassword = async (req , res) => {
    try {
        const { email, otp, newPassword, confirmPassword } = req.body;

        // 1. Check if passwords match
        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'New Password and Confirm Password do not match',
            });
        }


        // 2. Find the OTP record
        const otpRecord = await OTP.findOne({ email, otp }).sort({ createdAt: -1 }).exec();

        if (!otpRecord) {
            return res.status(401).json({
                success: false,
                message: 'Invalid OTP',
            });
        }

        // 3. Check if OTP is expired
        if (otpRecord.expiresAt < Date.now()) {
            await OTP.deleteOne({ email }); // Clean up expired OTP
            return res.status(400).json({
                success: false,
                message: 'OTP has expired',
            });
        }

        // 4. Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // 5. Update user's password
        const user = await User.findOneAndUpdate(
            { email },
            { password: hashedPassword },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        // 6. Delete the OTP record
       await OTP.deleteOne({ email });

        // 7. Success response
        return res.status(200).json({
            success: true,
            message: 'Password has been reset successfully',
        });

    } catch (error) {
        console.error('Reset password error:', error);
        return res.status(500).json({
            success: false,
            message: 'Something went wrong!',
        });
    }
};
