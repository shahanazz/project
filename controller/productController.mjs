import Product from '../models/productModel.mjs';
import asyncHandler from 'express-async-handler';
import Category from '../models/categoryModel.mjs';
import Brand from '../models/brandModel.mjs';
import Coupon from '../models/couponModel.mjs';
// import { initializeApp } from 'firebase/app';
// import {getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';
// import firebaseConfig from '../config/firebaseConfig.mjs'
  



// load product
const loadProduct = asyncHandler(async (req, res) => {
    try {
      let page = 1;
      if (req.query.page) {
        page = parseInt(req.query.page, 10) || 1;
      }
  
      const limit = 5;
      const skip = (page - 1) * limit;
  
      const product = await Product.find({ status: true })
        .populate('category')
        .populate('brand')   
        .limit(limit)
        .skip(skip)
        .exec();
  
      const count = await Product.countDocuments({ status: true });
  
      res.render('productList', {
        product,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
      });
    } catch (error) {
      console.log(error.message);
      res.status(500).send('Internal Server Error');
    }
  });
  

// Load add product page
const loadAddProduct = asyncHandler(async (req, res) => {
  try {
    const category = await Category.find({ status: true });
    const brands = await Brand.find({status : true});
    res.render('add-product', { category, brands });
  } catch (error) {
    console.log(error.message);
  }
});

// add product
const postProduct = asyncHandler(async (req, res) => {
    try {
        const {    
            productname,    
            category,
            brand,
            color,
            size,
            quantity,      
            description,
            regularprice,
            // saleprice,
            productoffer,
            image,
            staus,
        } = req.body;    

       console.log(brand);
       console.log(category);
        // check product already exists
        const existingProduct = await Product.findOne({
            productname: { $regex: new RegExp(`^${productname}$`, 'i') }
        });

        if (existingProduct) {   
            console.log('Product already exists');
            const category = await Category.find({ status: true });
            const brands = await Brand.find({status : true});
            res.render('add-product', { message: 'Product already exists', category,brands });
        } else { 
  
            const imgArr = []; 
            

      for(let i=0;i<req.files.length;i++){
        imgArr.push(req.files[i].filename); 
      }

     // Convert --> number
    let offer = Number(productoffer);

    // Validate < 0 invalid
    if (!Number.isInteger(offer) || offer < 0 || offer > 100) {
      offer = 0; 
    }

    // Calculate sale price
    let saleprice = regularprice;
    if (offer > 0) {
      saleprice = regularprice - (regularprice * (offer / 100));
      saleprice = Math.round(saleprice); 
    }
      console.log(regularprice);
      console.log(saleprice); 
      

            let product = new Product({   
                productname,
                category,
                brand,
                color,
                size,
                quantity,
                description,
                regularprice,
                saleprice,
                productoffer,
                image: imgArr,  
                status :true  
            });

            const productData = await product.save();

            if (productData) {
                res.redirect('/admin/product');
            } else {
                const category = await Category.find({ status: true });
                const brands = await Brand.find({status : true});
                
                res.render('add-product', { message: 'Something went wrong', category,brands });
            }
        }
    } catch (error) {
        console.log(error.message);
        const category = await Category.find({ status: true });
        const brands = await Brand.find({status : true});
        res.render('add-product', { message: 'An error occurred', category,brands });
    }
});


  
//  load edit page
const loadEditPage = async (req, res) => {
    try {
        const id = req.query.id;
        const productData = await Product.findById({ _id: id }).populate('category').populate('brand');
        const category = await Category.find();
        const brands = await Brand.find();
        

        if (productData) {
            res.render('edit-product', { product: productData, category,brands });
        } else {
            res.redirect('/admin/product');
        }
    } catch (error) {
        console.log(error.message);
    }
};
   
// save edited data
const postEditProduct = async (req, res) => {
  try {
      const productId = req.query.id;
      const product = await Product.findOne({ _id: productId });

      if (!product) {
          return res.status(404).send('Product not found');
      }

      const imgArr = [];
      if (req.files && req.files.length > 0) {
          req.files.forEach(file => {
              imgArr.push(file.filename);
          });
      }

      const regularprice = parseFloat(req.body.regularprice);
      let productOffer = parseFloat(req.body.productoffer);

      // validate productOffer
      if (!Number.isInteger(productOffer) || productOffer < 0 || productOffer > 100) {
          productOffer = 0; 
      }

    
      let saleprice = regularprice;
      if (productOffer > 0) {
          saleprice = regularprice - (regularprice * (productOffer / 100));
          saleprice = Math.round(saleprice); 
      }

      const updateData = {
          productname: req.body.productname,
          category: req.body.category,
          brand: req.body.brand,
          color: req.body.color,   
          size: req.body.size,
          quantity: req.body.quantity,
          description: req.body.description, 
          regularprice: regularprice,
          saleprice: saleprice, 
          productoffer: productOffer, 
          image: imgArr.length > 0 ? imgArr : product.image,  
          status: true
      };

      const result = await Product.updateOne({ _id: productId }, { $set: updateData }, { new: true });

      res.redirect('/admin/product');
  } catch (error) {
      console.log(error.message);
  }
};

// const postEditProduct = async (req, res) => {
//     try {

//         const productId = req.query.id;
//         const product = await Product.findOne({ _id: productId });
//         console.log(product);
//         console.log('Request Body:', req.body);

//         if (!product) {
//             return res.status(404).send('Product not found');
//         }

//         const imgArr = [];
//         if (req.files && req.files.length > 0) {
//             req.files.forEach(file => {
//                 imgArr.push(file.filename);
//             });
//         }

//         const updateData = {
//             productname : req.body.productname,
//             category: req.body.category,
//             brand: req.body.brand,
//             color: req.body.color,   
//             size: req.body.size,
//             quantity: req.body.quantity,
//             description: req.body.description, 
//             regularprice: req.body.regularprice,        
//             saleprice: req.body.saleprice,
//             productOffer: req.body.productoffer,
//             image: imgArr.length > 0 ? imgArr : product.image,  // Use existing images if no new images uploaded
//             status: true
//         };

//         console.log('Update Data:', updateData);

//         const result = await Product.updateOne({ _id: productId }, { $set: updateData }, { new: true });

//         console.log('Update Result:', result);

//         res.redirect('/admin/product');
//     } catch (error) {
//         console.log(error.message);
//     }
// };



  
// delete product
const deleteProduct = asyncHandler(async(req,res) =>{
    try {
        const id = req.query.id;
        console.log(id);
        
        const product = await Product.findByIdAndUpdate(id,
            { $set : {status : false},
        });

        res.redirect('/admin/product');

    } catch (error) {
        console.log(error.message);
    }
})


  

export default {
    loadProduct,
    loadAddProduct,
    postProduct,
    loadEditPage,
    postEditProduct,
    deleteProduct,
}




// const applyCoupon = async (req, res) => {
  //     try {
  //       const { couponCode, productId } = req.body;
  //       const userId = req.session.user_id; 
    
  //       // available coupon
  //       const coupon = await Coupon.findOne({ name: couponCode });
  //       if (!coupon || new Date(coupon.expireOn) < new Date()) {
  //         return res.status(400).json({ message: 'Invalid or expired coupon' });
  //       }
    
  //       const product = await Product.findById(productId);
  //       if (!product) {
  //         return res.status(404).json({ message: 'Product not found' });
  //       }
  
  //       if(product.saleprice < coupon.minimumPrice){
  //        return res.json({success: false,
  //           message: `coupon only valid price minimum ${coupon.minimumPrice}`});
  //       }
    
  //       // Calculate price based on coupon
  //       let newSalePrice = product.saleprice;
  //       if (product.saleprice >= coupon.minimumPrice) {
  //         newSalePrice = Math.max(newSalePrice - coupon.offerPrice, 0);
  //       }
  //       console.log(product.saleprice);
  //       console.log(newSalePrice);
    
  //       // Save the applied coupon
  //       await Product.updateOne(
  //         { userId: userId },
  //         { $set: { appliedCoupon: coupon._id, saleprice: newSalePrice } }
  //       );
    
  //       res.json({
  //         success: true,
  //         message: 'Coupon applied successfully',
  //         newSalePrice: newSalePrice,
  //       });
  //     } catch (error) {
  //       console.error('Error applying coupon:', error);
  //       res.status(500).json({ message: 'Internal server error' });
  //     }
  //   };
  
  //   // remove coupon
  //   const removeCoupon = async (req, res) => {
  //     try {
  //       const { productId } = req.body;
  //       const userId = req.session.user_id; 
    
  //       const product = await Product.findById(productId);
  //       if (!product) {
  //         return res.status(404).json({ message: 'Product not found' });
  //       }
    
        
  //       const originalSalePrice = product.saleprice;
    
       
  //       await Product.updateOne(
  //         { userId: userId },
  //         { $unset: { appliedCoupon: "" }, $set: { saleprice: originalSalePrice } }
  //       );
    
  //       console.log('original sale',originalSalePrice);
  //       res.json({
  //         success: true,
  //         message: 'Coupon removed successfully',
  //         originalSalePrice,
  //       });
  //     } catch (error) {
  //       console.error('Error removing coupon:', error);
  //       res.status(500).json({ message: 'Internal server error' });
  //     }
  //   };