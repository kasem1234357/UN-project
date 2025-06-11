const CustomError = require("../classes/Error")

 const restrict = (...requiredPermissions)=>{
    return (req,res,next)=>{
        if(!requiredPermissions.includes(req.user.permissions)){
            const error = new CustomError(`you don't have permissions to perform this action `)
            next(error)
        }
        next()
    }
}
module.exports= restrict