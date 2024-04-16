const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    isDelete: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

brandSchema.virtual('published', {
    ref: 'product',
    foreignField: 'brand',
    localField: '_id'
});

brandSchema.set('toObject', { virtuals: true });
brandSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('brand', brandSchema);
