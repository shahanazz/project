import mongoose, { Schema } from 'mongoose'; 

const orderSchema = new mongoose.Schema({

    userId : {
        type: mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : true
    },
 
    products : [{
        productId : {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'Product',
            required : true
        },
        quantity : {
            type : Number,
            required : true
        },
        price : {
            type : Number,
            required : true
        },
        productoffer: {
            type: Number, // product  offer feild
            default: 0
        }
    }],

    totalPrice : {
        type : Number,
        required : true
    },

    paymentMethod : {
        type : String,
        required : true
    },
    walletUsed : {
        type : Number,
        required : false
    },

    amountPayable : {
        type : Number,
        required : false
    },
    orderStatus : {
        type : String,
        default : 'Pending'
    },

    address : {
        type : mongoose.Schema.Types.ObjectId, 
        ref : 'Address',
        required : true
    },
    
    date : {
        type : Date,
        default : Date.now
    },
    discount: {
        type: Number, 
        default: 0
    },
    coupon: {
        type: Number, 
        default: 0
    }

},

{ timestamps: true }
);
//     orderId : {
//         type : String,
//         default : ()=>uuidv4(),
//         unique : true
//     },
// orderedItems : [{
//     product : {
//         type : Schema.Types.ObjectId,
//         ref : 'Product',
//         required : true
//     },
//     quantity : {
//         type : Number,
//         required : true,
//     },
//     price : {
//         type :Number,
//         default : 0
//     }
// }],
// totalPrice : {
//     type : Number ,
//     required : true
// },
// discount  : {
//     type : Number,
//     default : 0,
// },
// finalAmount : {
//     type : Number,
//     required : true
// },
// address : {
//     type : Schema.Types.ObjectId,
//     ref : 'Address',
//     required : true
// },
// payment : {
//     type : String,
//     required : true
// },
// userId : {
//     type : Schema.types.ObjectId,
//     ref : 'User',
//     required : true
// },
// invoiceDate : {
//     type : Date,
// },
// status : {
//     type : String,
//     required : true,
// },
// createdOn : {
//     type : Date,
//     default : Date.now,
//     required : true
// },
// couponApplied : {
//     type : Boolean,
//     default : false
// }

// });

export default mongoose.model('Order' , orderSchema);