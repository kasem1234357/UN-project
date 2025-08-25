const HeritageBuildingAssessment = require('../models/HeritageBuilding');
const asyncErrorHandler = require('../wrapper_functions/asyncErrorHandler');
const { format } = require('date-fns'); // Assuming you use this
const API = require('../classes/Api'); // Assuming similar structure to your `createOrder`
const { evaluateBuildingCondition, generatePolygonIdFromPoints } = require('../utils');
const evaluateBuilding = require('../models/evaluateBuilding');
const User = require('../models/User');
const geoJson = require('../polygonIds.json')
// const { promises: fs } = require('node:fs');
// let ids = [];
//     geoJson.features.forEach(feature =>{
//       const id = generatePolygonIdFromPoints(feature.geometry.coordinates[0])
//      ids.push(id)
      
      
//     })
//     console.log(ids);
//     (async () => {
//   try {
//     // Array of polygon IDs (example)
//     const polygonIds = ids

//     // Convert the array to JSON string
//     const jsonData = JSON.stringify(polygonIds, null, 2); // Pretty-print with 2 spaces

//     // Write JSON to file
//     await fs.writeFile('polygonIds.json', jsonData, 'utf8');

//     console.log('polygonIds.json has been written successfully!');
//   } catch (error) {
//     console.error('Error writing JSON file:', error);
//   }
// })();
    
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
exports.getKeysForFront = asyncErrorHandler(async (req, res, next)=>{
    const api = new API(req, res);
    const pipline =[
        {
            $lookup: {
                from: 'heritagebuildingassessments', // MongoDB collection name
                localField: 'id',
                foreignField: 'polygonId',
                as: 'heritage'
            }
        },
        {
            $addFields: {
                function: {
                    $cond: [
                        { $gt: [{ $size: '$heritage' }, 0] },
                        { $arrayElemAt: ['$heritage.function', 0] },
                        'unknown'
                    ]
                }
            }
        },
        {
            $project: {
                heritage: 0 // remove the temporary lookup array
            }
        }
    ]
     api.modify(evaluateBuilding.aggregate(pipline)).paginate()
    const data = await api.query
     const dt = JSON.parse(JSON.stringify(data))
     console.log(dt);
     
    const refactoredData = dt.map((item,index) =>{

          const indexItem = geoJson.indexOf(item.id)
          if(indexItem === -1){
            console.log('wrong value');
            console.log(item.id);
            return item
          }else {
            return {
              ...item,
              index:indexItem
            }
          }
    })
    api.dataHandler('fetch',refactoredData)
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
    {
    $match: {
      'evaluationData.key': { 
        '$regex': req.query.buildingStatus, 
        '$options': 'i' 
      },
      "reviewerData.userName":{
        '$regex': req.query.reviewer, 
        '$options': 'i' 
      },
      "function":{
        '$regex': req.query.function, 
        '$options': 'i' 
      },
       "neighborhood":{
        '$regex': req.query.areaName, 
        '$options': 'i' 
      },
      "constructionType":{
        '$regex': req.query.constructionType, 
        '$options': 'i' 
      },
    }
  },
    {
      $project: {
        _id: 0,
        areaName: '$neighborhood', // or governorate/district based on your requirement
        reviewer: '$reviewerData.userName',
        buildingStatus: '$evaluationData.key',
        createdAt:1,
        constructionType:1,
        polygonId:1,
        function:1
      }
    },
    
  ];
  const api = new API(req,res)
  api.modify(HeritageBuildingAssessment.aggregate(pipeline) ).paginate()
  const result = await api.query
  const totalElements = await HeritageBuildingAssessment.countDocuments()
  api.dataHandler('fetch',formatDates(result),{},{
    total:totalElements,
    totalPages:Math.ceil(totalElements/(req.query.limit || 10)),
    page:req.query.page || 1

  })
})
exports.getAll = asyncErrorHandler(async(req,res,next)=>{

  const api = new API(req,res)
  api.modify(HeritageBuildingAssessment ).filter().sort().paginate()
  const result = await api.query
  api.dataHandler('fetch',result)
})
exports.getAllEngineersStatics = asyncErrorHandler(async(req,res,next)=>{
  const api = new API(req,res)
   const pipeline = [
    // Lookup all heritage building assessments for each user (editBy field)
    {
      $lookup: {
        from: 'heritagebuildingassessments', // check actual collection name
        localField: '_id',
        foreignField: 'editBy',
        as: 'reviews'
      }
    },
    // Add numberOfReviews as the size of the reviews array
    {
      $addFields: {
        numberOfReviews: { $size: '$reviews' }
      }
    },
    // Project only the required fields
    {
      $project: {
        _id: 0,
        userName: 1,
        email: 1,
        role: 1,
        numberOfReviews: 1
      }
    }
  ];
  api.modify(User.aggregate(pipeline) ).filter(['userName']).sort().paginate()
  const result = await api.query
  const totalElements = await User.countDocuments()
  console.log(totalElements);
  
  api.dataHandler('fetch',formatDates(result),{},{
    total:totalElements,
    totalPages:Math.ceil(totalElements/(req.query.limit || 10)),
    page:req.query.page || 1

  })
})

