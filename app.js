//====================================================//
//==========core packeges ============================//
const express = require('express')
const cors = require('cors')
const rateLimiter = require('express-rate-limit')
//====================================================//
//=========== Routes =================================//

const userRoute = require('./routes/authRouter')

//===================================================//
//============== meddlewares ========================//

const { globalHandleError,requestTime } = require('./meddlewares')


//===================================================//
//============== other =============================//

const corsOptions = require('./config/corsConfig')
const CustomError = require('./classes/Error')

//=================================================//
//=============== app logic ======================//

const app = express()
app.set('trust proxy', 1)
let limter = rateLimiter({
    windowMs:15 * 60 * 1000, // 15 minutes
    limit:100,
    message:'Too many requests from this IP, please try again later.',
    standardHeaders:'draft-7'
})
app.use(express.json())
app.use(cors(corsOptions))
app.use(limter)
app.use(requestTime)

//    ROUTES    //

app.use('/api/auth',userRoute)

//==============//
// handling routes not found error
app.all('*',(req,res,next)=>{
    const err = new CustomError(`Can't find ${req.originalUrl} on the server!`, 404);
    next(err)
})
// handling all types of mongoDb error and api error
app.use(globalHandleError)

module.exports = app;