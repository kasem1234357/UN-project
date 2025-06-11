
const jwt = require("jsonwebtoken");
const util = require('util')
const verifyToken = async (token,secret)=>{
    return await util.promisify(jwt.verify)(token,secret)
}

module.exports = verifyToken