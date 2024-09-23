import Razorpay from 'razorpay';
import 'dotenv/config';
const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = process.env;


var instance = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});    

export default {
  razorpayPayment: async (orderId, grandTotal) => {
    try {
      const id = "" + orderId;
      // console.log(id +'orderid'); 
      const order = await instance.orders.create({
        amount: grandTotal * 100,
        currency: "INR",
        receipt: id,
      });
      // console.log('order online: ', order);
      return order;
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      return null; // Handle the error appropriately or rethrow it
    }
  },
};