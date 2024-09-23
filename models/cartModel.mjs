import mongoose, { Schema } from 'mongoose'; 

const cartSchema = new mongoose.Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref : 'User',
        required : true
    },
    product : [{
        productId : {
            type : Schema.Types.ObjectId,
            ref : 'Product',
            required : true
        },
        quantity : {
            type : Number,
            default : 1
        },
        price : {
            type : Number,
            required : true
        },
        total : {
            type : Number,
            required : true
        },
        status : {
            type : String,
            default : 'placed'
        },
        // cancellationReason : {
        //     type : String,
        //     default : 'none'
        // }
    }],
    grandTotal:{
        type:Number,
        require:true
    },
    count:{
        type:Number,
        default:1
    }
})

export default mongoose.model('Cart' , cartSchema);