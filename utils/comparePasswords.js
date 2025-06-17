const crypto = require("crypto");
const dotenv = require('dotenv')
dotenv.config()
/**
 * Description
 * this function to compare password
 * @param {string} plainPassword
 * @param {string} hashedPassword
 * @returns {boolean}
 */
/**
 * 
 * 
 */
function comparePasswords(plainPassword, hashedPassword) {
    const hash = crypto.createHash(process.env.HASH_TYPE );
    hash.update(plainPassword);
    const hashedPlainPassword = hash.digest('hex');
    return hashedPlainPassword === hashedPassword;
  }
module.exports = comparePasswords