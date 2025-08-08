const mongoose = require('mongoose');

const evaluateBuildingSchema = new mongoose.Schema({
   id:{
    type:String,
    require:true
   },
   key:{
      type:String,
    require:true
   }



});

module.exports = mongoose.model('evaluateBuilding',evaluateBuildingSchema)