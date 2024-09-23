import Cart from '../models/cartModel.mjs';
import Product from '../models/productModel.mjs';
import Coupon from '../models/couponModel.mjs';

const loadCart = async(req,res) =>{  
    try {
        const userId = req.session.user._id;
        const product = await Product.find({status :true});
        const cartData = await Cart.findOne({userId:userId}).populate('product.productId');
        // console.log(cartData);
            // all copon
    const allCoupons = await Coupon.find({});
    
    const currentDate = new Date();
    
    // check coupon valid
    const validCoupons = allCoupons.filter(coupon => new Date(coupon.expireOn) >= currentDate);
    

        res.status(200).render('cart' , {cart : cartData, product:product, coupons: validCoupons });
          
    } catch (error) {
        console.log(error.message);  
        res.status(500).render('500');
    }
}

// add to cart
const addToCart = async (req, res) => {
    try {
        const userId = req.session.user._id;
        const productId = req.params.id;
        const { quantity =1 } = req.body;

        // check qty > 0
        if (!quantity || isNaN(quantity) || quantity <= 0) {
            return res.json({ success: false, message: 'Invalid quantity' });
        }

      
        if (!userId) {
            return res.json({ success: false, message: 'User not found' });
        }

        const productData = await Product.findById(productId);

        if (!productData) {
            return res.json({ success: false, message: 'Product not found' });
        }

        // check the required quantity exist
        if(quantity > productData.quantity){
            return res.json({ success: false, message: 'Product quantity is not available' });
        }

        const total = quantity * productData.saleprice;

        
        let cartData = await Cart.findOne({ userId });

        if (cartData) {
            const cartProductIndex = cartData.product.findIndex(item => item.productId.toString() === productId);

            if (cartProductIndex !== -1) {
                // total cart
                const cartProduct = cartData.product[cartProductIndex];
                if (cartProduct.quantity + quantity <= productData.quantity) {
                    cartProduct.quantity += quantity;
                    cartProduct.total += total;
                } else {
                    return res.json({ success: false, message: 'Insufficient product quantity' });
                }
            } else {
                // add product to  cart
                cartData.product.push({
                    productId,
                    quantity,
                    total,
                    price: productData.saleprice
                });
            }
            console.log('hi cart1');

            cartData.grandTotal += total;
            await cartData.save();
        } else {
            // Create  new cart
            cartData = new Cart({
                userId,
                product: [{
                    productId,
                    quantity,
                    total,
                    price: productData.saleprice
                }],
                grandTotal: total,
                count: 1
            });
            await cartData.save();
            console.log('hi cart2');
        }

        return res.json({ success: true, message: 'Product added to cart', productData });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};


// delete cart
const deleteCart = async (req, res) => {
    try {
        const id = req.body.id; 
        console.log(id);
        const userId = req.session.user._id;
        console.log(userId);

        // find  total price of product to remove
        const total = await Cart.findOne(
            { userId: userId, 'product._id': id },
            { 'product.$': 1 }
        );

        if (!total || !total.product || total.product.length === 0) {
            return res.status(404).json({ success: false, message: 'Product not found in the cart' });
        }

        const productTotal = total.product[0].total;

        // Update cart: remove product , dec  grandTotal
        const cartUpdateResult = await Cart.updateOne(
            { userId: userId, 'product._id': id },
            {
                $pull: { product: { _id: id } },
                $inc: { grandTotal: -productTotal }
            }
        );

        if (cartUpdateResult.modifiedCount === 0) {
            return res.status(404).json({ success: false, message: 'Failed to remove item from cart' });
        }

        // updated cart data
        const cart = await Cart.findOne({ userId: userId });

        // If cart empty, delete the cart
        if (!cart || cart.product.length < 1) {
            await Cart.deleteOne({ userId: userId });
        }

        console.log('Total price of removed product:', productTotal);
        console.log('Updated Cart:', cart);

        return res.status(200).json({ success: true, message: 'Item removed', grandTotal: cart ? cart.grandTotal : 0 });

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};





const quantityChange = async (req, res) => {
    try {
        const count = parseInt(req.body.count);
        const productId = req.body.productId;

        const cart = await Cart.findOne({ userId: req.session.user_id });
        if (!cart) {
            return res.json({ success: false, message: "Cart not found" });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.json({ success: false, message: "Product not found" });
        }

        const cartProduct = cart.product.find(
            (p) => p.productId.toString() === productId
        );

        if (!cartProduct) {
            return res.json({ success: false, message: "Product not in cart" });
        }

        if (count === 1) {
            if (cartProduct.quantity < product.quantity) {
                await Cart.findOneAndUpdate(
                    { userId: req.session.user_id, "product.productId": productId },
                    {
                        $inc: {
                            "product.$.quantity": 1,
                            "product.$.total": product.saleprice,
                            grandTotal: product.saleprice
                        }
                    }
                );
                res.json({ success: true });
            } else {
                res.json({
                    success: false,
                    message: "Sorry, the maximum quantity of product exceeded"
                });
            }
        } else if (count === -1) {
            if (cartProduct.quantity > 1) {
                await Cart.findOneAndUpdate(
                    { userId: req.session.user_id, "product.productId": productId },
                    {
                        $inc: {
                            "product.$.quantity": -1,
                            "product.$.total": -product.saleprice,
                            grandTotal: -product.saleprice
                        }
                    }
                );
                res.json({ success: true });
            } else {
                res.json({
                    success: false,
                    message: "Sorry, the minimum quantity of product exceeded"
                });
            }
        } else {
            res.json({ success: false, message: "Invalid count value" });
        }
    } catch (error) {
        console.error(error);
        res.redirect("/500");
    }
};




     
export default {
    loadCart,
    addToCart,
    deleteCart,
    quantityChange,
    // getCart,
    // removeProduct,

}


































































// const deleteCart = async(req,res) =>{
//     try {
//         const id = req.query.id;
//         const userId = req.user._id;

//         // find total price of product of the product to be removed
//         const total = await Cart.findOne(
//             {userId : userId , 'product._id' : id},
//             { 'product.$' : 1}); // to select only the relevent product

//             if(!total){
//                 return res.status(404).json({success : false , message : 'product not found in the cart'});
//             }

//                 // update cart and dec the grandtotal
//                 const cartData = await Cart.updateOne(
//                     {userId : userId , 'product._id' : id},
//                     {$pull : {product : '_id : id'}},
//                     {$inc : {grandTotal : - total.product[0].total}});
                    
//                 // find the updated cart data
//                const cart = await Cart.findOne({userId : userId});
               
//                // if cart empty delete the cart
//                if(!cart || cart.product.length < 1){
//                 await Cart.deleteOne({userId : userId});
//                }

//                console.log('total price of removed product', total.product[0].total);
//                console.log('updatedCart :' , cart);

//                return res.status(200).json({ success: true, message: 'Item removed', grandTotal: cart ? cart.grandTotal : 0 });
            
//     } catch (error) {
//         console.log(error.message);
//         res.status(500).render('500');
//     }
// }


// add to cart
// const addToCart = async (req, res) => {
//     try {
//         const userId = req.session.user._id;
//         const productId = req.params.id;
//         const quantity = req.body.productQuantity || 1;

//         console.log(userId,productId,quantity);  

//         const product = await Product.findById(productId); // Ensure the correct model name
//         if (!product) {
//             return res.status(404).json({ message: 'Product not found' });
//         }

//         const cart = await Cart.findOne({ userId: userId }).populate('items.productId');
//         console.log(cart);
//         if (cart) { 
//             const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
               
//             if (itemIndex > -1) {
//                 let item = cart.items[itemIndex];
//                 item.quantity += quantity;
//                 item.totalPrice = item.quantity * item.price;
//                 cart.items[itemIndex] = item;
//             } else {
//                 cart.items.push({                
//                     productId,
//                     quantity, 
//                     price: product.saleprice,
//                     totalPrice: product.saleprice * quantity,
//                 });
//             }

//             await cart.save();
//             return res.status(200).render('cart',{cart:cart});
        
//         } else {
            
//             const newCart = await Cart.create({
//                 userId: userId,
//                 items: [{
//                     productId,
//                     quantity,
//                     price: product.saleprice,
//                     totalPrice: product.saleprice * quantity,
//                 }]   
//             });
//             return res.status(201).render('cart');
//         }
        
//     } catch (error) {
//         console.error(error.message);
//         res.status(500).send({ success: false, msg: error.message });
//     }
// };


// // load cart
// const loadCart = async(req,res) =>{
//     try {
//         const userId = req.session.user._id;
//         const cart = await Cart.findOne({ userId: userId }).populate('items.productId');
//         res.render('cart',{cart});
//     } catch (error) {
//         console.log(error.message);
//         res.render('500')
//     }
// }

// const getCart = async(req,res) =>{  
//     try {
//         const { userId } = req.params;
//         const cart = await Cart.findOne({ userId }).populate('items.productId');

//         if(!cart){
//             return res.status(404).json({ message: 'Cart not found' });
//         }
//         return res.status(200).render('cart',{cart});
//     } catch (error) {
//         console.log(error.message);
//         return res.status(500).render('500',{ message: 'Server error', error });   
//     }
// }



// // remove product from cart
// const removeProduct = async(req,res) =>{
//     try {
//         const { userId, productId } = req.body;

//         const cart = await Cart.findOne({ userId });
//         if (cart) {
//             cart.items = cart.items.filter(item => item.productId.toString() !== productId);
//             await cart.save();
//             return res.status(200).json(cart);
//         } else {
//             return res.status(404).json({ message: 'Cart not found' });
//         }
//     } catch (error) {
//         console.log(error.message);
//         return res.status(500).json({ success: false, msg: error.message });
//     }
// }




