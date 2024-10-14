import Product from '../models/productModel.mjs';
import asyncHandler from 'express-async-handler';
import Category from '../models/categoryModel.mjs';
import Brand from '../models/brandModel.mjs';
import Coupon from '../models/couponModel.mjs';
import fs from 'fs';
import path from 'path';
// import path from 'path';
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
// const postProduct = asyncHandler(async (req, res) => {
//     try {
//         const {    
//             productname,    
//             category,
//             brand,
//             color,
//             size,
//             quantity,      
//             description,
//             regularprice,
//             // saleprice,
//             productoffer,
//             image,
//             staus,
//         } = req.body;    

//        console.log(brand);
//        console.log(category);
//         // check product already exists
//         const existingProduct = await Product.findOne({
//             productname: { $regex: new RegExp(`^${productname}$`, 'i') }
//         });

//         if (existingProduct) {   
//             console.log('Product already exists');
//             const category = await Category.find({ status: true });
//             const brands = await Brand.find({status : true});
//             res.render('add-product', { message: 'Product already exists', category,brands });
//         } else { 
  
//             const imgArr = []; 
            

//       for(let i=0;i<req.files.length;i++){
//         imgArr.push(req.files[i].filename); 
//       }

//      // Convert --> number
//     let offer = Number(productoffer);

//     // Validate < 0 invalid
//     if (!Number.isInteger(offer) || offer < 0 || offer > 100) {
//       offer = 0; 
//     }

//     // Calculate sale price
//     let saleprice = regularprice;
//     if (offer > 0) {
//       saleprice = regularprice - (regularprice * (offer / 100));
//       saleprice = Math.round(saleprice); 
//     }else{
//         const categoryData = await Category.findById(category);
//         console.log('category data -->', categoryData);
//         const categoryOffer = categoryData ? categoryData.categoryOffer : 0;
        

//         if (categoryOffer > 0) {
//             saleprice = regularprice - (regularprice * (categoryOffer / 100));
//             saleprice = Math.round(saleprice);
//         }
//     }
//       console.log(regularprice);
//       console.log(saleprice); 
      

//             let product = new Product({   
//                 productname,
//                 category,
//                 brand,
//                 color,
//                 size,
//                 quantity,
//                 description,
//                 regularprice,
//                 saleprice,
//                 productoffer,
//                 image: imgArr,  
//                 status :true  
//             });

//             const productData = await product.save();

//             if (productData) {
//                 res.redirect('/admin/product');
//             } else {
//                 const category = await Category.find({ status: true });
//                 const brands = await Brand.find({status : true});
                
//                 res.render('add-product', { message: 'Something went wrong', category,brands });
//             }
//         }
//     } catch (error) {
//         console.log(error.message);
//         const category = await Category.find({ status: true });
//         const brands = await Brand.find({status : true});
//         res.render('add-product', { message: 'An error occurred', category,brands });
//     }
// });

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
            productoffer,
            image,
            status,
        } = req.body;    

        console.log(brand);
        console.log(category);
        
        // Check if the product already exists
        const existingProduct = await Product.findOne({
            productname: { $regex: new RegExp(`^${productname}$`, 'i') }
        });

        if (existingProduct) {   
            console.log('Product already exists');
            const categoryList = await Category.find({ status: true });
            const brands = await Brand.find({status : true});
            res.render('add-product', { message: 'Product already exists', category: categoryList, brands });
        } else { 
            const imgArr = []; 
            for (let i = 0; i < req.files.length; i++) {
                imgArr.push(req.files[i].filename); 
            }

            // Convert product offer to number
            let offer = Number(productoffer);

            // Validate the offer
            if (!Number.isInteger(offer) || offer < 0 || offer > 100) {
                offer = 0; 
            }

            // Initialize sale price to regular price
            let saleprice = regularprice;
            let categoryOffer = 0;

            // Check for category offer if product offer is 0
            if (offer === 0) {
                const categoryData = await Category.findById(category);
                console.log('Category data -->', categoryData);
                categoryOffer = categoryData ? categoryData.categoryOffer : 0;
            }

            // Calculate sale price based on both offers
            const productSalePrice = offer > 0 
                ? regularprice - (regularprice * (offer / 100))
                : regularprice;

            const categorySalePrice = categoryOffer > 0 
                ? regularprice - (regularprice * (categoryOffer / 100)) 
                : regularprice;

            // Determine the best sale price
            saleprice = Math.min(Math.round(productSalePrice), Math.round(categorySalePrice));

            console.log('Regular Price:', regularprice);
            console.log('Sale Price:', saleprice); 
            
            // Create a new product
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
                status: true  
            });

            const productData = await product.save();

            if (productData) {
                res.redirect('/admin/product');
            } else {
                const categoryList = await Category.find({ status: true });
                const brands = await Brand.find({ status: true });
                res.render('add-product', { message: 'Something went wrong', category: categoryList, brands });
            }
        }
    } catch (error) {
        console.log(error.message);
        const categoryList = await Category.find({ status: true });
        const brands = await Brand.find({ status: true });
        res.render('add-product', { message: 'An error occurred', category: categoryList, brands });
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
// const postEditProduct = async (req, res) => {
//   try {
//       const productId = req.query.id;
//       const product = await Product.findOne({ _id: productId });

//       if (!product) {
//           return res.status(404).send('Product not found');
//       }

//       const imgArr = [];
//       if (req.files && req.files.length > 0) {
//           req.files.forEach(file => {
//               imgArr.push(file.filename);
//           });
//       }

//       const regularprice = parseFloat(req.body.regularprice);
//       let productOffer = parseFloat(req.body.productoffer);

//       // validate productOffer
//       if (!Number.isInteger(productOffer) || productOffer < 0 || productOffer > 100) {
//           productOffer = 0; 
//       }

    
//       let saleprice = regularprice;
//       if (productOffer > 0) {
//           saleprice = regularprice - (regularprice * (productOffer / 100));
//           saleprice = Math.round(saleprice); 
//       }

     

//       const updateData = {
//           productname: req.body.productname,
//           category: req.body.category,
//           brand: req.body.brand,
//           color: req.body.color,   
//           size: req.body.size,
//           quantity: req.body.quantity,
//           description: req.body.description, 
//           regularprice: regularprice,
//           saleprice: saleprice, 
//           productoffer: productOffer, 
//           image: imgArr.length > 0 ? imgArr : product.image,  
//           status: true
//       };


//       const result = await Product.updateOne({ _id: productId }, { $set: updateData }, { new: true });

//       res.redirect('/admin/product');
//   } catch (error) {
//       console.log(error.message);
//   }
// };

const postEditProduct = async (req, res) => {
    try {
        const productId = req.query.id;
        const product = await Product.findOne({ _id: productId });
  
        if (!product) {
            return res.status(404).send('Product not found');
        }
  
        // Handle new image uploads
        const imgArr = [];
        if (req.files && req.files.length > 0) {
            req.files.forEach(file => {
                imgArr.push(file.filename); // Collect new image filenames
            });
        }
  
        // Append new images to existing images
        let updatedImages = [...product.image]; 
        if (imgArr.length > 0) {
            updatedImages = [...updatedImages, ...imgArr];  
        }
  
        // Handle price and offer logic
        const regularprice = parseFloat(req.body.regularprice);
        let productOffer = parseFloat(req.body.productoffer);
  
        // Validate productOffer
        if (isNaN(productOffer) || productOffer < 0 || productOffer > 100) {
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
            image: updatedImages, 
            status: true
        };
  
        console.log('Updated data--->', updateData);
  
        // Update the product
        const result = await Product.updateOne({ _id: productId }, { $set: updateData });
  
        res.redirect('/admin/product');
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Server error');
    }
  };
  

// const deleteSingleImage = async(req,res) =>{
//     try {
//         const product = await Product.findByIdAndUpdate(productIdToServer , {$pull : {image : imageNameToServer}});
//         const imagePath = path.join('public', 'productImages', 're-image', imageNameToServer)

//         if(fs.existSync(imagePath)){
//             await fs.unlinkSync(imagePath);
//             console.log(`image ${imageNameToServer} deleted successfully`);
//         }else{
//             console.log(`image ${imageNameToServer} not found`);
//         }

//         res.send({success : true});
//     } catch (error) {
//         console.log(error.message);
//         res.redirect('/500');
//     }
// }
const deleteSingleImage = async (req, res) => {
    try {
        const {imageNameToServer,productIdToServer } = req.body; 
    
        console.log(imageNameToServer);
        console.log(productIdToServer);

        const product = await Product.findByIdAndUpdate(productIdToServer, { $pull: { image: imageNameToServer } });
        
        
        const imagePath = path.join('public', 'productImages', imageNameToServer);

        if (fs.existsSync(imagePath)) {
            await fs.unlinkSync(imagePath);
            console.log(`Image ${imageNameToServer} deleted successfully`);
        } else {
            console.log(`Image ${imageNameToServer} not found`);
        }

        res.send({ success: true });
    } catch (error) {
        console.log(error.message);
        res.status(500).send({ success: false, message: error.message });
    }
}


  
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
    deleteSingleImage,
    deleteProduct,
}




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