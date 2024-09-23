import mongoose, { Schema } from 'mongoose';

const couponSchema = Schema({
    name : {
        type : String,
        required : true,
        unique : true
    },
    createdOn : {
        type : Date,
        required : true
    },
    expireOn : {
        type : Date,
        required : true       
    },
    offerPrice : {
        type : Number,
        required : true
    },
    minimumPrice : {
        type : Number,
        required : true
    },
    isList : {
        type : Boolean,
        default : true
    },
    userId : {
        type : Array
    }
})

export default mongoose.model('Coupon' , couponSchema);