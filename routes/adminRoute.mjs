import express from "express";
import upload from '../config/multer.mjs';

const adminRoute = express();

// view engine setup
adminRoute.set("view engine", "ejs");
adminRoute.set("views", "./views/admin");   

// Import controllers and middleware
import adminController from "../controller/adminController.mjs";
import adminAuth from "../middleware/adminAuth.mjs";
import categoryController from "../controller/categoryController.mjs";
import brandController from "../controller/brandController.mjs";
import productController from "../controller/productController.mjs";
import orderController from "../controller/orderController.mjs";


// ROUTES
adminRoute.get("/", adminAuth.isLogout, adminController.loadLogin);
adminRoute.post("/", adminController.verifyLogin);
adminRoute.get("/home", adminAuth.isLogin, adminController.loadHome);
adminRoute.get("/logout", adminAuth.isLogin, adminController.logout);

// USER Routes
adminRoute.get("/usersList", adminAuth.isLogin, adminController.loadUserList);
adminRoute.post("/block/:id", adminAuth.isLogin, adminController.blockUser);
adminRoute.post("/unblock/:id", adminAuth.isLogin, adminController.unBlockUser);

// CATEGORY Routes
adminRoute.get("/category", adminAuth.isLogin, categoryController.loadCategory);
adminRoute.get("/addCategory", adminAuth.isLogin, categoryController.loadAddCategory);
adminRoute.post("/addCategory", adminAuth.isLogin, categoryController.addCategory);
adminRoute.get("/editCategory", adminAuth.isLogin, categoryController.loadEditCategory);
adminRoute.post("/editCategory", adminAuth.isLogin, categoryController.updateCategory);
adminRoute.get("/deleteCategory", adminAuth.isLogin, categoryController.deletecategory);
   
// BRAND Routes
adminRoute.get("/brand", adminAuth.isLogin, brandController.loadBrand);
adminRoute.get('/addBrand' , adminAuth.isLogin , brandController.loadaddBrandForm);
adminRoute.post('/addBrand' , adminAuth.isLogin, brandController.postBrand);
adminRoute.get('/editBrand' , adminAuth.isLogin, brandController.editBrand);
adminRoute.post('/editBrand' , adminAuth.isLogin, brandController.updateBrand);
adminRoute.get('/deleteBrand', adminAuth.isLogin, brandController.deleteBrand);

// PRODUCT Routes
adminRoute.get("/product", adminAuth.isLogin, productController.loadProduct);
adminRoute.get("/addProduct", adminAuth.isLogin, productController.loadAddProduct);
adminRoute.post("/addProduct", adminAuth.isLogin, upload.array("image", 4), productController.postProduct);
adminRoute.get("/editProduct", adminAuth.isLogin, productController.loadEditPage);
adminRoute.post("/editProduct", adminAuth.isLogin, upload.array("image", 4), productController.postEditProduct);
adminRoute.get("/deleteProduct", adminAuth.isLogin, productController.deleteProduct);

// COUPON routes
adminRoute.get('/coupon' , adminAuth.isLogin, adminController.loadCoupon);
adminRoute.post('/createCoupon' , adminAuth.isLogin , adminController.createCoupon);

// ORDER Routes
adminRoute.get("/orderList", adminAuth.isLogin, orderController.loadAdminOrderList);
adminRoute.patch("/change-order-status",orderController.changeOrderStatus);
adminRoute.get("/orderedProduct/:id",orderController.loadOrderedProduct);

// TOP RATINGS
adminRoute.get('/topProduct' , adminAuth.isLogin, adminController.top10Product);
adminRoute.get('/topCategory' , adminAuth.isLogin, adminController.top10Category);
adminRoute.get('/topBrand' , adminAuth.isLogin, adminController.top10Brand);      

// SALES REPORT route
adminRoute.get('/salesReport' , adminController.loadSalesReport);
adminRoute.post('/salesReport' , adminController.sortSalesReport);
// adminRoute.get('/salesReportByMonth' , adminController.loadSalesReportByMonth);
adminRoute.get('/get-sales-data', adminController.getSalesData);


// adminRoute.get('/dash' , orderController.dash);


// Error handling middleware
adminRoute.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});


export default adminRoute;
