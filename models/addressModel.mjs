import mongoose, { Schema } from "mongoose";

const addressSchema = mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required: true,
      },
      
    username:{
        type:String,
        required: true,
        trim:true
    },
    mobile:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        required: true,
        trim:true 
    },
    landmark:{
        type:String,
        required: true,
        trim:true 
    },
    houseName:{
        type:String,
        required: true,
        trim:true 
    },
    city:{
        type:String,
        required: true,
        trim:true 
    },
    state:{
        type:String,
        required: true,
        trim:true 
    },
    country:{
        type:String,
        required: true,
        trim:true 
    },
    pincode:{
        type:String,
        required: true,
        trim:true
    },     
    status:{
      type:Boolean,
      default:true,
    }

})
    // userId: {
    //     type: Schema.Types.ObjectId,
    //     ref : 'User',
    //     required : true
    // },
    // address : [{
    //     addressType : {
    //         type : String,
    //         required : true
    //     } ,
    //     name : {
    //         type : String,
    //         required  : true
    //     },
    //     city : {
    //         type : String,
    //         required : true
    //     },
    //     landmark :{
    //         type : String,
    //         required : true
    //     } ,
    //     state : {
    //         type : String,
    //         required : true
    //     },
    //     pincode : {
    //         type : Number,
    //         required : true
    //     },
    //     mobile : {
    //         type : String,
    //         required : true,
    //     },
    //     altPhone : {
    //         type : String,
    //         required : true
    //     }
    // }]

export default mongoose.model('Address' , addressSchema);