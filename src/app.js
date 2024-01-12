//Controller Logic MVC Architeture


const express = require('express');
const app = express();
const path = require('path');
const hbs = require('hbs');
const session = require('express-session');
const port = process.env.PORT || 3000
const bodyParser = require('body-parser');
require('./db/conn');
const Register= require('./models/registration')
const Feedback = require('./models/feedback')
app.use(express.json());
app.use(bodyParser.urlencoded({extended:false}));
const view_path = path.join(__dirname,'../views');
const partial_path = path.join(__dirname,'../partials');
hbs.registerPartials(partial_path);
app.use(express.static(view_path));
app.set("view engine","hbs")
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const flash = require('express-flash');
const mailer = require('../src/mailer');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
app.use(session({ secret: '123456789', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

const transporter = nodemailer.createTransport({
    service: 'gmail', // use the appropriate email service
    auth: {
      user: 'chandrakeshram31@gmail.com', // your email address
      pass: 'xskj ajof ubkl shdx', // your email password or app-specific password
    },
  });
  

//============================================================================
//Forgot Password Implementation
app.post('/forgot', async (req, res) => {
    const { email } = req.body;
  
    try {
      const user = await Register.findOne({ email });
   
      if (!user) {
        res.render('usernotfound');
      }
      
  
      // Generate a unique reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      
      // Set an expiration time (e.g., 1 hour from now)
      const expirationTime = Date.now() + 3600000; // 1 hour in milliseconds
  
      // Update the user's resetToken and resetTokenExpiration in the database
      user.resetToken = resetToken;
      user.resetTokenExpiration = expirationTime;
      await user.save();
  
      // Send a password reset email with the reset link
      const resetLink = `http://localhost:3000/reset?token=${resetToken}`;
      const emailSubject = 'Password Reset';
      const emailBody = `Click on the following link to reset your password: ${resetLink}`;
      console.log('Reset Token:', resetToken);
      console.log('Expiration Time:', new Date(expirationTime).toLocaleString());
      

// Inside the '/reset' route before saving the user's new password
     console.log('User Found:', user);
     
      await transporter.sendMail({
        from: 'chandrakeshram31@gmail.com',
        to: email,
        subject: emailSubject,
        html: emailBody, 
      });
  
      res.render('forgotmess')
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });
  
  app.post('/reset', async (req, res) => {
    const { token, currpassword } = req.body;
    
    try {
      const user = await Register.findOne({
        resetToken: token,
        resetTokenExpiration: { $gt: Date.now() },
      });
  
      if (!user) {
         res.render('invalidtoken')
      }
  
      // Update the user's password
      const hashedPassword = await bcrypt.hash(currpassword, 10);
      user.password = hashedPassword;
      user.resetToken = undefined;
      user.resetTokenExpiration = undefined;
      await user.save();
  
      res.render('passwordreset')
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });
  


//=======================================
passport.use(new LocalStrategy(
    {usernameField: 'email',passwordField: 'password', passReqToCallback: true },
    async (req, email, password, done)=>{
        try{
            const user = await Register.findOne({email});
            if(!user){
                req.flash('error', 'Incorrect Email ID or Password');
               return done(null, false); 
            }
            // password = await securePassword(password);
            console.log('Stored Password:', user.password);
            console.log('Entered Password:', password);
            const passwordMatch = await bcrypt.compare(password, user.password);
            if(!passwordMatch){
                req.flash('error', 'Incorrect Email ID or Password');
                return done(null, false);

            }
            console.log('User authenticated:', user);
            return done(null, user);
        
        }catch(error){
            console.error('Error during authentication:', error);
            return done(error);
        }
    }
))
passport.serializeUser((user, done) => {
    done(null, user.email);
  });

  passport.deserializeUser(async (email, done) => {
    try {
      const user = await Register.findOne({email});
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

 

  


//Foe Image Uploading and Storage Settings - Using Multer
const multer = require('multer');
let Storage = multer.diskStorage({
    destination:'views/public/images/',
    filename: (req,file, cb)=>{
        // cb(null, Date.now(+file.originalname))
        cb(null, file.originalname)
    }
})


let upload = multer({
    storage: Storage
})





const bcrypt = require('bcrypt');
const securePassword = async (password)=>{
    try{
        const passwordHash = await bcrypt.hash(password,10);
        return passwordHash;

    }catch(error){
        console.log(error.message);
    }
}
app.post('/registration',upload.single('image'),async (req, res)=>{
    try{
        const password = req.body.currpassword;
        const cpassword = req.body.confpassword;
        const spassword = await securePassword(cpassword);
        if(password == cpassword){

            const newFarmer = new Register({
                name : req.body.name,
                email: req.body.email,
                mobile: req.body.mobile,
                age: req.body.age,
                income: req.body.income,
                category: req.body.category,
                subcategory : req.body.subcategory,
                district: req.body.district,
                pincode: req.body.pincode,
                fieldsize : req.body.fieldsize,
                image: {
                    filename: req.file.filename,
                    path: req.file.path,
                    size: req.file.size,
                  },
               
                 password: spassword
    
            })
            const schemecandidate = await newFarmer.save();
            res.status(201).redirect("thanks");
        }
        else {
            res.send('Passwords are not matching');
        }

    }catch(e){
        res.status(400).send(e);
    }
});
app.post('/contactus',async (req, res)=>{
    try{
        console.log(req.body.fmessage)
        const newFeedback = new Feedback({
            fname : req.body.fname,
            fmobile: req.body.fmobile,
            femail: req.body.femail,
            fsubject: req.body.fsubject,
            fmessage: req.body.fmessage
            
        })
        const schemeFeedback = await newFeedback.save();
        res.status(201).render("feedthanks");

    }catch(e){
        res.status(400).send(e);
    }
});

app.post('/login', passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
    failureFlash: true,
  }));


  app.get('/dashboard', isAuthenticated, (req, res) => {
    console.log('Is Authenticated:', req.isAuthenticated());

    // Access user's name using req.user.name
    console.log('User Name:', req.user.name);
    res.render('dashboard', { user: req.user });
    
  });
  function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/');
  }


app.get('/',(req, res)=>{
    
    res.render("index",{userName: res.locals.userName})
});
app.get('/aboutus',(req, res)=>{
    res.render("aboutus", {userName: res.locals.userName})
});
app.get('/contactus',(req, res)=>{
    res.render("contactus")
});
app.get('/news',(req, res)=>{
    res.render("news")
});
app.get('/registration',(req, res)=>{
    res.render("registration")
});
app.get('/schemes', (req,res)=>{
    res.render('schemes')
})
app.get('/thanks', (req,res)=>{
    res.render('thanks')
})
app.get('/feedthanks',(req,res)=>{
    res.render('feedthanks')
})
app.get('/login' ,(req,res)=>{
    res.render('login')
})
app.get('/getschemes',(req,res)=>{
    res.render('getschemes')
})
app.get('/forgot',(req, res)=>{
    res.render('forgot');
})
app.get('/reset', (req, res) => {
    const resetToken = req.query.token;
    res.render('reset', { resetToken });
});
app.get('/forgotmess',(req, res)=>{
    res.render('forgotmess');
})
app.get('/passwordreset', (req,res)=>{
    res.render('passwordreset');
})
app.get('/usernotfound',(req, res)=>{
    res.render('usernotfound');
})
app.get('invalidtoken',(req, res)=>{
    res.render('invalidtoken');
})








app.listen(port,()=>{
    console.log(`Server is running at port no ${port}`)
})
