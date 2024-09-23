import mongoose, { Schema } from 'mongoose'; 

const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
        minlength: 4,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    mobile:{
        type:String,
        required:false,
        unique:true,
        maxlength : 10,
        sparse : true,
        default : null,
    },
    googleId : {
        type:String,
        // unique : true,
    },
    password:{
        type:String,
        required:false,
    },
    isVerified : {
        type : Boolean,
        default : false, 
    },
    role :{
        type : String,
        default : "user"
    },
    isBlocked :{
        type : Boolean,
        default : false,
    },
    token : {
        type : String,
        default : ""  
    },
    cart :[{
        type : Schema.Types.ObjectId,
        ref : "Cart"
    }],
    wallet: {
        type: Number,
        default: 0
    },
    walletHistory : [{
        date : {
            type : Date,
        },
        amount : {
            type : Number
        },
        type : {
            type : String
        },
        message : {
            type : String
        }

    }],
    whishlist : [{
        type : Schema.Types.ObjectId,
        ref : "Wishlist"
    }],
    orderHistory : [{
        type : Schema.Types.ObjectId,
        ref : "Order",
    }],
    createdOn :{
        type : Date,
        default : Date.now
    },
    referalCode : {
        type : String,
        required : false
    },
    redeemed : {
        type : Boolean,
        default : false
    },
   referalCodes :{
     type : String,
     required : false
   },
    // redeemedUsers : [{
    //     type : Schema.Types.ObjectId,
    //     ref : "User",
    //     required : true
    // }],
    searchHistory : [
        {category : {
            type : Schema.Types.ObjectId,
            ref : "Category"
        },},
    {brand : {type : String,},
    searchedOn : {type : Date.now,}}     
    ]  
});


//Export the model
export default mongoose.model('User', userSchema); 



