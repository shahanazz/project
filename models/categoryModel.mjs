import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
    category : {
        type : String,
        required : true,
        unique :true
    },
    description : {
        type : String,
        required : true
    },
    status : {
        type : Boolean,
        default : true
    },
    categoryOffer : {
        type : Number,
        default : 0,
    },
    // isDeleted : {
    //     type : Boolean,
    //     default : true
    // },
    createdAt : {
        type: Date,
        default: Date.now
    },
    // updatedAt : {
    //     type: Date,
    //     default: Date.now
    // },
    // image : {
    //     type : String,
    //     default : ''
    // }
});

export default mongoose.model('Category', categorySchema);