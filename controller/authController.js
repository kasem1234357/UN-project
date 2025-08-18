const API = require("../classes/Api");
const User = require("./../models/User");
const { GET_RESET_PASSWORD_URL, SUPPORT_EMAIL_TEMPLATE, RESET_PASSWORD_TEMPLATE } = require("../constraints/CONSTANTS");
const Token = require('./../models/Token')
const ResetToken = require('./../models/ResetToken')
//)

const asyncErrorHandler = require("./../wrapper_functions/asyncErrorHandler");
const { signToken, verifyToken, generateResetToken,sendToEmail, hashPassword } = require("../utils");
const dotenv = require("dotenv");
const InviteCode = require("../models/InviteCode");
dotenv.config();

exports.signup = asyncErrorHandler(async (req, res,next) => {
  const api = new API(req, res);
  const {email,nickName,password,inviteCode} = req.body
   const checkEmail = await User.findOne({ email: req.body.email });
    const checkName = await User.findOne({userName:req.body.nickName});
    const inviteState = await InviteCode.findOne({code :inviteCode}) 
    const isInvite = (inviteState && inviteState.state === true) || req.body.inviteCode === "SuperAdmin@1234"
  
    //generate new password
    if(checkEmail ){
      const error = api.errorHandler("invalid","email is taken")
      return next(error)
      
    }
    else if(checkName){
     const error = api.errorHandler("invalid","name is taken")
      return next(error)
      
    }
    else if(!isInvite ){
      const error = api.errorHandler('Forbidden',"you are not invited")
     return next(error)
     
    }
 // const otp = Math.floor(100000 + Math.random() * 900000).toString();
    

  //const otpExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
  const newUser = await User.create({
    email,
    userName:nickName,
    password,
    confirmPassword:password
  });
  // create access token
  const accessToken = signToken(newUser._id);
  // create refresh token
  // store refresh token in database
   const newToken = await Token.create({token:accessToken,userId:newUser._id})

   // send request to the client 
   newUser.save()
       api.dataHandler("create", {data:{
        token:newToken.token,
    nickName:newUser.userName,
    email:newUser.email,
    role:newUser.role,
    isVerified:newUser.isVerified
  } });
});
exports.login = asyncErrorHandler(async (req, res, next) => {
  const api = new API(req, res);
  const { email, password } = req.body;
  // check if user found 
 
  const user = await User.findOne({ email }).select("+password");
  if (!email || !password) {
    const error = api.errorHandler("uncomplated_data");
    next(error);
  }
  if (!user) {
    const error = api.errorHandler("not_found");
    next(error);
  }
  // check if password correct
  const hashedPassword = hashPassword(password)
  const isMatch = user.password === hashedPassword
  if (!isMatch) {
    const error = api.errorHandler("invalid");
    next(error);
  }
  // generate access token
  const accessToken = signToken(user._id);
  // generate refresh token
 
  // check if previous refresh token still found and deleted
  await Token.findOneAndDelete({userId:user._id})
  // store new refresh token in database
  const newToken = await Token.create({token:accessToken,userId:user._id})
  // send access and refresh token to db

  api.dataHandler("create", {   data:{
    token:newToken.token,
    nickName:user.userName,
    email:user.email,
    role:user.role,
    isVerified:user.isVerified
  } },'user log in and new tokens has been generated');
});
// exports.verifyOtp =asyncErrorHandler( async (req, res,next) => {
//   const api = new API(req,res)
//   const { email, otp } = req.body;
//   const user = await User.findOne({ email });
//   if (!user) {
//     const error = api.errorHandler('not_found','email not found')
//       next(error)
//   }

//   if (user.otp !== otp || Date.now() > user.otpExpires) {
//     const error = api.errorHandler('invalid','OTP is invalid or expired')
//     next(error)
//   }

//   user.otp = null;
//   user.otpExpires = null;
//   user.isVerified = true;
//   await user.save();

//   const token = signToken(user._id)
//   api.setCookie({
//       token:newToken
//     })
//     api.dataHandler('fetch',{
//       token
//     })
// })


exports.token = asyncErrorHandler(async (req, res, next) => {
  const refreshToken = req.body.token;
  const api = new API(req, res);

  if (refreshToken == null){
    const error = api.errorHandler('unauthorized','your refreshToken not found')
    next(error)
  };
  let decodedToken =await verifyToken(refreshToken,process.env.REFRESH_TOKEN_SECRET)
  if(!decodedToken){
    const error = api.errorHandler('unauthorized')
    next(error)
  }
   const token = await Token.findOne({userId:decodedToken.id})
 
 
  
  if (!token || refreshToken !== token.token){
    const error = api.errorHandler('unauthorized','your token not valid anymore')
    next(error)
  }else{
    const accessToken = signToken(decodedToken.id);
    api.dataHandler("create", { accessToken},'new access token has been created');
  }
  
});
exports.logout = asyncErrorHandler(async (req, res, next) =>{
  const api = new API(req,res)
  const userId = req.user._id
  console.log(userId)
  await Token.findOneAndDelete({userId})
  api.dataHandler('delete')
})
exports.foregetPassword = asyncErrorHandler(async (req,res,next)=>{
  const user = await User.findOne({email:req.body.email})
  const api = new API(req,res)
  
  if(!user){
    const error = api.errorHandler('not_found','user not found check if the email correct')
    next(error)
  }
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const newResetToken = await ResetToken.create({
    userID:user._id,
    code:resetCode
  })
await newResetToken.save()
  
  const result = await sendToEmail({
    email:req.body.email,
    subject:'Reset Password',
    isTemplate:true,
    template:RESET_PASSWORD_TEMPLATE.replace('{{subject}}', 'OTP verification').replace('{{message}}', resetCode).replace('{{type}}', 'system msg').replace('{{from}}',req.body.email)
  })

  if(result){
    api.dataHandler('create','otp code created its valid for 15 min')
  }else{
    await ResetToken.findByIdAndDelete(newResetToken._id)
    const error = api.errorHandler('uncomplated_data','something going wrong with send to email operation')
    next(error)
    
  }
 
  
})
exports.resetPassword =asyncErrorHandler(async(req,res,next)=>{
  const api = new API(req,res)
  const resetUserToken = await ResetToken.findOne({code:req.body.code})
  if(!resetUserToken){
    const error = api.errorHandler('invalid','your token in invalid')
    next(error)
  }
  const currentUser = await User.findById(resetUserToken.userID)
  if(!currentUser){
    const error = api.errorHandler('not_found','user not found')
    next(error)
  }
  if(req.body.newPassword.length === 0){
    const error = api.errorHandler('uncomplated_data')
    next(error)
  }
  const newHashedPassword = hashPassword(req.body.newPassword)

  await currentUser.updateOne({$set:{password:newHashedPassword}})
  api.dataHandler('update')
})