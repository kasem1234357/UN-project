const express = require('express');
const authController = require('./../controller/authController');
const { isAuth, restrict } = require('../meddlewares');
const { upsertRating, buildingRatingById, getKeys, getAllStatics, getAll, getAllEngineersStatics, getKeysForFront } = require('../controller/ratingController');


const router = express.Router();
router.post('/upsert',isAuth,upsertRating);
router.get('/keys',getKeys);
router.get('/keysForFront',getKeysForFront)
router.get('/statics',getAllStatics);
router.get('/engineers',getAllEngineersStatics)
router.get('/all',getAll)
router.get('/:polygonId',buildingRatingById);

module.exports = router;