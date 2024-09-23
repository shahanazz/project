import Wishlist from '../models/wishListModel.mjs';
import Product from '../models/productModel.mjs';

const loadWishList = async(req,res) =>{
    try {
        const userId = req.session.user._id;
        const product = await Product.find({status :true});
        const wishlistData = await Wishlist.findOne({userId:userId}).populate('products.productId');
        res.status(200).render('wishlist' , {wishlist : wishlistData, product:product });
    } catch (error) {
        console.log(error.message);
        res.status(500).redirect('/500');
    }
}

const addToWishlist = async (req, res) => {
    try {
        const userId = req.session.user._id;
        const productId = req.params.id;
        console.log(userId,productId);

        // Check if the user and product exist
        if (!userId) {
            return res.json({ success: false, message: 'User not found' });
        }

        const productData = await Product.findById(productId);

        if (!productData) {
            return res.json({ success: false, message: 'Product not found' });
        }

        // Find the user's wishlist
        let wishlistData = await Wishlist.findOne({ userId });
        console.log(wishlistData);

        if (wishlistData) {
            const wishlistProductIndex = wishlistData.products.findIndex(item => item.productId.toString() === productId);

            if (wishlistProductIndex !== -1) {
                return res.json({ success: false, message: 'Product already in wishlist' });
            } else {
                // Add new product to the wishlist
                wishlistData.products.push({
                    productId,
                    // addedAt: new Date()
                });
                await wishlistData.save();
            }
        } else {
            // Create a new wishlist
            wishlistData = new Wishlist({
                userId,
                products: [{
                    productId,
                    // addedAt: new Date()
                }]
            });
            await wishlistData.save();
        }  

        return res.json({ success: true, message: 'Product added to wishlist'});
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// export const removeProductFromWishlist = async (req, res) => {

// remove product
const removeFromWishlist = async (req, res) => {
    try {
        const userId = req.session.user._id;
        const productId = req.params.id;
    
        const wishlistData = await Wishlist.findOne({ userId });
        
        if (wishlistData) {
            const wishlistProductIndex = wishlistData.products.findIndex(item => item.productId.toString() === productId);
            
            if (wishlistProductIndex !== -1) {
                wishlistData.products.splice(wishlistProductIndex, 1);
                await wishlistData.save();
               
                return res.json({ success: true, message: 'Product removed from wishlist' });
            } else {
                
                return res.json({ success: false, message: 'Product not found in wishlist' });
            }
        } else {
            console.log('Wishlist not found'); 
            return res.json({ success: false, message: 'Wishlist not found' });
        }
    } catch (error) {
        console.log('Error:', error.message); 
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};



export default {
    loadWishList,
    addToWishlist,
    removeFromWishlist,
}