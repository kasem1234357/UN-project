module.exports = (req,res,next)=>{
    console.log(`request start in ${new Date().toUTCString()}`)
    next()
}

