// models/Device.js
const mongoose = require("mongoose");

const deviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String, //  Light, Fan, Plug, AC, etc.
    required: true,
  },
  status: {
    type: String,
    enum: ["ON", "OFF"],
    default: "OFF",
  },
  location: {
    type: String, //  Living Room, Bedroom
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Link device to a user
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model("Device", deviceSchema);
