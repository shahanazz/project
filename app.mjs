import express from 'express';
import path from 'path';
import dbConnect from './config/dbConnect.mjs';
import dotenv from 'dotenv'; 
import nocache from 'nocache';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import passport from './config/passport.mjs';    
import session from'express-session';  
  
dotenv.config();    
    
const __filename = fileURLToPath(import.meta.url);  
const __dirname = dirname(__filename);
            
const app = express();   
const PORT = process.env.PORT || 5050;

dbConnect(); 

import userRoute from './routes/userRoute.mjs'; 
import adminRuote from './routes/adminRoute.mjs';
import errorHandler from './middleware/errorHandler.mjs';
import errorController from "./controller/errorController.mjs";

app.use(nocache());   
   
// Middlewares
app.use(express.json()); 
app.use(express.urlencoded({extended : false}))
app.use(express.static(path.join(__dirname,'public')));
app.use(express.json());  

// Session middleware 
app.use(session({ 
    secret: process.env.USER_SESSION_SECRET || 'secret', 
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false}         
}));

// Session handling middleware
app.use((req, res, next) => {
    res.locals.userLoggedIn = req.session;
    next();
});

// View engine
app.set('view engine' ,'ejs');    
app.set('views','views'); 
   
// Passport Initialization
app.use(passport.initialize());    
app.use(passport.session());                          
              
// Routes 
app.use('/admin', adminRuote);
app.use('/', userRoute);       
  

// Error pages
app.use("/500",errorController.get500)  
app.use(errorController.get404)                      

app.listen(PORT, () =>{      
    console.log(`Server starts to listen on port http://localhost:${PORT}`);
});       
