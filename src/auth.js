const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Register = require('../models/Register');
const mailer = require('../mailer'); // Import your mailer module

router.post('/forgot', async (req , res)=>{
    const {email} = req.body;
    try{
        const user = await Register.findOne({email});

        if(!user){
            console.log('User Not found');
            return res.status(404).send('User Not Found!');

        }

        const resetToken = crypto.randomBytes(20).toString('hex');

        const expirationTime = Date.now() + 3600000; 

        user.resetToken = resetToken;
        user.resetTokenExpiration = expirationTime;
        await user.save();


        const resetLink = `http://localhost:3000/forgot?token=${resetToken}`;
        const emailSubject = 'Password Reset';
        const emailBody = `Click on the following link to reset your password: ${resetLink}`;
        await mailer.sendMail(email, emailSubject, emailBody);

        res.render('/login'); //Add another page for reset link successful
    }catch(error){
        console.log(error);
        res.render('/login') //Add an error section below forgot password

    }
} )



module.exports = router;
