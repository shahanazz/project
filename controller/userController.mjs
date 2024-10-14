import User from '../models/userModel.mjs';
import Product from '../models/productModel.mjs';
import Category from '../models/categoryModel.mjs';
import Brand from '../models/brandModel.mjs';
import Order from '../models/orderModel.mjs';
import bcrypt from'bcrypt';
import asyncHandler from 'express-async-handler';
import nodemailer from 'nodemailer';
// import Coupon from '../models/couponModel.mjs'

// load home
const loadHomePage = asyncHandler( async(req,res) => {    
    try {

      const productData = await Product.find({status : true})
      .limit(12);
        res.render('index' , {user: req.session.user,products : productData});
    } catch (error) {
        console.log( 'Home page is not Loading ',error.messsage);
        res.status(500).render('500');
    }
});  

// Hash password
const securePassword = async(password) =>{
    try {
        
        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash;

    } catch (error) {
        console.log(error.message); 
    } 
};

import crypto from 'crypto';

// Generate a random referral code
const generateReferralCode = () => {
    return crypto.randomBytes(6).toString('hex').toUpperCase(); 
};


const sendVerifyMail = asyncHandler(async (username,email,otp,user_id) =>{
    try {   
         
       const transporter = nodemailer.createTransport({
            host : 'smtp.gmail.com',
            port : 587, 
            secure : false,
            auth :{
                user : process.env.SMTP_MAIL,
                pass : process.env.SMTP_PASSWORD,
            }
        });

        const mailOptions = {
            from : process.env.SMTP_MAIL,
            to : email,
            subject : 'OTP Verification',
            html : `<p> Hey ${username}, </p> <br>
            <b>${otp}</b> <br> please verify your account using the OTP
            <p> Note : The OTP only valid for 1 minute!!! </p>`
        }
        console.log(otp);

        transporter.sendMail(mailOptions, (error, info)=> {

            if(error){
               console.log(error.message);
            }else{
                console.log('email has been send to the user',info.response);
            }
        })

    } catch (error) {
        console.log(error.message);
    }
});

// genarate OTP
const generateOtp = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
};
  

//load registaration page
const loadSignup = asyncHandler( async(req,res) => {
    try {

        res.render('signup')

    } catch (error) {

        console.log('signup page is not loading',error.mesage);
        res.status(500).send('server error');

    }
});      
 
// // register user
// const signup = async (req, res) => {
//   try {
//     // 1- Destructure values from req body
//     const { email, password, mobile, username,referalCode } = req.body;

//     // check if all fields are filled out
//     if (!username || !email || !mobile || !password) {
//       return res.render('signup', { message: 'Please fill out all fields' });
//     }

//     // check if user already exists
//     const findUser = await User.findOne({ email });
//     if (findUser) {
//       return res.render('signup', { message: 'User with this email already exists' });
//     }

   
//     const spassword = await securePassword(password);

//     let referalCodes = generateReferralCode();
//     console.log(referalCodes);

//     const user = new User({
//       username,
//       email,
//       mobile,
//       password: spassword,
//       referalCodes: referalCodes,
//     });

//     const userData = await user.save();

//     if (userData) {

//       if (referalCode) {
//         const referrer = await User.findOne({ referalCodes: referalCode });
//         if (referrer) {
        
//           referrer.wallet = (referrer.wallet || 0) + 100;
//           referrer.walletHistory.push({
//             date: Date.now(),
//             amount: 100,
//             message: 'Referral bonus',
//             type: 'bonus',
//           });
//           await referrer.save();
//         } else {
//           console.log('Invalid referral code');
//         }
//       }


//       const otpGenerated = generateOtp();

//       // Save OTP and email in session
//       req.session.email = email;
//       req.session.otp = otpGenerated;
//       req.session.otpExpires = Date.now() + 60 * 1000; // 1 minute

//       sendVerifyMail(username, email, otpGenerated, userData._id);  

//       res.render('verifyOtp', { message: 'Your registration has been successful' });
//     } else {
//       res.render('signup', { message: 'Your registration has failed' });
//     }
//   } catch (error) {
//     console.error('Error occurred:', error);
//     res.status(500).render('500');
//   }
// };

const signup = async (req, res) => {
  try {
    
    const { email, password, mobile, username, referalCode } = req.body;
 

    if (!username || !email || !mobile || !password) {
      return res.render('signup', { message: 'Please fill out all fields' });
    }


    const findUser = await User.findOne({ email });
    if (findUser) {
      return res.render('signup', { message: 'User with this email already exists' });
    }

    const findUserByMobile = await User.findOne({ mobile });
    if (findUserByMobile) {
      return res.render('signup', { message: 'User with this number already exists' });
    }

    const spassword = await securePassword(password);


    let referalCodes = generateReferralCode();
    console.log(referalCodes);

    // Create a new user
    const user = new User({
      username,
      email,
      mobile,
      password: spassword,
      referalCodes: referalCodes,
      wallet: 0, 
      walletHistory: [] 
    });

    const userData = await user.save();

    if (userData) {
      if (referalCode) {
      
        const referrer = await User.findOne({ referalCodes: referalCode });
        if (referrer) {
        
          referrer.wallet = (referrer.wallet || 0) + 100;
          referrer.walletHistory.push({
            date: Date.now(),
            amount: 100,
            message: 'Referral bonus',
            type: 'bonus',
          });
          await referrer.save();

     
          userData.wallet = (userData.wallet || 0) + 50; 
          userData.walletHistory.push({
            date: Date.now(),
            amount: 50,
            message: 'Sign-up referral bonus',
            type: 'bonus',
          });
          await userData.save();
        } else {
          console.log('Invalid referral code');
        }
      }

  
      const otpGenerated = generateOtp();
      req.session.email = email;
      req.session.otp = otpGenerated;
      req.session.otpExpires = Date.now() + 60 * 1000; // 1 minute

      sendVerifyMail(username, email, otpGenerated, userData._id);  

      
      res.render('verifyOtp', { message: 'Your registration has been successful' });
    } else {
      res.render('signup', { message: 'Your registration has failed' });
    }
  } catch (error) {
    console.error('Error occurred:', error);
    res.status(500).render('500');
  }
};


// const signup = async (req,res) =>{
//   try {
    
//     const { username,email,mobile, password, cpassword } = req.body;
    
//     // check password and confirm password
//     if(password !== cpassword){
//       return res.render('signup' , {message : 'Password and confirm password should be same'});
//     }

//      // check user already exists
//     const findUser = await User.findOne({email});
//     if(findUser){
//       return res.render('signup' , {message : 'User already existd in this email'});
//     }

//     const otp = generateOtp();

//     const emailSent = await sendVerificationMail(username,email,otp);

//     if(!emailSent){
//       return res.json('email error')
//     }

//     req.session.userOtp = otp;
//     req.session.userData = {username,email,mobile,password};

//     res.render('verifyOtp');
//     console.log('Otp sent', otp);

//   } catch (error) {
//     console.log('error while saving user to database',error.message);
//     res.status(500).render('500' ,{message : 'internal server error'});
//   }
// } 

  

// load otp
const loadOtp = asyncHandler( async (req,res) =>{
    try {
        res.render('verifyOtp');
    } catch (error) {
        console.log(error.message);
    }
}) 

// verify otp

// const verifyOtp = async(req,res) =>{
//   try {
//    const otp = req.body;
    

//     if(otp === req.session.userOtp){
//       const user = req.session.userData
//       const passwordHash = await securePassword(user.password);

//       const saveUserData = new User({
//         username : user.username,
//         email : user.email,
//         mobile : user.mobile,
//         password : passwordHash 
//       });

//       await saveUserData.save();
//       req.session.user = saveUserData._id;

//       res.json({success : true, redirectUrl : '/login'});
//     }else{
//       res.status(400).json({success :false ,  message : 'Invalid OTP, please try again'})
//     }

//   } catch (error) {

//     console.log('Error in verifying OTP',error.message);
//     res.status(500).json({success : false , message : 'An error occured'});
//   }
// }

// otp validation
const otpValidation = async (req, res) => {
    try {
      const otpInput = req.body.otp; 
      const email = req.session.email;
      const otp = req.session.otp;
      const otpExpires = req.session.otpExpires;
      console.log(otpInput, otp, email);

      if (!otp || !email || !otpExpires) {
        return res.render("verifyOtp", { message: 'Session expired or invalid request' });
      }

      if (Date.now() > otpExpires) {
        return res.render("verifyOtp", { message: 'OTP has expired' });
      }
  
      if (otpInput == otp) {
        const userData = await User.findOneAndUpdate(
          { email: email }, 
          { $set: { isVerified: true } },
          { new: true }
        );
  
         // Clear the session after  verification
        req.session.otp = null;
        req.session.otpExpires = null;
  
        res.render("login", {
          userData,
          email,
          message: "OTP verification successful!",
        });
      } else {
        res.render("verifyOtp", { message: 'Invalid OTP' });
      }
    } catch (error) {
      console.error("Error during verification:", error);
    //   res.redirect("/verifyOtp");
    }
  };
  
// resend otp
const resendOtp = async (req, res) => {
  try {
    const email = req.session.email;
    console.log(email);
    console.log('hi');

    if (!email) {
      return res.status(400).render('verifyOtp', { message: 'Your session has expired' });
    }

    const otp = generateOtp();
    req.session.otp = otp;
    req.session.otpExpires = Date.now() +  60 * 1000;  

    
    // const username = req.session.username; 
    const userId = req.session.userId; 

    await sendVerifyMail(username, email, otp, userId);

    console.log(`OTP resent: ${otp}, Email: ${email}`);

    res.status(200).render('verifyOtp', { message: 'OTP resent to your email' });
  } catch (error) {
    console.error('Error resending OTP:', error);
    res.status(500).render('verifyOtp', { message: 'Failed to resend OTP' });
  }
};




// load login
const loadLogin = asyncHandler( async(req,res) =>{
    try {

        res.render('login' ,{user: req.session.user});
    } catch (error) {
        console.log(error.message);
    }
   
});


// verify login
const VerifyLogin = asyncHandler(async (req, res) => {
  try {
      const { email, password } = req.body;
      const userData = await User.findOne({ email });

      if (!userData) {
          return res.render('login', { user: req.session.user, message: 'Email and password are incorrect' });
      }

      const passwordMatch = await bcrypt.compare(password, userData.password);
      if (passwordMatch) {
          if (!userData.isVerified) {
              return res.render('login', { user: req.session.user, message: 'Please verify your email' });
          } else {
              req.session.user_id = userData._id;
              req.session.user = userData;
              // Optionally save the session
              return req.session.save((err) => {
                  if (err) {
                      console.error('Session save error:', err);
                      return res.render('login', { user: req.session.user, message: 'An error occurred. Please try again.' });
                  }
                  return res.redirect('/');
              });
          }
      } else {
          return res.render('login', { user: req.session.user, message: 'Email and password are incorrect' });
      }
  } catch (error) {
      console.error(error.message);
      return res.render('login', { user: req.session.user, message: 'An error occurred. Please try again.' });
  }
});

// const VerifyLogin = asyncHandler(async (req, res) => {
//   try {
//       const { email, password } = req.body;
//       const userData = await User.findOne({ email });

//       if (!userData) {
//           return res.render('login', { user: req.session.user,message: 'Email and password are incorrect' });
//       }

//       const passwordMatch = await bcrypt.compare(password, userData.password);
//       if (passwordMatch) {
//           if (!userData.isVerified) {
//               return res.render('login', { message: 'Please verify your email' });
//           } else {
//               req.session.user_id = userData._id;
//               req.session.user = userData;
//               return res.redirect('/');
//           }
//       } else {
//           return res.render('login', { user: req.session.user,message: 'Email and password are incorrect' });
//       }
//   } catch (error) {
//       console.error(error.message);
//       return res.render('login', {user: req.session.user,message: 'Email and password are incorrect' });
//   }
// });


// load forget password
const loadForgetPassword = async (req, res) => {
  try {
      res.render('forgetPwd');
  } catch (error) {
      console.error(error.message);
      res.status(500).send('Server Error');
  }
};

const forgetVerify = async (req, res) => {
  try {
      const email = req.body.email;
      const userData = await User.findOne({ email: email });

      if (userData) {
          if (userData.isVerified) {
              // Generate OTP
              const otpGenerated = generateOtp();
              console.log(otpGenerated);

              // Send OTP email
              await resetPasswordMail(userData.username, email, otpGenerated);

              
              req.session.email = email;
              req.session.otp = otpGenerated;
              req.session.otpExpires = Date.now() + 60000; // OTP expires in 1 minute

              
              res.render("forgetOtp", { message: 'Enter the OTP sent to your email' });
          } else {
              
              res.render('forgetPwd', { message: "Your account is not verified. Please verify your account first." });
          }
      } else {
          
          res.render('forgetPwd', { message: "User email not found." });
      }
  } catch (error) {
      console.error(error.message);
      res.status(500).send('Server Error');
  }
};



const resetPasswordMail = asyncHandler(async (username, email, otp) => {
  try {
      const transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 587,
          secure: false, // true for 465, false for other ports
          auth: {
              user: process.env.SMTP_MAIL,
              pass: process.env.SMTP_PASSWORD,
          },
      });   

      const mailOptions = {
          from: process.env.SMTP_MAIL,
          to: email,
          subject: 'Reset Password Verification',
          html: `<p>Hey ${username},</p><br>
          <b>${otp}</b><br>Please verify your account using the OTP.
          <p>Note: The OTP is only valid for 1 minute!</p>`,
      };
      console.log(otp);

      await transporter.sendMail(mailOptions);
      console.log('Email has been sent to the user');
  } catch (error) {
      console.error(error.message);
  }
});


// fordet pwd otp verification
const forgetPasswordOtpVerify = async (req, res) => {
  try {
    const otpInput = req.body.otp; 
    const email = req.session.email;
    const otp = req.session.otp;
    const otpExpires = req.session.otpExpires;
    console.log(otpInput, otp, email);

    if (!otp || !email || !otpExpires) {
      return res.render("verifyOtp", { message: 'Session expired or invalid request' });
    }

    if (Date.now() > otpExpires) {
      return res.render("verifyOtp", { message: 'OTP has expired' });
    }

    if (otpInput == otp) {
      const userData = await User.findOneAndUpdate(
        { email: email }, 
        { $set: { isVerified: true } },
        { new: true }
      );

       // Clear session after successful verification
      req.session.otp = null;
      req.session.otpExpires = null;

      res.render("reenterPwd", {
        userData,
        email,
        message: "OTP verification successful!",
      });
    } else {
      res.render("verifyOtp", { message: 'Invalid OTP' });
    }
  } catch (error) {
    console.error("Error during verification:", error);
  //   res.redirect("/verifyOtp");
  }
};

// new password
const newPassword = async(req,res)=>{
  try {
    const password = await bcrypt.hash(req.body.password,10)
    await User.findOneAndUpdate({email:req.session.forgotEmail,isBlocked:false},{$set:{password:password}})
    res.redirect("/login")
  } catch (error) {
    console.log(error.message);
  }
}


// // forgot password
// const loadForgetPassword = asyncHandler(async(req,res) =>{
//     try {
        
//         res.render('forgotPassword');
//     } catch (error) {
//         console.log(error.message);
//     }
// })  

// logout user
const userLogout = asyncHandler( async(req,res) =>{
    try {
         
        req.session.destroy();
        res.redirect('/');
    } catch (error) {
        console.log(error.message);  
    }
})

// load shop
// const loadShop = asyncHandler(async (req, res) => {
//   try {
//       let page = 1;
//       if (req.query.page) {
//           page = parseInt(req.query.page, 10); // Change the radix to 10
//       }

//       const limit = 9;

//       // Count products
//       const count = await Product.countDocuments({ status: true });
//       const categories = await Category.find({ status: true }).exec();
//       console.log(categories, 'catttttt');

//       // console.log('offered -->' , categories.categoryOffer ? categoryOffer : '');

//       // Fetch products
//       const productData = await Product.find({ status: true })
//           .populate('category')
//           .limit(limit)
//           .skip((page - 1) * limit)
//           .exec();

//       // Calculate sale price for each product
//       const productsWithSalePrice = productData.map(product => {
//         const categoryOffer = product.category ? product.category.categoryOffer : 0;
//         console.log(categoryOffer , 'offfff')

//         // Initialize sale price with regular price
//         let saleprice = product.regularprice;

//         // Apply category offer if available
//         if (categoryOffer > 0) {
//             saleprice = product.regularprice - (product.regularprice * (categoryOffer / 100));
//         }

//         // Round the sale price
//         saleprice = Math.round(saleprice);
//         console.log(saleprice, 'sal');

//         return {
//             ...product._doc, // Spread product properties
//             saleprice,       // calculated sale price
//             appliedOffer: categoryOffer 
//         };
//     });

//       res.render('shop', {
//           products: productsWithSalePrice, // Use the modified products
//           totalPages: Math.ceil(count / limit),
//           currentPage: page,
//           category: categories, // Updated to match variable name
//           limit,
//       });

//   } catch (error) {
//       console.log(error.message);
//       res.redirect("/500");
//   }
// });

const loadShop = asyncHandler(async(req,res) =>{
  try {

    let page = 1;
    if (req.query.page) {
      page = parseInt(req.query.page, 3);           
    }
     
    const limit = 9;   
    
    // Count  products
    const count = await Product.countDocuments({ status : true });
    const category = await Category.find({status: true}).exec();
    
    const productData = await Product.find({status: true})
      .populate('category')
      .limit(limit)
      .skip((page - 1) * limit)
      .exec();
    
    res.render('shop', {
      products: productData,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      category : category,
      limit,
    });
    
  } catch (error) { 
    console.log(error.message);
    res.redirect("/500")
  }
});
   


// load single product page
const loadSingleProduct = asyncHandler(async (req, res) => {
  try {
    const productId = req.params.id;
    
    
    const productData = await Product.findById(productId)
      .populate('category')
      .populate('brand');

   
  
    //related products
    const relatedProducts = await Product.find({
      _id: { $ne: productId }, // avoid current prdct
      category: productData.category._id 
    }).limit(4);

  
    res.render('single-product', { product: productData, relatedProducts });
  } catch (error) {
    console.log(error.message);
    res.redirect("/500");
  }
});


// filter product
const filterProduct = asyncHandler(async (req, res) => {
  try {
      const user = req.session.user;
      const category = req.query.category;
      const color = req.query.color;
      const brand = req.query.brand;  

      let categoryId = null;
      let brandId = null;

      
      if (category) {
          const findCategory = await Category.findOne({ category: category });
          if (findCategory) {
              categoryId = findCategory._id;
          }
      }

     
      if (brand) {
          const findBrand = await Brand.findOne({ brandName: brand });
          if (findBrand) {
              brandId = findBrand._id;
          }
      }

      
      const query = {
          status: true
      };

      if (categoryId) {
          query.category = categoryId;
      }

      if (brandId) {
          query.brand = brandId; 
      }

      if (color) {
          query.color = color;
      }

      console.log(query);

      //filtered products
      const findProducts = await Product.find(query);
      console.log(findProducts);

      // Pagination
      let itemsPerPage = 6;
      let currentPage = parseInt(req.query.page) || 1;
      let startIndex = (currentPage - 1) * itemsPerPage;
      let endIndex = startIndex + itemsPerPage;
      let totalPages = Math.ceil(findProducts.length / itemsPerPage);
      const currentProduct = findProducts.slice(startIndex, endIndex);

      const categories = await Category.find({ status: true });
      const brands = await Brand.find({ status: true }); 

      res.render("shop", {
          user: user,
          products: currentProduct,
          category: categories,
          brand: brands,
          totalPages,
          currentPage,
          selectedCategory: category || null,
          selectedBrand: brand || null,
          selectedColor: color || null
      });

  } catch (error) {
      console.log(error.message);
  }
});



// // // USER PROFILE DETAILS  // // //

// 1) load user profile 
const loadProfile = async(req,res) =>{
  try {

    const user = await User.findOne({_id:req.session.user_id});
    res.render('profile',{user:user});
  } catch (error) {
    console.log(error.message);
    res.status(500).render('500');
  }
}

// 2) edit profile

const loadEditProfile = async(req,res)=>{
  try {
    const profileId = req.params.id;
    const profile = await User.findOne({_id:profileId})
    res.render("editProfile",{user:profile})
  } catch (error) {
    res.redirect("/500")
    console.log(error.message);
  }
}


// 3) update profile
const updateProfile = async(req,res) =>{
  try {

    const  profileId  = req.session.user_id
    const editedProfile = await User.updateOne({ _id : profileId },{
      $set :
      {
        username: req.body.username ,
        email : req.body.email ,
        mobile : req.body.mobile
      }
    })
    res.redirect("/profile");
  } catch (error) {
    console.log(error.message);
    res.redirect('/500');
  }
}


// advanced searching
const sort = async (req, res) => {
  try {
    const { sort } = req.query;
    console.log(sort);
    let sortCriteria = {};

    switch (sort) {
      case 'popularity':
        sortCriteria = { orderCount: -1 } 
        break;
      case 'price_low_to_high':
        sortCriteria = { saleprice: 1 };
        break;
      case 'price_high_to_low':
        sortCriteria = { saleprice: -1 };
        break;
      case 'average_ratings':
        sortCriteria = { averageRating: -1 };
        break;
      case 'featured':
        sortCriteria = { featured: -1 };
        break;
      case 'new_arrivals':
        sortCriteria = { createdOn: -1 };
        break;
      case 'aA_zZ':
        sortCriteria = { productname: 1 };
        break;
      case 'zZ_aA':
        sortCriteria = { productname: -1 };
        break;
      default:
        sortCriteria = { createdOn : 1 };
    }

    //  sort criteria
    const allProducts = await Product.find({status : true}).sort(sortCriteria);
    console.log(allProducts);

    // Pagination
    const itemsPerPage = 6;
    const currentPage = parseInt(req.query.page) || 1;
    const totalItems = allProducts.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentProduct = allProducts.slice(startIndex, startIndex + itemsPerPage);

   
    const category = await Category.find({ status: true });

   
    res.render("shop", {
      user: req.user, 
      products: currentProduct,
      category : category,
      totalPages,
      currentPage,
      sort: sort || 'new_arrivals', 
      selectedCategory: category || null,
      selectedBrand: req.query.brand || null,
      selectedColor: req.query.color || null
    });
  } catch (error) {
    console.log(error.message);
    res.redirect('/500');
  }
};


// search functionlity
const searchProduct = async (req, res) => {
  try {
    const query = req.query.query || ''; 
    const category = await Category.find({ status: true });
    const brand = await Brand.find({ status: true });

   
    let searchQuery = {};
    if (query) {
      searchQuery.productname = new RegExp(query, 'i'); 
    }

    
    // const allProducts = await Product.find(searchQuery);
    const allProducts = await Product.find({ ...searchQuery, status: true });

    
   
    const itemsPerPage = 6;
    const currentPage = parseInt(req.query.page) || 1;
    const totalItems = allProducts.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentProduct = allProducts.slice(startIndex, startIndex + itemsPerPage);

    res.render('shop', {
      products: currentProduct,
      query,
      category,
      brands: brand,
      totalPages,
      currentPage
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).redirect('/500');
  }
}


const combinedSearchFilterSort = async (req, res) => {
  try {
    // Get parameters from the request
    const query = req.query.query || '';
    const category = req.query.category;
    const color = req.query.color;
    const brand = req.query.brand;
    const sort = req.query.sort || 'new_arrivals';

    // Build the base query object
    let searchQuery = { status: true };

    // Add search criteria
    if (query) {
      searchQuery.productname = new RegExp(query, 'i'); // Regex for case-insensitive search
    }

    // Add filter criteria
    if (category) {
      const findCategory = await Category.findOne({ category });
      if (findCategory) {
        searchQuery.category = findCategory._id;
      }
    }

    if (brand) {
      const findBrand = await Brand.findOne({ brandName: brand });
      if (findBrand) {
        searchQuery.brand = findBrand._id;
      }
    }

    if (color) {
      searchQuery.color = color;
    }

    // Fetch products based on the built searchQuery
    const allProducts = await Product.find(searchQuery);

    // Sorting criteria
    let sortCriteria = {};
    switch (sort) {
      case 'popularity':
        sortCriteria = { orderCount: -1 };
        break;
      case 'price_low_to_high':
        sortCriteria = { saleprice: 1 };
        break;
      case 'price_high_to_low':
        sortCriteria = { saleprice: -1 };
        break;
      case 'average_ratings':
        sortCriteria = { averageRating: -1 };
        break;
      case 'featured':
        sortCriteria = { featured: -1 };
        break;
      case 'new_arrivals':
        sortCriteria = { createdOn: -1 };
        break;
      case 'aA_zZ':
        sortCriteria = { productname: 1 };
        break;
      case 'zZ_aA':
        sortCriteria = { productname: -1 };
        break;
      default:
        sortCriteria = { createdOn: 1 };
    }

    // Apply sorting to the filtered products
    const sortedProducts = allProducts.sort((a, b) => {
      for (const key in sortCriteria) {
        if (sortCriteria[key] === 1) {
          if (a[key] > b[key]) return 1;
          if (a[key] < b[key]) return -1;
        } else if (sortCriteria[key] === -1) {
          if (a[key] < b[key]) return 1;
          if (a[key] > b[key]) return -1;
        }
      }
      return 0; // Equal
    });

    // Pagination
    const itemsPerPage = 6;
    const currentPage = parseInt(req.query.page) || 1;
    const totalItems = sortedProducts.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentProduct = sortedProducts.slice(startIndex, startIndex + itemsPerPage);

    // Fetch categories and brands for rendering
    const categories = await Category.find({ status: true });
    const brands = await Brand.find({ status: true });

    res.render("shop", {
      user: req.user,
      products: currentProduct,
      category: categories,
      brand: brands,
      totalPages,
      currentPage,
      selectedCategory: category || null,
      selectedBrand: brand || null,
      selectedColor: color || null,
      query,
      sort: sort
    });
  } catch (error) {
    console.log(error.message);
    res.redirect('/500');
  }
};


const loadWallet = async(req,res) =>{
  try {
    const {user_id} = req.session
    const user = await User.findOne({_id:user_id})

    user.walletHistory.sort((a, b) => b.date - a.date);
    
    res.render("wallet",{user})
  } catch (error) {
    console.log(error.message);

  }
}

// const loadInvoice = async (req, res) => {
//   try {
//       console.log("helloooo");
//       // await invoice.invoice(req, res); 
//       res.render('invoice')
//   } catch (error) {
//       console.log(error.message);   
//   }
// }

const loadInvoice = async(req,res) =>{   
  try {
    const orderId = req.params.id;
    const userId = req.session.user_id; 
      const order = await Order.findOne({ _id: orderId, userId: userId })
    .populate('products.productId')
    .populate('userId')
    .populate('address'); 

    if (!order) {
      return res.status(400).redirect('/400');
  }

    res.render('invoice', {order});
  } catch (error) {
    console.log(error.message);      
  }  
}


const generateInvoicePDF = async (req, res) => {
  try {
      const orderId = req.params.id;
      const userId = req.session.user_id; // assuming user_id is in the session
      const order = await Order.findOne({ _id: orderId, userId: userId })
    .populate('products.productId')
    .populate('userId');
      
    if (!order) {
      return res.status(403).send("Unauthorized access");
  }
      if (!order) {
          return res.status(404).send("Order not found");
      }

      const products = order.products.map(async (productItem) => {
          const product = productItem.productId;
          return {
              item: product.productname,
              description: product.description,
              quantity: productItem.quantity,
              amount: productItem.price * productItem.quantity,
          };
      });

      const invoice = {
          invoice_nr: order._id.toString(),
          shipping: {
              name: order.shipping.username, 
              address: order.shipping.address, 
              city: order.shipping.city,
              state: order.shipping.state,
              country: order.shipping.country,
          },
          items: await Promise.all(products),
          subtotal: order.totalPrice,
          paid: order.amountPayable || 0,
      };

      const invoicePath = generateInvoicePDF(invoice);

      res.download(invoicePath, `invoice-${invoice.invoice_nr}.pdf`, (err) => {
          if (err) {
              console.error("Error sending invoice PDF:", err);
              res.status(500).send("Error generating PDF.");
          }
      });
  } catch (error) {
      console.error("Error generating invoice:", error);
      res.status(500).send("Server error.");
  }
};


const filterSortSearchProducts = asyncHandler(async (req, res) => {
  try {
    const user = req.session.user;
    
    // Get query parameters for search, filter, and sort
    const { query: searchTerm, category, color, brand, sort } = req.query;
    
    let categoryId = null;
    let brandId = null;

    // Find Category by Name
    if (category) {
      const findCategory = await Category.findOne({ category });
      if (findCategory) {
        categoryId = findCategory._id;
      }
    }

    // Find Brand by Name
    if (brand) {
      const findBrand = await Brand.findOne({ brandName: brand });
      if (findBrand) {
        brandId = findBrand._id;
      }
    }

    // Build the query object for filtering
    const query = { status: true };

    if (categoryId) {
      query.category = categoryId;
    }

    if (brandId) {
      query.brand = brandId;
    }

    if (color) {
      query.color = color;
    }

    // Search by product name or description (case insensitive)
    if (searchTerm) {
      query.productname = new RegExp(searchTerm, 'i'); // Search product name with case-insensitive regex
    }

    // Sort Logic
    let sortCriteria = {};
    switch (sort) {
      case 'popularity':
        sortCriteria = { orderCount: -1 };
        break;
      case 'price_low_to_high':
        sortCriteria = { saleprice: 1 };
        break;
      case 'price_high_to_low':
        sortCriteria = { saleprice: -1 };
        break;
      case 'average_ratings':
        sortCriteria = { averageRating: -1 };
        break;
      case 'featured':
        sortCriteria = { featured: -1 };
        break;
      case 'new_arrivals':
        sortCriteria = { createdOn: -1 };
        break;
      case 'aA_zZ':
        sortCriteria = { productname: 1 };
        break;
      case 'zZ_aA':
        sortCriteria = { productname: -1 };
        break;
      default:
        sortCriteria = { createdOn: 1 }; // Default sorting by date
    }

    // Fetch filtered and sorted products from the database
    const allProducts = await Product.find(query).sort(sortCriteria);
    
    // Pagination
    const itemsPerPage = 6;
    const currentPage = parseInt(req.query.page) || 1;
    const totalItems = allProducts.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentProduct = allProducts.slice(startIndex, startIndex + itemsPerPage);

    // Fetch categories and brands for rendering filters
    const categories = await Category.find({ status: true });
    const brands = await Brand.find({ status: true });

    // Render the shop page with all filters, products, and sorting
    res.render("shop", {
      user,
      products: currentProduct,
      category: categories,
      brand: brands,
      totalPages,
      currentPage,
      selectedCategory: category || null,
      selectedBrand: brand || null,
      selectedColor: color || null,
      sort: sort || 'new_arrivals',
      searchTerm: searchTerm || '',
    });

  } catch (error) {
    console.log(error.message);
    res.redirect('/500'); // Handle errors gracefully
  }
});


export default  {
    loadHomePage,
    loadSignup,
    signup,
    loadLogin,
    VerifyLogin,
    userLogout,
    loadForgetPassword,
    loadOtp,
    resetPasswordMail,
    // verifyOtp,
    otpValidation,  
    resendOtp, 
    forgetVerify,
    forgetPasswordOtpVerify, 
    newPassword,
    loadShop,
    loadSingleProduct,
    filterProduct,
    combinedSearchFilterSort,
    loadProfile,
    loadEditProfile,
    updateProfile,
    searchProduct,
    sort,
    loadWallet,
    loadInvoice,
    generateInvoicePDF,
    filterSortSearchProducts,

}