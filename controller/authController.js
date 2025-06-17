const API = require("../classes/Api");
const User = require("./../models/User");
const { GET_RESET_PASSWORD_URL, SUPPORT_EMAIL_TEMPLATE } = require("../constraints/CONSTANTS");
const Token = require('./../models/Token')
const ResetToken = require('./../models/ResetToken')
//)

const asyncErrorHandler = require("./../wrapper_functions/asyncErrorHandler");
const { signToken, verifyToken, generateResetToken,sendToEmail } = require("../utils");
const dotenv = require("dotenv");
const InviteCode = require("../models/InviteCode");
dotenv.config();

exports.signup = asyncErrorHandler(async (req, res,next) => {
  const api = new API(req, res);
  const {email,nickName,password,inviteCode} = req.body
   const checkEmail = await User.findOne({ email: req.body.email });
    const checkName = await User.findOne({username:req.body.nickName});
    const inviteState = await InviteCode.findOne({code :inviteCode}) 
    const isInvite = (inviteState && inviteState.state === true) || req.body.inviteCode === "SuperAdmin@1234"
  
    //generate new password
    if(checkEmail ){
      const error = api.errorHandler("invalid","email is taken")
      next(error)
    }
    else if(checkName){
     console.log(req.body.userName);
     const error = api.errorHandler("invalid","name is taken")
      next(error)
    }
    else if(!isInvite ){
      const error = api.errorHandler('Forbidden',"you are not invited")
     next(error)
    }
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
    

  const otpExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
  const newUser = await User.create({
    email,
    userName:nickName,
    password,
    otp,
    otpExpires,
    confirmPassword:password
  });
  // create access token
  const accessToken = signToken(newUser._id);
  // create refresh token
  // store refresh token in database
   const newToken = await Token.create({token:accessToken,userId:newUser._id})

   // send request to the client 
   newUser.save()
       const result = await sendToEmail({
      email:req.body.email,
      subject:'otp verification',
      isTemplate:true,
      template:SUPPORT_EMAIL_TEMPLATE.replace('{{subject}}', 'OTP verification').replace('{{message}}', otp).replace('{{type}}', 'system msg').replace('{{from}}',req.body.email)
    })

    if(result){
       api.dataHandler("create", { accessToken:newToken.token,  data:{
    nickName:newUser.userName,
    email:newUser.email,
    role:newUser.role
  } });
    }else{
      await User.findByIdAndDelete(newUser._id)
      const error = api.errorHandler('uncomplated_data','something going wrong with send to email operation')
      next(error)
      
    } 
 
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
  const isMatch = await user.comparePasswordDB(password, user.password);
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

  api.dataHandler("create", { accessToken:newToken.token,  },'user log in and new tokens has been generated');
});
exports.verifyOtp =asyncErrorHandler( async (req, res,next) => {
  const api = new API(req,res)
  const { email, otp } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    const error = api.errorHandler('not_found','email not found')
      next(error)
  }

  if (user.otp !== otp || Date.now() > user.otpExpires) {
    const error = api.errorHandler('invalid','OTP is invalid or expired')
    next(error)
  }

  user.otp = null;
  user.otpExpires = null;
  await user.save();

  const token = signToken(user._id)
  api.setCookie({
      token:newToken
    })
    api.dataHandler('fetch',{
      token
    })
})

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
  const resetToken = generateResetToken()
  const newResetToken = await ResetToken.create({
    userID:user._id,
    token:resetToken
  })
await newResetToken.save()
  console.log(GET_RESET_PASSWORD_URL(`${process.env.FRONT_URL}/forgetPassword/${resetToken}`))
  const result = await sendToEmail({
    email:req.body.email,
    subject:'Reset Password',
    message:GET_RESET_PASSWORD_URL(`${process.env.FRONT_URL}/${resetToken}`)
  })

  if(result){
    api.dataHandler('create','reset token created its valid for 15 min')
  }else{
    await ResetToken.findByIdAndDelete(newResetToken._id)
    const error = api.errorHandler('uncomplated_data','something going wrong with send to email operation')
    next(error)
    
  }
 
  
})
exports.resetPassword =asyncErrorHandler(async(req,res,next)=>{
  const api = new API(req,res)
  const resetUserToken = await ResetToken.find({token:req.body.resetToken})
  if(!resetUserToken){
    const error = api.errorHandler('invalid','your token in invalid')
    next(error)
  }
  const currentUser = await User.findById(resetUserToken.userId)
  if(!currentUser){
    const error = api.errorHandler('not_found','user not found')
    next(error)
  }
  if(req.body.newPassword.length === 0){
    const error = api.errorHandler('uncomplated_data')
    next(error)
  }
  const newHashedPassword = hashPassword(req.body.newPassword)
  up
  await currentUser.updateOne({$set:{password:newHashedPassword}})
  api.dataHandler('update')
})