const express = require('express');
const authController = require('./../controller/authController');
const { isAuth, restrict } = require('../meddlewares');
const { upsertRating, buildingRatingById, getKeys } = require('../controller/ratingController');


const router = express.Router();
router.post('/upsert',isAuth,upsertRating);
router.get('/keys',getKeys);
router.get('/:polygonId',buildingRatingById);

module.exports = router;