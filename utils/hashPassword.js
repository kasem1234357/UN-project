const crypto = require("crypto");
const dotenv = require('dotenv')
dotenv.config({path: './config.env'});
function hashPassword(password) {
    const hash = crypto.createHash('sha256');
    hash.update(password);
    return hash.digest('hex');
  }
  console.log(hashPassword('kasem'))
module.exports = hashPassword
