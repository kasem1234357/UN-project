const mongoose = require('mongoose')
const InviteSchema =new mongoose.Schema({
 code:{
  type:String,
  required: true,
 },
 role:{
  type:String,
  enum:['normal','admin','super_admin','sales_manger',"Receptionist"],
  default:'normal'
 },
 state:{
  type:Boolean,
  default:true,
 },
 createdAt: {
  type: Date,
  default: Date.now,
  //expires: 900 // Set to 15 minutes (15 * 60 seconds)
}
}, {
    timestamps: true,
    expires: 60 * 60 * 24 // expire after 24 hours
  })

module.exports = mongoose.model('InviteCode',InviteSchema)