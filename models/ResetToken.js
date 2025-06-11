const mongoose = require('mongoose')
const resetTokenSchema = mongoose.Schema({
    userID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"users",
        required:true
    },
    token:{
        type: String,
        required:true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 900 // Set to 15 minutes (15 * 60 seconds)
    }
})
module.exports = mongoose.model('resetToken',resetTokenSchema)