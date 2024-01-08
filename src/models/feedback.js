const mongoose = require('mongoose');
const farmerFeedback = new mongoose.Schema({
    fname:{
        type: String,
        required:true
    },
    fmobile:{
        type: Number,
        required:true,
        unique:true
    },
    femail:{
        type:String,
        required:true,
        unique:true
    },
    fsubject:{
        type: String,
        required:true
    },
    fmessage:{
        type: String,
        required:true
    }
})
const Feedback = new mongoose.model("Feedback", farmerFeedback);
module.exports= Feedback;