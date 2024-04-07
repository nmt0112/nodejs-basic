var mongoose = require('mongoose');

var categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    isDelete: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

categorySchema.virtual('published', {
    ref: 'product',
    foreignField: 'category',
    localField: '_id'
})

categorySchema.set('toObject', { virtuals: true })
categorySchema.set('toJSON', { virtuals: true })

module.exports = new mongoose.model('category', categorySchema)
