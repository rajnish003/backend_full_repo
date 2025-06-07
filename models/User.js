const  {default: mongoose} = require("mongoose");
const userSchema  = new mongoose.Schema({
    fullname:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        trim:true
    },
    password:{
        type:String,
        required:true,
        allowNull:false,
    },
    image:{
        type:String,
        required: true,
    },
    token:{
        type:String,
    },
    resetPasswordExpires:{
        type: Date,
    },
    additionalDetails:{
        type:mongoose.Schema.Types.ObjectId,
        required: true,
        ref:"Profile",      
    },
})
module.exports=mongoose.model("User",userSchema);