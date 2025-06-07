const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
    gender:{
        type:String,
    },
    contectNumber:{
            type:Number,
            trim:true,  // it is use to remove white spaces from the string,numbers
    }
})
module.exports = mongoose.model("Profile",profileSchema);