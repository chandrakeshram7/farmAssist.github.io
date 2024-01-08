const mongoose = require('mongoose');
const farmerData = new mongoose.Schema({
    name:{
        type: String,
        required:true
    },
    mobile:{
        type: Number,
        required:true,
        unique:true
    },
    age:{
        type:Number,
        required:true
    },
    income:{
        type: String,
        required:true
    },
    crop:{
        type: String,
        required:true
    },
    locality:{
        type:String,
        
    },
    landmark:{
        type:String,
        
    },
    state:{
        type:String,
        required:true
    },
    fieldsize:{
        type:Number,
        required:true
    },
    schemeavail:{
        type:String,
        
    },
    wateravail:{
        type:String,
        
    },
    currpassword:{
        type:String,
        required:true
    },
    confpassword:{
        type:String,
        required:true
    }



})
const Register = new mongoose.model("Register", farmerData);
module.exports= Register;