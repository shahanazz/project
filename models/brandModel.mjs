import mongoose from 'mongoose';

const brandSchema = new mongoose.Schema({
    brandName : {
        type : String,
        required : true,
    },
    status : {
        type : Boolean,
        default : false
    },
    isDeleted : {
        type : Boolean,
        default : false
    },
    createdAt : {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('Brand' , brandSchema);