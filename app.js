//Controller Logic MVC Architeture


const express = require('express');
const app = express();
const path = require('path');
const hbs = require('hbs');
const session = require('express-session');
const port = process.env.PORT || 3000
const bodyParser = require('body-parser');
require('./src/db/conn');
const Register= require('./src/models/registration')
const Feedback = require('./src/models/feedback')
app.use(express.json());
app.use(bodyParser.urlencoded({extended:false}));
const view_path = path.join(__dirname,'./views');
const partial_path = path.join(__dirname,'./partials');
hbs.registerPartials(partial_path);
app.use(express.static(view_path));
app.set("view engine","hbs")
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const flash = require('express-flash');
const mailer = require('./src/mailer');
const crypto = require('crypto');
const base64Image = user.image.data.toString('base64');
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
        return;
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
// let Storage = multer.diskStorage({
//     destination:'./user_photos/images/',
//     filename: (req,file, cb)=>{
//         // cb(null, Date.now(+file.originalname))
//         cb(null, file.originalname)
//     }
// })

const Storage = multer.memoryStorage();
let upload = multer({
    storage: Storage
})

function isAuthenticated(req, res, next) {
    if (req.url === '/' || req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
  }



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
                    filename: req.file.originalname,
                    contentType: req.file.contentType,
                    data: req.file.buffer,
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
    res.render('dashboard', { user: req.user , base64Image });
    
  });
 
  app.post('/updateProfile', upload.single('image'), async (req, res) => {
    try {
       // Check if the user is logged in
      
   
       // Update the user's profile information in the database
       const updateObject = {
        $set: {
            name: req.body.name,
            email: req.body.email,
            mobile: req.body.mobile,
            age: req.body.age,
            income: req.body.income,
            category: req.body.category,
            subcategory: req.body.subcategory,
            district: req.body.district,
            pincode: req.body.pincode,
            fieldsize: req.body.fieldsize,
        },
    };

    // If there's a file uploaded, update the image information
    if (req.file) {
        updateObject.$set.image = {
            filename: req.file.filename,
            path: req.file.path,
            size: req.file.size,
        };
    }
    console.log('User ID:', req.user.email);
    console.log('Request Body:', req.body);
    // Update the user's profile information in the database
    await Register.updateOne(
        
        { email: req.user.email },
        updateObject
    );

   
       // Update the session information with the new data
       req.session.name = req.body.name;
       req.session.email = req.body.email;
       req.session.mobile = req.body.mobile;
       req.session.age = req.body.age;
       req.session.income = req.body.income;
       req.session.category = req.body.category;
       req.session.district = req.body.district;
       req.session.pincode = req.body.pincode;
       req.session.fieldsize = req.body.fieldsize;
       req.session.mobile = req.body.mobile;
       if (req.file) {
        req.session.image = req.file.filename;
    }
   
       // Redirect to the dashboard page
       res.redirect('/dashboard');
    } catch (err) {
       console.error(err);
       res.send('An error occurred. Please try again later.');
    }
   });
app.get('/updateProfile',isAuthenticated,(req, res)=>{
    res.render('updateProfile', {user:req.user});
})

app.post('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Internal Server Error');
        }
        res.redirect('/');
    });
   
});

app.get('/',(req, res)=>{
    
    res.render("index",{ user: req.user })
});
app.get('/aboutus',isAuthenticated,(req, res)=>{
    res.render("aboutus", { user: req.user })
});
app.get('/contactus',isAuthenticated,(req, res)=>{
    res.render("contactus",{ user: req.user })
});
app.get('/news',isAuthenticated,(req, res)=>{
    res.render("news",{ user: req.user })
});
app.get('/registration',(req, res)=>{
    res.render("registration",{ user: req.user })
});
app.get('/schemes',isAuthenticated, (req,res)=>{
    res.render('schemes',{ user: req.user })
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
app.get('/getschemes',isAuthenticated,(req,res)=>{
    res.render('getschemes',{ user: req.user })
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
app.get('/invalidtoken',(req, res)=>{
    res.render('invalidtoken');
})









app.listen(port,()=>{
    console.log(`Server is running at port no ${port}`)
})
