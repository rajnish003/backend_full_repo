const { default: mongoose } = require("mongoose");
require("dotenv").config();

exports.connect =()=>{
   mongoose.connect(process.env.MONGODB_URL)
   .then(console.log("DB connect sucessfully"))
   .catch((error)=>{
    console.log("DB connction issue");
   })
}



