var mongoose = require('mongoose');
var bcrypt = require('bcrypt')

var userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    status: {
        type: Boolean,
        default: false
    },
    role: {
        type: [String],
        require: true,
        default: "USER"
    }

}, { timestamps: true });

userSchema.pre('save', function () {
    this.password = bcrypt.hashSync(this.password, 10)
})

module.exports = new mongoose.model('user', userSchema)
