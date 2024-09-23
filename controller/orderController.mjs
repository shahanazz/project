import  User from "../models/userModel.mjs";
import Product from '../models/productModel.mjs';
import Order from '../models/orderModel.mjs';
import Category from '../models/categoryModel.mjs';
import Address from '../models/addressModel.mjs';
import Cart from '../models/cartModel.mjs';
import paymentHelper from '../config/payment.mjs';
import Coupon from '../models/couponModel.mjs'
import Razorpay from "razorpay";
import moment  from 'moment'; 
import crypto from 'crypto';
moment.locale('en'); 
const shortDateFormat = 'YYYY-MM-DD'; 

// Initialize Razorpay instance
const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,    
    key_secret: process.env.RAZORPAY_KEY_SECRET 
});

// load checkout  
const loadCheckout = async(req,res) =>{   
    try {
               
        const  user = req.session.user_id;      
        const cart = await Cart.find({userId:user}).populate("product.productId").populate("userId");
        // console.log(cart)
        const addresses =  await Address.find({user:user, status:true});

         
    const allCoupons = await Coupon.find({});    
    
    // get current date
    const currentDate = new Date();
    
    
    const validCoupons = allCoupons.filter(coupon => new Date(coupon.expireOn) >= currentDate);
    
    // console.log(validCoupons);
        res.render("checkout",{
            cart :cart,
            address : addresses  ,
            coupons: validCoupons   

        });

    } catch (error) {
        console.log(error.message);
        res.status(500).redirect('/500');
    }
}  

// get order address
const getOrderAddress = async(req,res) =>{
    try {

        const user = await User.findOne({_id:req.session.user_id});
        res.render('addAddress',{user:user});
        
    } catch (error) {
        console.log(error.message);
        res.status(500).redirect('/500');    
    } 
}
 

const postAddAddress = async(req,res) => {
    try {
        console.log(1);
        const { username , mobile , email , landmark ,  houseName , city , state , country , pincode ,  } = req.body
            const newAdress = new Address({
                user : req.session.user_id ,
                 username :username , 
                 mobile : mobile, 
                 email :email , 
                 landmark : landmark,  
                 houseName : houseName , 
                 city : city , 
                 state : state , 
                 country : country ,
                 pincode : pincode ,
                 
             })
            const result = await newAdress.save()
        // console.log(result);
         

        res.redirect("/checkout");

    } catch (error) {
        console.log(error.message);
       

    }
}


// latest

// const placeOrder = async (req, res) => {
//     try {
//         const userId = req.session.user_id;
//         const { address, paymentMethod, walletAmount, finalPrice,couponCode } = req.body;

//         console.log('req.body -->',req.body);


//         const user = await User.findById(userId);   
//         let walletBalance = user.wallet || 0;

//         // let walletBalance = walletAmount ? Number(walletAmount) : 0;
//         console.log('wallet Balance -> ',walletBalance);

//         const cartProducts = await Cart.find({ userId: userId }).populate("product.productId");
//         if (!cartProducts || cartProducts.length === 0) {
//             return res.status(400).json({ error: "Your cart is empty." });
//         }

//         const singleCartProduct = cartProducts[0].product.map((items) => ({
//             productId: items.productId,
//             quantity: items.quantity,
//             price: items.price
//         }));

//         // console.log('single Product',singleCartProduct);

//         // const cartTotal = await Cart.findOne({ userId: userId }, { _id: 0, grandTotal: 1 });
//         // const totalAmount = cartTotal.grandTotal;
//         const totalAmount = Number(finalPrice); 
//         console.log('Total Amount : ',totalAmount);

        
//         let couponDiscount = 0;
//         if (couponCode) {
//             const coupon = await Coupon.findOne({ name: couponCode, isList: true });
//             if (coupon) {
//                 const currentDate = new Date();
//                 if (coupon.expireOn >= currentDate && totalAmount >= coupon.minimumPrice) {
//                     if (coupon.discountType === 'fixed') {
//                         couponDiscount = coupon.offerPrice;
//                     }
//                 // } else {
//                 //     return res.status(400).json({ error: "Coupon is invalid or expired." });
//                  }
//             } else {
//                 return res.status(400).json({ error: "Invalid coupon code." });
//             }
//         }
        
        
//         let amountAfterCoupon = totalAmount - couponDiscount;
//         amountAfterCoupon = Math.max(amountAfterCoupon, 0); 

//         console.log('Amount after coupon',amountAfterCoupon);


//         let amountPayable = totalAmount;
//         let walletUsed = 0;
//         let orderStatus = paymentMethod === 'cod' ? 'Confirmed' : 'Pending';

//          // Check if COD is allowed
//          if (paymentMethod === 'cod' && totalAmount > 1000) {
//             return res.status(400).json({ error: "COD is not available for orders above 1000." });
//         }

//         //wallet usage
//         if (walletAmount) {
//             if (totalAmount > walletBalance) {
//                 amountPayable = totalAmount - walletBalance;
//                 walletUsed = walletBalance;
//             } else {
//                 amountPayable = 0;
//                 walletUsed = totalAmount;
//             }
//             if (amountPayable === 0) {
//                 orderStatus = 'Confirmed';
//             }
//         }


//         // Create the order
//         const order = new Order({
//             userId: userId,
//             products: singleCartProduct,
//             totalPrice: totalAmount,
//             paymentMethod: paymentMethod,
//             orderStatus: orderStatus,
//             address: address,
//             walletUsed: walletUsed,
//             amountPayable: amountPayable,
//             date: new Date(),
//         });

//         const savedOrder = await order.save();

        
//         if (paymentMethod === 'cod' || amountPayable === 0) {
//             //  product quantity decr
//             for (const items of cartProducts[0].product) {
//                 const { productId, quantity } = items;
//                 await Product.updateOne({ _id: productId }, { $inc: { quantity: -quantity } });
//             }

//             // Update wallet if used
//             if (walletUsed > 0) {
//                 await User.updateOne(
//                     { _id: userId },
//                     {
//                         $inc: { wallet: -walletUsed },
//                         $push: {
//                             walletHistory: {
//                                 date: Date.now(),
//                                 amount: -walletUsed,
//                                 message: 'Used for purchase',
//                                 type : 'purchase'
//                             }
//                         }
//                     }
//                 );      
//             }
                       
//             // Delete the cart 
//             await Cart.deleteOne({ userId: userId });


//             return res.json({ success: true, couponDiscount,
//                 walletUsed,
//                 amountPayable });

//         } else if (paymentMethod === 'Razorpay') {
//             const payment = await paymentHelper.razorpayPayment(savedOrder._id, amountPayable);
//             console.log(payment, ' payment');
//             if (!payment) {
//                 return res.status(500).json({ error: 'Payment creation failed' });
//             }
//             res.json({ payment: payment, success: false });
//         } else {
//             return res.status(400).json({ error: "Invalid payment method." });
//         }
//     } catch (error) {
//         console.log("Error during order placement:", error.message);
//         res.status(500).render('500');
//     }
// };

// // verify razorpay
// const razorpayVerifyPayment = async (req, res) => {
//     try {
//       const { response, order } = req.body;
//       const { order_id, payment_id, razorpay_signature } = response;
//       const userId = req.session.user_id; 
//       console.log('order ---> ', order);

     
//       const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
//         .update(`${order_id}|${payment_id}`)
//         .digest('hex');
      
//       if (hmac === razorpay_signature) {
//         await Order.updateOne({ _id: order.receipt }, { $set: { orderStatus: 'Confirmed' } });
//         const cartProducts = await Cart.findOne({userId}).populate('product.productId');
//         // console.log('cart products',cartProducts);

//         if (cartProducts) {
//           for (const item of cartProducts.product) {
//             const { productId, quantity } = item;
//             await Product.updateOne({ _id: productId }, { $inc: { quantity: -quantity } });
//           }
          

//           // delete the cart
//           await Cart.deleteOne({ userId:userId });              
//         }
//         // console.log('hi, iam still working');
//         res.json({ paid: true });
//       } else {
//         // console.log('hi, iam not working');
//         res.json({ paid: false, message: 'Payment verification failed. Please try again.' });
//       }
//     } catch (error) {
//       console.error('Error in payment verification:', error.message);
//       res.status(500).json({ error: 'Payment verification failed' });
//     }
//   };

const placeOrder = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const { address, paymentMethod, walletAmount, finalPrice, couponCode } = req.body;

        console.log('req.body -->', req.body);

        const user = await User.findById(userId);
        let walletBalance = user.wallet || 0;
        console.log('wallet Balance -> ', walletBalance);

        const cartProducts = await Cart.find({ userId: userId }).populate("product.productId");
        if (!cartProducts || cartProducts.length === 0) {
            return res.status(400).json({ error: "Your cart is empty." });
        }

        const singleCartProduct = cartProducts[0].product.map((items) => ({
            productId: items.productId,
            quantity: items.quantity,
            price: items.price
        }));

        const totalAmount = Number(finalPrice);
        console.log('Total Amount : ', totalAmount);

        let couponDiscount = 0;
        let productOfferDiscount = 0; // For product offers   
        if (couponCode) {
            const coupon = await Coupon.findOne({ name: couponCode, isList: true });
            if (coupon) {
                const currentDate = new Date();
                if (coupon.expireOn >= currentDate && totalAmount >= coupon.minimumPrice) {
                    if (coupon.discountType === 'fixed') {
                        couponDiscount = coupon.offerPrice;
                    }
                }
            } else {
                return res.status(400).json({ error: "Invalid coupon code." });
            }
        }

        // Calculate product offers
        cartProducts[0].product.forEach((item) => {
            const offer = item.productId.productoffer || 0; 
            const discountAmount = (offer / 100) * item.price;
            productOfferDiscount += discountAmount * item.quantity;
        });

        let totalDiscount = couponDiscount + productOfferDiscount;
        let amountAfterDiscount = totalAmount - totalDiscount;
        amountAfterDiscount = Math.max(amountAfterDiscount, 0); // ensure not negative

        console.log('Amount after discount', amountAfterDiscount);

        let amountPayable = totalAmount;
        let walletUsed = 0;
        let orderStatus = paymentMethod === 'cod' ? 'Confirmed' : 'Pending';

        // Check if COD is allowed
        if (paymentMethod === 'cod' && totalAmount > 1000) {
            return res.status(400).json({ error: "COD is not available for orders above 1000." });
        }

        // Wallet usage
        if (walletAmount) {
            if (totalAmount > walletBalance) {
                amountPayable = totalAmount - walletBalance;
                walletUsed = walletBalance;
            } else {
                amountPayable = 0;
                walletUsed = totalAmount;
            }
            if (amountPayable === 0) {
                orderStatus = 'Confirmed';
            }
        }

        console.log('coupon discount-->', couponDiscount);
        console.log('product offer discount-->', productOfferDiscount);
        // Create the order with discounts
        const order = new Order({
            userId: userId,
            products: singleCartProduct,
            totalPrice: totalAmount,
            discount: productOfferDiscount, 
            coupon: couponDiscount, 
            paymentMethod: paymentMethod,
            orderStatus: orderStatus,
            address: address,
            walletUsed: walletUsed,
            amountPayable: amountAfterDiscount, // Amount after applying discounts
            date: new Date(),
        });

        const savedOrder = await order.save();

        // COD or fully paid with wallet
        if (paymentMethod === 'cod' || amountPayable === 0) {
            for (const items of cartProducts[0].product) {
                const { productId, quantity } = items;
                await Product.updateOne({ _id: productId }, { $inc: { quantity: -quantity } });
            }

            // Update wallet if used
            if (walletUsed > 0) {
                await User.updateOne(
                    { _id: userId },
                    {
                        $inc: { wallet: -walletUsed },
                        $push: {
                            walletHistory: {
                                date: Date.now(),
                                amount: -walletUsed,
                                message: 'Used for purchase',
                                type: 'purchase'
                            }
                        }
                    }
                );
            }

            // Delete the cart
            await Cart.deleteOne({ userId: userId });

            return res.json({
                success: true,
                couponDiscount,
                walletUsed,
                amountPayable: amountAfterDiscount
            });

        } else if (paymentMethod === 'Razorpay') {
            const payment = await paymentHelper.razorpayPayment(savedOrder._id, amountPayable);
            if (!payment) {
                return res.status(500).json({ error: 'Payment creation failed' });
            }
            res.json({ payment: payment, success: false });
        } else {
            return res.status(400).json({ error: "Invalid payment method." });
        }
    } catch (error) {
        console.log("Error during order placement:", error.message);
        res.status(500).render('500');
    }
};

// worked

// const placeOrder = async (req, res) => {
//     try {
//         const userId = req.session.user_id;
//         const { address, paymentMethod, walletAmount, finalPrice, couponCode } = req.body;

//         console.log('req.body -->', req.body);

//         const user = await User.findById(userId);
//         let walletBalance = user.wallet || 0;
//         console.log('wallet Balance -> ', walletBalance);

//         const cartProducts = await Cart.find({ userId: userId }).populate("product.productId");
//         if (!cartProducts || cartProducts.length === 0) {
//             return res.status(400).json({ error: "Your cart is empty." });
//         }

//         const singleCartProduct = cartProducts[0].product.map((items) => ({
//             productId: items.productId,
//             quantity: items.quantity,
//             price: items.price
//         }));

//         const totalAmount = Number(finalPrice);
//         console.log('Total Amount : ', totalAmount);

//         let couponDiscount = 0;
//         if (couponCode) {
//             const coupon = await Coupon.findOne({ name: couponCode, isList: true });
//             if (coupon) {
//                 const currentDate = new Date();
//                 if (coupon.expireOn >= currentDate && totalAmount >= coupon.minimumPrice) {
//                     if (coupon.discountType === 'fixed') {
//                         couponDiscount = coupon.offerPrice;
//                     }
//                 }
//             } else {
//                 return res.status(400).json({ error: "Invalid coupon code." });
//             }
//         }

//         let amountAfterCoupon = totalAmount - couponDiscount;
//         amountAfterCoupon = Math.max(amountAfterCoupon, 0); // ensure not a -ve

//         console.log('Amount after coupon', amountAfterCoupon);

//         let amountPayable = totalAmount;
//         let walletUsed = 0;
//         let orderStatus = paymentMethod === 'cod' ? 'Confirmed' : 'Pending';

//         // Check if COD is allowed
//         if (paymentMethod === 'cod' && totalAmount > 1000) {
//             return res.status(400).json({ error: "COD is not available for orders above 1000." });
//         }

//         // Wallet usage
//         if (walletAmount) {
//             if (totalAmount > walletBalance) {
//                 amountPayable = totalAmount - walletBalance;
//                 walletUsed = walletBalance;
//             } else {
//                 amountPayable = 0;
//                 walletUsed = totalAmount;
//             }
//             if (amountPayable === 0) {
//                 orderStatus = 'Confirmed';
//             }
//         }

//         const order = new Order({
//             userId: userId,
//             products: singleCartProduct,
//             totalPrice: totalAmount,
//             paymentMethod: paymentMethod,
//             orderStatus: orderStatus,
//             address: address,
//             walletUsed: walletUsed,
//             amountPayable: amountPayable,
//             date: new Date(),
//         });

//         const savedOrder = await order.save();

//         // COD or fully paid with wallet
//         if (paymentMethod === 'cod' || amountPayable === 0) {
//             for (const items of cartProducts[0].product) {
//                 const { productId, quantity } = items;
//                 await Product.updateOne({ _id: productId }, { $inc: { quantity: -quantity } });
//             }

//             // Update wallet if used
//             if (walletUsed > 0) {
//                 await User.updateOne(
//                     { _id: userId },
//                     {
//                         $inc: { wallet: -walletUsed },
//                         $push: {
//                             walletHistory: {
//                                 date: Date.now(),
//                                 amount: -walletUsed,
//                                 message: 'Used for purchase',
//                                 type: 'purchase'
//                             }
//                         }
//                     }
//                 );
//             }

//             // Delete the cart
//             await Cart.deleteOne({ userId: userId });

//             return res.json({
//                 success: true,
//                 couponDiscount,
//                 walletUsed,
//                 amountPayable
//             });

//         } else if (paymentMethod === 'Razorpay') {
//             const payment = await paymentHelper.razorpayPayment(savedOrder._id, amountPayable);
//             if (!payment) {
//                 return res.status(500).json({ error: 'Payment creation failed' });
//             }
//             res.json({ payment: payment, success: false });
//         } else {
//             return res.status(400).json({ error: "Invalid payment method." });
//         }
//     } catch (error) {
//         console.log("Error during order placement:", error.message);
//         res.status(500).render('500');
//     }
// };

// verify razorpay
const razorpayVerifyPayment = async (req, res) => {
    try {
        const { response, order } = req.body;    
        const { order_id, payment_id, razorpay_signature } = response;
        const userId = req.session.user_id;

        console.log('orderid-->',order_id);

        console.log('order recipt',order.receipt);



        const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(`${order_id}|${payment_id}`)
            .digest('hex');

            console.log('Generated HMAC:', hmac);
            console.log('Received Razorpay Signature:', razorpay_signature);
        console.log('Order ID:', order_id);
        console.log('Payment ID:', payment_id);


        if (hmac === razorpay_signature) {     
            await Order.updateOne({ _id: order.receipt }, { $set: { orderStatus: 'Confirmed' } });

            const cartProducts = await Cart.findOne({ userId }).populate('product.productId');

            if (cartProducts) {
                for (const item of cartProducts.product) {
                    const { productId, quantity } = item;
                    await Product.updateOne({ _id: productId }, { $inc: { quantity: -quantity } });
                }

                // Delete the cart
                await Cart.deleteOne({ userId });  
            }
           
            res.json({ paid: true });
            console.log('paid!!');
        } else {
            console.log('!!!!!!!paid!!');
            console.error('HMAC mismatch: Payment verification failed.');
            res.json({ paid: false, message: 'Payment verification failed. Please try again.' });
        }
    } catch (error) {
        console.error('Error in payment verification:', error.message);
        res.status(500).json({ message: 'Payment verification failed' });
    }
};    



// conform order
const orderConfirm = async(req,res)=>{
    try {

        const userId = req.session.user_id;
        const lastOrder = await Order.find({ userId : userId }).sort({ date : -1 }).limit( 1 )
        res.render( 'confirmation', {
            orderlist : lastOrder
        })   
  
    } catch (error) {    
        console.log(error.message);
        res.redirect("/500")
        
    }   
}      

// Route for creating Razorpay order
const payment = async (req, res) => {
    const { orderId, amountPayable } = req.body;

    try {
        const paymentOrder = await paymentHelper.razorpayPayment(orderId, amountPayable);

        if (!paymentOrder) {
            return res.status(500).json({ error: 'Failed to create Razorpay order' });
        }

        console.log('paymentOrder.id :',paymentOrder.id);
        console.log('paymentOrder.amount:',paymentOrder.amount);

        res.json({
            id: paymentOrder.id,
            amount: paymentOrder.amount,
            receipt: orderId+''   
        });
    } catch (error) {
        console.error('Error creating Razorpay order:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }   
}



// load order details
const loadOrderDetails = async(req,res)=>{
    try {

        const orderId = req.session.user_id
        const orderlist = await Order.find({userId:orderId}).populate("products.productId").populate("address").sort({date:-1})
        
        res.render("orderDetails",{orderlist,moment, shortDateFormat })
    } catch (error) {
        console.log(error.message);
        res.redirect("/500")
    }
}

// cancel order
const cancelOrder = async (req, res) => {    
    try {
        const { orderId, itemsToCancel, status } = req.body;
        const userId = req.session.user_id;

        
        const order = await Order.findOne({ _id: orderId });
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        let totalRefundAmount = 0;
   
        for (let item of itemsToCancel) {
            const { productId, quantity } = item;

            // Find the product in the order
            const orderItem = order.products.find(p => p.productId.equals(productId));

            if (orderItem) {
               
                const refundForItem = orderItem.price * quantity;
                totalRefundAmount += refundForItem;

                console.log(totalRefundAmount);

               
                await Product.updateOne({ _id: productId }, {
                    $inc: { quantity }
                });

                orderItem.status = 'Cancelled';
                orderItem.canceledQuantity = quantity;

                // // Remove the canceled item from the order
                const itemIndex = order.products.findIndex(p => p.productId.equals(productId));
                if (itemIndex !== -1) {
                    order.products.splice(itemIndex, 1);
                }
            }
        }

     
        if (order.products.length === 0) {
            await Order.updateOne({ _id: orderId }, { $set: { orderStatus: status } });
        } else {
            await Order.updateOne({ _id: orderId }, { $set: { products: order.products } });
        }

        console.log('pYYYYY',order.paymentMethod); 
      
        if (order.paymentMethod && order.paymentMethod !== 'cod' && status === 'Cancelled' && totalRefundAmount > 0 ) {
            const user = await User.findById(userId);
            if (user) {
                console.log('User before update:', user);
                user.wallet += totalRefundAmount;
                user.walletHistory.push({
                    date: new Date(),
                    amount: totalRefundAmount,
                    type: 'Refund',
                    message: `Refund for canceled items in order with ID ${orderId}`
                });
                await user.save();
            } else {
                console.log('User not found');
            }
        } else {
            console.log('Order not eligible for wallet update');
        }

        // Return updated order status
        const newStatus = await Order.findOne({ _id: orderId });
        res.status(200).json({ success: true, status: newStatus.orderStatus });

    } catch (error) {   
        console.log(error.message);
        res.redirect('/500');
    }
};


// const cancelOrder = async (req, res) => {
//     try {    
//         // console.log(1111);    
//         const { orderId, status } = req.body;
//         const userId = req.session.user_id; 

//         console.log(req.body, "bb");
//         console.log(req.session);
//         console.log(2);

        
//         const order = await Order.findOne({ _id: orderId });
//         // console.log(order);

     
//         for (let products of order.products) {
//             await Product.updateOne({ _id: products.productId }, {
//                 $inc: { quantity : products.quantity }
//             });
//         }

       
//         await Order.updateOne({ _id: orderId }, { $set: { orderStatus: status } });

//         console.log(4);
//         console.log(order.orderStatus); 
//         // console.log(order.amountPayable);

//         // Return updated order status
//         const newStatus = await Order.findOne({ _id: orderId });
//         console.log(7);
//         res.status(200).json({ success: true, status: newStatus.orderStatus });

//     } catch (error) {   
//         console.log(error.message);
//         res.redirect('/500');
//     }
// };

// return order
const returnOrder = async(req,res) =>{
    try {
        const orderId = req.params.id;
        const userId = req.session.user_id;

        const order = await Order.findById(orderId).populate('products.productId');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.userId.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Unauthorized' });            
        }

        const isReturnable = checkIfOrderCanBeReturned(order);
        if (!isReturnable) {
            return res.status(400).json({ message: 'Order cannot be returned' });
        }

        // console.log('order --> ' , order);
        order.orderStatus = 'Returned';

        const user = await User.findById(order.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
         
        const productNames = order.products.map(p => p.productId.productname).join(', ');
        user.wallet += order.amountPayable; 
        user.walletHistory.push({
            date: new Date(),
            amount: order.amountPayable,
            type: 'Refund', 
            message: 'Refund for order ' + productNames
        });
        await user.save();
        await order.save();

        console.log('order status --> ' , order.orderStatus); 

        res.status(200).json({ message: 'Order returned successfully' });
    } catch (error) {
        console.log(error.message);
    }
}

function checkIfOrderCanBeReturned(order) {
   
    const returnablePeriod = 7 * 24 * 60 * 60 * 1000; 
    const now = new Date();
    const orderDate = new Date(order.date);

    return (now - orderDate) <= returnablePeriod && order.status !== 'Returned';
}



const orderDetails = async (req, res) => {
    try {
        const orderId = req.session.user_id;
        // const userId = req.session.user_id;
        
        const order = await Order.findOne({ _id: orderId })
            .populate('products.productId')
            .populate('address');   

        if (!order) {
            // order is not found
            return res.status(404).render('404', { message: 'Order not found' });
        }
        res.render('orderDetails', { order, moment, shortDateFormat });
    } catch (error) {
        console.log(error.message);
        res.redirect('/500');
    }
};







  
// ADMIN
const loadAdminOrderList = async (req, res) => {
    try {
        
        let page = parseInt(req.query.page, 10) || 1;
        const limit = 20;
        const skip = (page - 1) * limit;

       
        const count = await Order.countDocuments();

       
        const orderList = await Order.find({})
            .populate('products.productId') 
            .sort({ date: -1 })
            .skip(skip)
            .limit(limit);

        
        res.render('orderList', {
            order: orderList,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).render('500'); 
    }
};


const changeOrderStatus = async (req, res) => {
    try {
        const { status, orderId } = req.body;
        const user = req.session.user_id;

        if (status === 'Cancelled') {
            // if order is cancelled, increase product quantity 
            console.log(11);
            const order = await Order.findOne({ _id: orderId });
            for (let product of order.products) {
                await Product.updateOne({ _id: product.productId }, {
                    $inc: { quantity: product.quantity }
                });
                console.log(4);
            }

            // set  order status
            console.log(5);
            await Order.updateOne({ _id: orderId }, {
                $set: { orderStatus: status }
            });

            
            const newStatus = await Order.findOne({ _id: orderId });
            res.status(200).json({ success: true, status: newStatus.orderStatus });

        } else {
            
            await Order.findOneAndUpdate({ _id: orderId }, {
                $set: { orderStatus: status }
            });

           
            const newStatus = await Order.findOne({ _id: orderId });
            res.status(200).json({ success: true, status: newStatus.orderStatus });
        }

    } catch (error) {
        console.error(error);  
        res.redirect('/500');  
    }
};

const loadOrderedProduct = async(req,res) =>{
    try {
        const product = req.params.id
        const orderedproducts = await Order.findOne({_id:product}).populate("products.productId")
        .populate('address')
        res.render("orderedProduct",{orderedproducts});
    } catch (error) {
        console.log(error.message);
        res.status(500).res.render('500');
    }
}

// order history
const loadOrderHistory = async(req,res) =>{
    try {
      const orderId = req.session.user_id
          const orderlist = await Order.find({userId:orderId}).populate("products.productId").populate("address").sort({date:-1})
          
          res.render("orderHistory",{orderlist,moment, shortDateFormat })
    } catch (error) {
      console.log(error.message);
      res.status(500).res.render('500');
    }
  }

  // apply coupon
  const applyCoupon = async (req, res) => {
    const { couponCode, totalPrice, appliedCoupons } = req.body;
    const orderId = req.session.orderId; 

    try {
        const coupon = await Coupon.findOne({ name: couponCode });

        if (!coupon) {
            return res.status(400).json({ message: 'Invalid coupon code' });
        }

        if (new Date() > coupon.expireOn) {
            return res.status(400).json({ message: 'Coupon has expired' });
        }

        if (totalPrice < coupon.minimumPrice) {
            return res.status(400).json({ message: 'Order amount is less than the minimum required' });
        }

        if (appliedCoupons && appliedCoupons.includes(couponCode)) {
            return res.status(400).json({ message: 'Coupon has already been applied' });
        }

        let discountAmount = coupon.offerPrice;
        const newPrice = totalPrice - discountAmount;

        // Update the order with coupon details
        await Order.updateOne(
            { _id: orderId },
            {
                $set: {
                    couponCode: couponCode,
                    couponDiscount: discountAmount
                }
            }
        );

        res.json({
            success: true,
            newPrice: Math.max(newPrice, 0),
            discountAmount
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: 'Server error' });
    }
};


//   const applyCoupon = async (req, res) => {
//     const { couponCode, totalPrice } = req.body;

//     try {
//         const coupon = await Coupon.findOne({ name: couponCode });

//         if (!coupon) {
//             return res.status(400).json({ message: 'Invalid coupon code' });
//         }

//         if (new Date() > coupon.expireOn) {
//             return res.status(400).json({ message: 'Coupon has expired' });
//         }

//         if (totalPrice < coupon.minimumPrice) {
//             return res.status(400).json({ message: 'Order amount is less than the minimum required' });
//         }

//         let discountAmount = coupon.offerPrice;
//         const newPrice = totalPrice - discountAmount;

//         res.json({
//             success: true,
//             newPrice: Math.max(newPrice, 0), // negative value handle
//             discountAmount
//         });
//     } catch (error) {
//         res.status(500).json({ message: 'Server error' });
//     }
// }



// remove coupon
const removeCoupon = async (req, res) => {
    const { totalPrice } = req.body;

    console.log(req.body);

    try {
        const originalPrice = parseFloat(totalPrice);
        res.json({
            success: true,
            newPrice: originalPrice.toFixed(2)
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
}



         

export default {    
    loadCheckout,
    getOrderAddress,
    postAddAddress,
    placeOrder ,
    cancelOrder,
    returnOrder,
    orderConfirm, 
    loadOrderDetails,      
    razorpayVerifyPayment,
    applyCoupon,
    removeCoupon,
    payment,
    // retryPayment,
    
    loadAdminOrderList,
    changeOrderStatus,
    loadOrderedProduct,
    loadOrderHistory,
    orderDetails,
}






// dash
// const dash = async(req,res) => {
//     try {
//         let usersData = [];
//         let currentSalesYear = new Date(new Date().getFullYear(), 0, 1);
//         let usersByYear = await User.aggregate([
//           {
//             $match: {
//               createdAt: { $gte: currentSalesYear },
//               blocked: { $ne: true },
//             },
//           },
//           {
//             $group: {
//               _id: { $dateToString: { format: "%m", date: "$createdAt" } },
//               count: { $sum: 1 },
//             },
//           },
//           { $sort: { _id: 1 } },
//         ]);
//         for (let i = 1; i <= 12; i++) {
//           let result = true;
//           for (let j = 0; j < usersByYear.length; j++) {
//             result = false;
//             if (usersByYear[j]._id == i) {
//               usersData.push(usersByYear[j]);
//               break;
//             } else {
//               result = true;
//             }
//           }
//           if (result) usersData.push({ _id: i, count: 0 });
//         }
//         let userData = [];
//         for (let i = 0; i < usersData.length; i++) {
//           userData.push(usersData[i].count);
//         }
//         let sales = [];
//         let salesByYear = await Order.aggregate([
//           {
//             $match: {
//               createdAt: { $gte: currentSalesYear },
//               orderStatus: { $ne: "Cancelled" },
//             },
//           },
//           {
//             $group: {
//               _id: { $dateToString: { format: "%m", date: "$createdAt" } },
//               total: { $sum: "$totalPrice" },
//               count: { $sum: 1 },
//             },
//           },
//           { $sort: { _id: 1 } },
//         ]);
//         for (let i = 1; i <= 12; i++) {
//           let result = true;
//           for (let j = 0; j < salesByYear.length; j++) {
//             result = false;
//             if (salesByYear[j]._id == i) {
//               sales.push(salesByYear[j]);
//               break;
//             } else {
//               result = true;
//             }
//           }
//           if (result) sales.push({ _id: i, total: 0, count: 0 });
//         }
//         let salesData = [];
//         for (let i = 0; i < sales.length; i++) {
//           salesData.push(sales[i].total);
//         }
//         const profitMargin = 0.5;
//         const currentYear = new Date().getFullYear();
//         const currentMonth = new Date().getMonth() + 1;
//         const latestOrder = await Order.find()
//           .sort({ createdAt: -1 })
//           .populate("products.productId");
//         const currentYearProfit = await Order.aggregate([
//           {
//             $match: {
//               orderStatus: "Delivered",
//               $expr: { $eq: [{ $year: "$createdAt" }, currentYear] },
//             },
//           },
//           {
//             $group: {
//               _id: null,
//               profit: {
//                 $sum: { $multiply: [profitMargin, "$totalPrice"] },
//               },
//             },
//           },
//         ]);
//         const revenue = await Order.aggregate([
//           {
//             $match: {
//               orderStatus: { $ne: "Delivered" },
//             },
//           },
//           { $group: { _id: null, revenue: { $sum: "$totalPrice" } } },
//         ]);
//         const monthlyEarning = await Order.aggregate([
//           {
//             $match: {
//               orderStatus: "Delivered",
//               $expr: { $eq: [{ $month: "$createdAt" }, currentMonth] },
//             },
//           },
//           { $group: { _id: null, earning: { $sum: "$totalPrice" } } },
//         ]);
//         const latestUsers = await User.find().sort({ createdAt: -1 }).limit(4);
//         const pendingOrder = await Order.countDocuments({ orderStatus: "Pending" });
//         const placedOrder = await Order.countDocuments({ orderStatus: "Placed" });
//         const cancelledOrder = await Order.countDocuments({
//           orderStatus: "Cancelled",
//         });
//         const deliveredOrder = await Order.countDocuments({
//           orderStatus: "Delivered",
//         });
//         const countProduct = await Product.countDocuments();
//         const categoryCount = await Category.countDocuments();
//         res.render("dash", {
//           currentYearProfit,
//           monthlyEarning,
//           cancelledOrder,
//           deliveredOrder,
//           categoryCount,
//           pendingOrder,
//           countProduct,
//           latestOrder,
//           latestUsers,
//           placedOrder,
//           salesData,
//           userData,
//           revenue,
//         });
// } catch (error) {
//     res.redirect("/500")
//    console.log(error.message); 
// }
// }










// const returnOrder = async (req, res) => {
//     try {
//         const { orderId, status } = req.body;
//         const userId = req.session.user_id;

//         // Find the order
//         const order = await Order.findOne({ _id: orderId, user: userId });
//         if (!order) {
//             return res.status(404).json({ success: false, message: 'Order not found' });
//         }

//         // Update product availability
//         for (let products of order.products) {
//             await Product.updateOne({ _id: products.productId }, {
//                 $inc: { quantity: products.quantity }
//             });
//         }

//         // Update order status to 'Returned' or another appropriate status
//         await Order.updateOne({ _id: orderId }, { $set: { orderStatus: status || 'Returned' } });

//         // Handle refund to wallet if payment was made online or through wallet
//         const user = await User.findOne({ _id: userId });
//         if (order.payment === 'wallet' || order.payment === 'online') {
//             user.wallet += order.amountPayable;

//             // Record the transaction in the user's history
//             const newHistory = {
//                 amount: order.amountPayable,
//                 status: 'credit',
//                 date: Date.now()
//             };
//             user.history.push(newHistory);

//             await user.save();
//         }

//         // Return updated order status
//         const updatedOrder = await Order.findOne({ _id: orderId });
//         res.status(200).json({ success: true, status: updatedOrder.orderStatus });

//     } catch (error) {
//         console.log(error.message);
//         res.redirect('/500'); // Redirect to error page
//     }
// };



// const placeOrder = async (req, res) => {
//     try {
//         const userId = req.session.user_id;
//         const { address, paymentMethod, walletAmount } = req.body;

//         // Convert wallet amount to number if provided
//         let walletBalance = walletAmount ? Number(walletAmount) : 0;

       
//         const cartProducts = await Cart.find({ userId: userId }).populate("product.productId");
//         if (!cartProducts || cartProducts.length === 0) {
//             return res.status(400).json({ error: "Your cart is empty." });
//         }

//         const singleCartProduct = cartProducts[0].product.map((items) => ({
//             productId: items.productId,
//             quantity: items.quantity,
//             price: items.price
//         }));

        
//         const cartTotal = await Cart.findOne({ userId: userId }, { _id: 0, grandTotal: 1 });
//         const totalAmount = cartTotal.grandTotal;

//         let amountPayable = totalAmount;
//         let walletUsed = 0;
//         let orderStatus = paymentMethod === 'cod' ? 'Confirmed' : 'Pending';

//         // Adjust amount payable and wallet usage
//         if (walletAmount) {
//             if (totalAmount > walletBalance) {
//                 amountPayable = totalAmount - walletBalance;
//                 walletUsed = walletBalance;
//             } else {
//                 amountPayable = 0;
//                 walletUsed = totalAmount;
//             }
//             if (amountPayable === 0) {
//                 orderStatus = 'Confirmed';
//             }
//         }

//         // Create the order
//         const order = new Order({
//             userId: userId,
//             products: singleCartProduct,
//             totalPrice: totalAmount,
//             paymentMethod: paymentMethod,
//             orderStatus: orderStatus,
//             address: address,
//             walletUsed: walletUsed,
//             amountPayable: amountPayable,
//             date: new Date(),
//         });

//         const savedOrder = await order.save();

//         // Decrease product qyantity
//         for (const items of cartProducts[0].product) {
//             const { productId, quantity } = items;
//             await Product.updateOne({ _id: productId }, { $inc: { quantity: -quantity } });
//         }

//         // Delete cart
//         await Cart.deleteOne({ userId: userId });

//         // Handle payment and wallet update
//         if (paymentMethod === 'cod' || amountPayable === 0) {
//             if (walletUsed > 0) {
//                 await User.updateOne(
//                     { _id: userId },
//                     {
//                         $inc: { wallet: -walletUsed },
//                         $push: {
//                             walletHistory: {
//                                 date: Date.now(),
//                                 amount: -walletUsed,
//                                 message: 'Used for purchase'
//                             }
//                         }
//                     }
//                 );
//             }
//             return res.json({ success: true });
//         } else if (paymentMethod === 'Razorpay') {
//             const payment = await paymentHelper.razorpayPayment(savedOrder._id, amountPayable);
//             if (!payment) {
//                 return res.status(500).json({ error: 'Payment creation failed' });
//             }
//             res.json({ payment: payment, success: false });
//         } else {
//             return res.status(400).json({ error: "Invalid payment method." });
//         }
//     } catch (error) {
//         console.log("Error during order placement:", error.message);
//         res.status(500).render('500');
//     }
// };

// const placeOrder = async (req, res) => {
//     try {
//         const userId = req.session.user_id;
//         const { address, paymentMethod, walletAmount, finalPrice } = req.body;

//         console.log(req.body);

//         let walletBalance = walletAmount ? Number(walletAmount) : 0;
//         console.log('wallet Balance -> ', walletBalance);

//         const cartProducts = await Cart.find({ userId: userId }).populate("product.productId");
//         if (!cartProducts || cartProducts.length === 0) {
//             return res.status(400).json({ error: "Your cart is empty." });
//         }

//         const singleCartProduct = cartProducts[0].product.map((items) => ({
//             productId: items.productId,
//             quantity: items.quantity,
//             price: items.price
//         }));

//         console.log('single Product', singleCartProduct);

//         const totalAmount = Number(finalPrice);
//         console.log('Total Amount : ', totalAmount);

//         let amountPayable = totalAmount;
//         let walletUsed = 0;
//         let orderStatus = paymentMethod === 'cod' ? 'Confirmed' : 'Pending';

//         // Adjust amount payable and wallet usage
//         if (paymentMethod === 'wallet') {
//             if (totalAmount > walletBalance) {
//                 amountPayable = totalAmount - walletBalance;
//                 walletUsed = walletBalance;
//             } else {
//                 amountPayable = 0;
//                 walletUsed = totalAmount;
//             }
//             if (amountPayable === 0) {
//                 orderStatus = 'Confirmed';
//             }
//         } else if (walletAmount) {
//             if (totalAmount > walletBalance) {
//                 amountPayable = totalAmount - walletBalance;
//                 walletUsed = walletBalance;
//             } else {
//                 amountPayable = 0;
//                 walletUsed = totalAmount;
//             }
//             if (amountPayable === 0) {
//                 orderStatus = 'Confirmed';
//             }
//         }

//         // Create the order
//         const order = new Order({
//             userId: userId,
//             products: singleCartProduct,
//             totalPrice: totalAmount,
//             paymentMethod: paymentMethod,
//             orderStatus: orderStatus,
//             address: address,
//             walletUsed: walletUsed,
//             amountPayable: amountPayable,
//             date: new Date(),
//         });

//         const savedOrder = await order.save();

//         // Handle payment and wallet update
//         if (paymentMethod === 'cod' || amountPayable === 0 || paymentMethod === 'wallet') {
//             // Decrease product quantity
//             for (const items of cartProducts[0].product) {
//                 const { productId, quantity } = items;
//                 await Product.updateOne({ _id: productId }, { $inc: { quantity: -quantity } });
//             }

//             // Update the user's wallet if used
//             if (walletUsed > 0) {
//                 await User.updateOne(
//                     { _id: userId },
//                     {
//                         $inc: { wallet: -walletUsed },
//                         $push: {
//                             walletHistory: {
//                                 date: Date.now(),
//                                 amount: -walletUsed,
//                                 message: 'Used for purchase'
//                             }
//                         }
//                     }
//                 );
//             }

//             // Delete the cart after confirming the order
//             await Cart.deleteOne({ userId: userId });

//             return res.json({ success: true });

//         } else if (paymentMethod === 'Razorpay') {
//             const payment = await paymentHelper.razorpayPayment(savedOrder._id, amountPayable);
//             console.log(payment, ' payment');
//             if (!payment) {
//                 return res.status(500).json({ error: 'Payment creation failed' });
//             }
//             res.json({ payment: payment, success: false });
//         } else {
//             return res.status(400).json({ error: "Invalid payment method." });
//         }
//     } catch (error) {
//         console.log("Error during order placement:", error.message);
//         res.status(500).render('500');
//     }
// };




// place order
// const placeOrder = async (req, res) => {
//     try {
//         const userId = req.session.user_id;
//         const { address, paymentMethod } = req.body;

//         const cartProducts = await Cart.find({ userId: userId }).populate("product.productId");

//         if (!cartProducts || cartProducts.length === 0) {
//             return res.status(400).json({ error: "Your cart is empty." });
//         }

//         const singleCartProduct = cartProducts[0].product.map((items) => ({
//             productId: items.productId,
//             quantity: items.quantity,
//             price: items.price
//         }));

//         const cartTotal = await Cart.findOne({ userId: userId }, { _id: 0, grandTotal: 1 });
//         const amountPayable = cartTotal.grandTotal;
//         let orderStatus = 'Pending'; // Default to Pending for Razorpay orders

//         // Create the order in the database
//         const order = new Order({
//             userId: userId,
//             products: singleCartProduct,
//             totalPrice: cartTotal.grandTotal,
//             paymentMethod: paymentMethod,
//             orderStatus: orderStatus,
//             address: address,
//             amountPayable: amountPayable,
//             date: new Date(),
//         });

//         const savedOrder = await order.save();

//         if (paymentMethod === 'cod') {
//             // Handle Cash on Delivery
//             savedOrder.orderStatus = 'Confirmed';
//             await savedOrder.save();

//             // Decrease the product quantities
//             for (const items of cartProducts[0].product) {
//                 const { productId, quantity } = items;
//                 await Product.updateOne({ _id: productId }, { $inc: { quantity: -quantity } });
//             }

//             // Delete the cart
//             await Cart.deleteOne({ userId: userId });

//             return res.json({ success: true });

//         } else if (paymentMethod === 'Razorpay') {
//             // Handle Razorpay payment
//             const payment = await paymentHelper.razorpayPayment(savedOrder._id, amountPayable);

//             if (!payment) {
//                 return res.status(500).json({ error: 'Payment creation failed' });
//             }

//             res.json({ payment: payment, success: false });

//         } else {
//             return res.status(400).json({ error: "Invalid payment method." });
//         }
//     } catch (error) {
//         console.log("Error during order placement:", error.message);
//         res.status(500).render('500');
//     }
// };


// const razorpayVerifyPayment = async (req, res) => {
//     try {
//         const { response, order } = req.body;

//         // Access the correct properties
//         const orderId = response.order_id;
//         const paymentId = response.payment_id;
//         const razorpaySignature = response.razorpay_signature;

//         console.log('Order --> ', order);
//         console.log(order.id ,'ordr');
//         console.log('Payment --> ', paymentId);

//         // Verify the HMAC
//         let hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
//         hmac.update(orderId + '|' + paymentId);
//         hmac = hmac.digest('hex');

//         console.log('Generated HMAC:', hmac);
      

//         if (hmac === razorpaySignature) {
//             // Update order status to 'Confirmed'
//             const updateResult = await Order.updateOne({ _id: order.order.id}, { $set: { orderStatus: 'Confirmed' } });
//             console.log('Update Result:', updateResult);


//             if (updateResult.nModified > 0) {
//                 res.json({ paid: true });
//             } else {
//                 console.log('No document updated. Check if order ID is correct.');
//                 res.json({ paid: false });
//             }
//         } else {
//             console.log('Signature mismatch');
//             res.json({ paid: false });
//         }
//     } catch (error) {
//         console.log("Error in payment verification:", error.message);
//         res.status(500).json({ error: "Payment verification failed" });
//     }
// };





// const placeOrder = async (req, res) => {
//     try {
//         const  userId  = req.session.user_id;
//         const { address, paymentMethod } = req.body;      

//         console.log('User ID:', userId);

//         const cartProducts = await Cart.find({ userId: userId }).populate("product.productId");
//         console.log('cartProducts',cartProducts);

//         const singleCartProduct = cartProducts[0].product.map((items) => ({
//             productId: items.productId,
//             quantity: items.quantity,         
//             price: items.price
//         }));
//         console.log(singleCartProduct);   

//         const cartTotal = await Cart.findOne({ userId: userId }, { _id: 0, grandTotal: 1 });
//         const amountPayable = cartTotal.grandTotal;
//         const orderStatus = 'Confirmed';

//         const order = new Order({
//             userId: userId,
//             products: singleCartProduct,
//             totalPrice: cartTotal.grandTotal,
//             paymentMethod: paymentMethod,
//             orderStatus: orderStatus,
//             address: address,
//             amountPayable: amountPayable,
//             date: new Date(),
//         });

//         await order.save();

//         // Decreasing quantity
//         for (const items of cartProducts[0].product) {
//             const { productId, quantity } = items;
//             await Product.updateOne({ _id: productId }, { $inc: { availability: -quantity } });
//         }

//         // Deleting cart
//         await Cart.deleteOne({ userId: userId }); 

//         return res.json({ success: true });
//     } catch (error) {
//         console.log(error.message);  
//         res.status(500).render('500');       
//     }
// };

// const placeOrder = async (req, res) => {
//     try {
//         const  userId  = req.session.user_id;
//         const { address, paymentMethod } = req.body;

//         // Retrieve the user's cart and populate the product details
//         const cartProducts = await Cart.find({ userId }).populate("product.productId");
//         if (!cartProducts.length) {
//             throw new Error('Cart is empty.');
//         }

//         const singleCartProduct = cartProducts[0].product.map((items) => ({
//             productId: items.productId,
//             quantity: items.quantity,
//             price: items.total
//         }));

//         // Retrieve the total price from the cart
//         const cartTotal = await Cart.findOne({ userId }, { _id: 0, grandTotal: 1 });
//         const amountPayable = cartTotal.grandTotal;

//         // Determine the order status based on payment method
//         let orderStatus = paymentMethod === 'COD' ? 'Confirmed' : 'Pending';

//         // Create a new order
//         const order = new Order({
//             userId: userId,
//             products: singleCartProduct,
//             totalPrice: amountPayable,
//             paymentMethod: paymentMethod,
//             orderStatus: orderStatus,
//             address: address,
//             date: new Date()
//         });
//         const ordered = await order.save();

//         // Decrease the product quantities
//         for (const items of cartProducts[0].product) {
//             const { product_Id, quantity } = items;
//             await Product.updateOne({ _id: product_Id }, { $inc: { quantity: -quantity } });
//         }

//         // Delete the cart
//         await Cart.deleteOne({ userId });

//         // Handle payment methods
//         if (paymentMethod === 'COD') {
//             res.json({ success: true });
//         } else if (paymentMethod === 'Razorpay') {
//             const payment = await paymentHelper.razorpayPayment(ordered._id, amountPayable);
//             res.json({ payment: payment, success: false });
//         }

//     } catch (error) {
//         console.log(error.message);
//         res.redirect("/500");
//     }
// };