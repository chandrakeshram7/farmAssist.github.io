const mongoose = require('mongoose');
mongoose.connect("mongodb://127.0.0.1:27017/farmerRegistration",{
}).then(()=>{
    console.log("Connection Was Successful")
}).catch((e)=>{
    console.log(e)
});

