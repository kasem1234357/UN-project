const mongoose = require('mongoose');
const tokenSchema = new mongoose.Schema({
    token:String,
    userId:String
})
const Token = mongoose.model('tokens',tokenSchema)
module.exports = Token