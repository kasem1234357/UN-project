const crypto = require('crypto')
/**
 * Description
 * 
 * return random reset token with crypto library
 * @returns {string}
 */
const generateResetToken = function(){
    const reset_Token = crypto.randomBytes(32).toString('hex')
    return reset_Token
}
module.exports = generateResetToken