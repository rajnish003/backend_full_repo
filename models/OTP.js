const mongoose = require("mongoose");

const OtpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    otp: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now, // Use native JS Date.now for default timestamp
        required: true,
    }
});

// Optionally, if you want to auto-delete the OTP after a certain time (e.g., 10 minutes), use expires
// createdAt: { type: Date, default: Date.now, expires: 600 }

module.exports = mongoose.model("OTP", OtpSchema);
