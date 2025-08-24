const HeritageBuildingAssessment = require('../models/HeritageBuilding');
const asyncErrorHandler = require('../wrapper_functions/asyncErrorHandler');
const { format } = require('date-fns'); // Assuming you use this
const API = require('../classes/Api'); // Assuming similar structure to your `createOrder`
const { evaluateBuildingCondition } = require('../utils');
const evaluateBuilding = require('../models/evaluateBuilding');

function formatDates(data, fields = [
  'inspectionDate',
  'deliveryDate',
  'invoiceDate',
  'createdAt',
  'updatedAt'
]) {
  if (Array.isArray(data)) {
    return data.map(d => formatDates(d, fields));
  }

  // Work on a plain object so we don’t tinker with Mongoose internals
  const obj = (data && typeof data.toObject === 'function') ? data.toObject() : { ...data };

  for (const field of fields) {
    if (obj[field]) {
      try {
        obj[field] = format(new Date(obj[field]), 'yyyy MMM dd');
      } catch (e) {
        // If formatting fails, leave the original value (or optionally log)
      }
    }
  }

  return obj;
}
exports.upsertRating = asyncErrorHandler(async (req, res, next) => {
  const api = new API(req, res);
  const { polygonId } = req.body;

  if (!polygonId) {
    return res.status(400).json({ error: 'polygonId is required' });
  }

  const existingRating = await HeritageBuildingAssessment.findOne({ polygonId }).select('-__v');

  let updatedRating;

  if (existingRating) {
    // Update existing rating
    existingRating.set({
      ...req.body,
      editBy: req.user._id,
      updatedAt: new Date(),
    });

    updatedRating = await existingRating.save();
     const evaluate = evaluateBuildingCondition(req.body)
    console.log(evaluate);
     const newEvaluate = await evaluateBuilding.findOneAndUpdate({
       id:req.body.polygonId,
    },{
       key:evaluate
    })
    console.log(newEvaluate);
    
    newEvaluate.save();

    api.dataHandler("update", { data: updatedRating});
  } else {
    // Create new rating
    const newRating = await HeritageBuildingAssessment.create({
      ...req.body,
      surveyMadeBy: req.user._id,
      editBy: req.user._id,
    }).then(doc => doc.toObject({ versionKey: false }));
    const evaluate = evaluateBuildingCondition(req.body)
    console.log(evaluate);
    
    const newEvaluate = await evaluateBuilding.create({
       id:req.body.polygonId,
       key:evaluate
    })
    console.log(newEvaluate);
    
    newEvaluate.save();

    api.dataHandler("create", { data: newRating });
  }
});
exports.buildingRatingById = asyncErrorHandler(async (req, res, next)=>{
      const api = new API(req, res);
  const { polygonId } = req.params;
    const existingRating = await HeritageBuildingAssessment.findOne({ polygonId });
    if(!existingRating){
        const error =  api.errorHandler('not_found','rating not found')
        next(error)
    }
    api.dataHandler('fetch',{
      data:existingRating})
});
exports.getKeys = asyncErrorHandler(async (req, res, next)=>{
    const api = new API(req, res);
    const keysData = api.modify(evaluateBuilding.find()).filter().sort().paginate().limitFields()
    const data = await api.query
    api.dataHandler('fetch',data)
})
exports.getAllStatics = asyncErrorHandler(async(req,res,next)=>{
  const pipeline = [
    // Join with User to get reviewer info (editBy)
    {
      $lookup: {
        from: 'users', // collection name in MongoDB
        localField: 'editBy',
        foreignField: '_id',
        as: 'reviewerData'
      }
    },
    {
      $unwind: {
        path: '$reviewerData',
        preserveNullAndEmptyArrays: true
      }
    },
    // Join with EvaluateBuilding to get status
    {
      $lookup: {
        from: 'evaluatebuildings', // collection name
        localField: 'polygonId', // assuming EvaluateBuilding.id maps to HeritageBuildingAssessment _id
        foreignField: 'id',
        as: 'evaluationData'
      }
    },
    {
      $unwind: {
        path: '$evaluationData',
        preserveNullAndEmptyArrays: true
      }
    },
    // Project the required fields
    {
      $project: {
        _id: 0,
        areaName: '$neighborhood', // or governorate/district based on your requirement
        reviewer: '$reviewerData.userName',
        buildingStatus: '$evaluationData.key',
        createdAt:1,
        constructionType:1,
        polygonId:1
      }
    }
  ];
  const api = new API(req,res)
  api.modify(HeritageBuildingAssessment.aggregate(pipeline) ).filter().sort().paginate()
  const result = await api.query
  api.dataHandler('fetch',result)
})
exports.getAll = asyncErrorHandler(async(req,res,next)=>{

  const api = new API(req,res)
  api.modify(HeritageBuildingAssessment ).filter().sort().paginate()
  const result = await api.query
  api.dataHandler('fetch',result)
})

