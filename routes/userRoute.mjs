import express from "express";
import userController from "../controller/userController.mjs";
import cartController from "../controller/cartController.mjs";
import addressController from "../controller/addressController.mjs";
import orderController from "../controller/orderController.mjs";
import wishlistController from '../controller/wishlistController.mjs';
import auth from "../middleware/auth.mjs";
import validator from "../middleware/validator.mjs";
import passport from "../config/passport.mjs";
import session from'express-session';
import flash from 'connect-flash';
import productController from "../controller/productController.mjs";

const router = express();

// View engine setup
router.set("view engine", "ejs");
router.set("views", "views/user");

router.use(session({ 
  secret: process.env.USER_SESSION_SECRET || 'secret', 
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false} 
}));
router.use(flash());

// ROUTES   

// USER Routes
router.get("/", userController.loadHomePage);
router.get('/' ,auth.checkBlockStatus ,userController.loadHomePage);
router.get("/signup", auth.isLogout, userController.loadSignup);
router.post("/signup", validator.signupValidation, userController.signup);
router.get("/login", auth.isLogout, userController.loadLogin);
router.post("/login", userController.VerifyLogin);
router.get("/otp", userController.loadOtp);
router.post("/verify-otp", userController.otpValidation);
router.get("/resendOtp", userController.loadOtp);
router.post("/resendOtp", userController.resendOtp);

// FORGET Password 
router.get("/forget", userController.loadForgetPassword);
router.post("/forget", userController.forgetVerify);
router.post("/password-otp-veification",userController.forgetPasswordOtpVerify);
router.post("/new-Password",userController.newPassword);
router.get("/logout", auth.isLogin, userController.userLogout);
 
// SHOP Routes
router.get("/shop", userController.loadShop);
router.get("/singleProduct/:id", userController.loadSingleProduct);
router.get("/filter", userController.filterProduct);    
router.get("/sort", userController.sort);
router.get('/searchProduct' , userController.searchProduct);
// Add the route to your router
router.get("/shope", userController.combinedSearchFilterSort);
// router.get('/shope', userController.filterSortSearchProducts);
 
// WISHLIST Routes
router.get('/wishlist' , auth.isLogin , wishlistController.loadWishList);
router.post('/addwishlist/:id', auth.isLogin, wishlistController.addToWishlist);
router.delete('/removewishlist/:id', auth.isLogin, wishlistController.removeFromWishlist);


// CART Routes
router.get("/cart", auth.isLogin, cartController.loadCart);
router.post("/addToCart/:id", auth.isLogin, cartController.addToCart);
router.delete("/deleteCartProduct", cartController.deleteCart);
router.post("/quantityChange", cartController.quantityChange);       

// PROFILE Routes
router.get("/profile", auth.isLogin, userController.loadProfile);
router.get("/editProfile/:id", userController.loadEditProfile);
router.post("/editProfile", userController.updateProfile);

// ADDRESS Routes
router.get("/address", auth.isLogin, addressController.loadAddress);
router.get("/addAddress", auth.isLogin, addressController.addAddress);
router.post("/addAddress", addressController.postAddAddress);
router.get("/editAddress/:id", auth.isLogin, addressController.editAddress);
router.post("/editAddress/:id", addressController.postEditAddress);
router.patch("/removeAddress/:id", addressController.removeAddress);    

// COUPON routes
router.post('/apply-coupon' , orderController.applyCoupon);
router.post('/remove-coupon' , orderController.removeCoupon);
   
// ORDER Routes
router.get("/checkout", auth.isLogin, orderController.loadCheckout);
router.get("/orderAddress", auth.isLogin, orderController.getOrderAddress);
router.post("/orderAddress", auth.isLogin, orderController.postAddAddress);
router.post("/placeOrder", auth.isLogin, orderController.placeOrder);
router.get("/confirmOrder", auth.isLogin, orderController.orderConfirm);
router.patch('/cancelOrder' , auth.isLogin , orderController.cancelOrder);
router.patch('/returnOrder/:id', auth.isLogin, orderController.returnOrder);
router.get("/orderDetails", auth.isLogin, orderController.loadOrderDetails);
router.get('/order/:id' , auth.isLogin, orderController.orderDetails);
router.get('/orderHistory' , auth.isLogin, orderController.loadOrderHistory);
router.post( '/verify-payment', auth.isLogin, orderController.razorpayVerifyPayment);

// router.post('/retryPayment/:orderId', auth.isLogin, orderController.retryPayment);
router.post('/create-payment-order', auth.isLogin, orderController.payment);

router.get("/track", (req, res) => {
  res.render("tracking");            
});

router.get("/mywallet",auth.isLogin,userController.loadWallet);

router.get('/invoice/:id' , auth.isLogin, userController.loadInvoice);
// router.get('/invoice/:id', userController.generateInvoicePDF);


// Google Signup
router.get("/auth/google",passport.authenticate("google", { scope: ["profile", "email"] }));
router.get("/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/auth/google/failure" }),
  (req, res) => {
    res.redirect("/"); // Redirect to home or dashboard after successful login
  }
);



router.get('/auth/google/failure', (req, res) => {  
  res.render('login', { message: 'Login failed. Please try again.' });
});    



export default router;
   