require('dotenv').config();

const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI ,{
}).then(()=>{
    console.log("Connection Was Successful")
}).catch((e)=>{
    console.log(e)
});

