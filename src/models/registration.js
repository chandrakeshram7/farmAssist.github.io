const mongoose = require('mongoose');
const farmerData = new mongoose.Schema({
    name:{
        type: String,
        required:true
    },
    mobile:{
        type: String,
        required:true,
        unique:true
    },
    age:{
        type:Number,
        required:true
    },
    income:{
        type: Number,
        required:true
    },
    category:{
        type: String,
        required:true
    },
    subcategory:{
        type:String,
        required:true
        
    },
    district:{
        type:String,
        required:true
        
    },
    pincode:{
        type:String,
        required:true
    },
    fieldsize:{
        type:Number,
        required:true
    },
    image: {
        filename: String,
        path: String,
        size: Number,
      },
    password:{
        type:String,
        required:true
    }



})
const Register = new mongoose.model("Register", farmerData);
module.exports= Register;