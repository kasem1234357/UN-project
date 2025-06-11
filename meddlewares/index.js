const logger = require('./logger')
const requestTime =require('./requestTime') 
const globalHandleError = require('./errorController')
const isAuth = require('./isAuth')
const  restrict  = require('./restrict')
module.exports = {
    logger,
    requestTime,
    globalHandleError,
    isAuth,
    restrict
}