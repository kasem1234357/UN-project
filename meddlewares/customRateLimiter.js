const { default: rateLimit } = require("express-rate-limit");
const CustomError = require("../classes/Error");

const customRateLimiter = (requestNumber,customTime=15*60*1000,msg=null)=>{
    return rateLimit({
        limit:requestNumber,
        windowMs:customTime,
        message:msg || 'Too many requests from this IP, please try again later.',
        standardHeaders:'draft-7',
        keyGenerator: (req, res) => {
            return req.ip
        },
        handler: function(req, res, next) {
             next(new CustomError('too many requests', 429));
            
        },
    })
}
module.exports = customRateLimiter