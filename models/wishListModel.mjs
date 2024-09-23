import mongoose, { Schema } from 'mongoose';

const WishlistSchema = new Schema({
    userId : {
        type : Schema.Types.ObjectId,
        ref : 'User',
        required : true,
    },
    products : [{
        productId : {
            type : Schema.Types.ObjectId,
            ref : 'Product',
            required : true
        },
        addedOn : {
            type : Date,
            default : Date.now
        }
    }]
})

export default mongoose.model('Wishlist', WishlistSchema);