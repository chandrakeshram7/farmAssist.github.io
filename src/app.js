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


// app.get('/',(req, res)=>{
//     res.render("index")
// });
// app.get('/aboutus',(req, res)=>{
//     res.render("aboutus")
// });
// app.get('/contactus',(req, res)=>{
//     res.render("contactus")
// });
// app.get('/news',(req, res)=>{
//     res.render("news")
// });
// app.get('/registration',(req, res)=>{
//     res.render("registration")
// });
// app.get('/schemes', (req,res)=>{
//     res.render('schemes')
// })
// app.get('/thanks', (req,res)=>{
//     res.render('thanks')
// })
// app.get('/feedthanks',(req,res)=>{
//     res.render('feedthanks')
// })
// app.get('/login' ,(req,res)=>{
//     res.render('login')
// })

//Session Management
app.use(session({
    secret: '12345678kadlfkalfk',
    resave: false,
    saveUninitialized: true,
}));

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
                currpassword : spassword,
                confpassword: spassword
    
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

app.post('/login', async (req, res) => {
    const mobile = req.body.mobile;
    const password = req.body.password;

    // Check credentials in MongoDB
    try{
        // const user = await Register.findOne({ mobile});
        
       
        // if(user && password == user.currpassword){
        //     res.render('index',{error:""})
        // }
        // else{
        //     res.render('login', { error: 'Incorrect password. Please try again.' })
        // }
        const user = await Register.findOne({ mobile });
        
        if (user) {
            // Compare entered password with stored password
            const passwordMatch = await bcrypt.compare(password, user.currpassword);
            if (passwordMatch) {
                // Store user information in the session
                req.session.user = req.session.user || {};
                
                req.session.user.name = user.name;
                app.use((req, res, next) => {
                    res.locals.userName = req.session.user.name;
                    next();
                    console.log('Session after login:', req.session);

                });
                res.render('index', {error:"", userName:user.name} );
                userName = user.name;
                
            } else {
                res.render('login', { error: 'Incorrect password. Please try again.' })
            }
        } else {
            res.render('login', { error: 'User Not found! Please try again' })
        }
    
    }catch(error){
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

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

app.get('/dashboard',(req, res)=>{
    res.render('dashboard')
})



// app.get('/dashboard', async (req, res) => {

//     try {
//       // Fetch users from the database
//       const users = await Register.find();
  
//       // Render the 'users' view with user data
//       res.render('dashboard', { users });
//     } catch (error) {
//       console.error(error);
//       res.status(500).send('Error fetching user data.');
//     }
//   });





app.listen(port,()=>{
    console.log(`Server is running at port no ${port}`)
})
