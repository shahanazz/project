import mongoose from 'mongoose'; 

const productSchema = mongoose.Schema({
    productname : {
        type : String,
        required : true,
    },
    description : {
        type : String,
        required : true
    },
    brand  : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Brand",
        required: true,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
    },
    regularprice :{
        type : Number,
        required : true
    },
    saleprice : {
        type : Number,
        required : false,
    },
    productoffer : {
        type : Number,
        default : 0,
    },
    quantity :{
        type : Number,
        required : true,
    },
    color : {
        type : String,
        required : true
    },
    size : {
        type : String,
        required : true,
    },
    image : { 
        type : Array,
        required : true,
        validate : [arrayLimit,'you can pass inly 4 product images']
    },
    // productimage : {
    //     type : String,
    //     required : true
    // },
    isDeleted : {
        type : Boolean,
        default : false,
    },
    status : {
        type : Boolean,
        required : true,
    },
    orderCount : {
        type : Number,
        default : 0,
    },
    couponsUsed: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Coupon", 
    }],
   createdOn : {
        type : Date,
        default : Date.now
    },
});

function arrayLimit(val){
    return val.length <= 5;
}

export default mongoose.model('Product', productSchema);