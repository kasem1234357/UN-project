const mongoose = require('mongoose');

const heritageBuildingAssessmentSchema = new mongoose.Schema({
  // Section 1: General Information
  inspectionDate: { type: Date, required: true },
  exteriorOnly: { type: Boolean, default: false },
  exteriorAndInterior: { type: Boolean, default: false },
  buildingId: { type: String },
  polygonId:{type:String},
  surveyMadeBy: {
      type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
   },
  affiliation: { type: String },
  neighborhood: { type: String },
  district: { type: String },
  governorate: { type: String },
  attachmentsCount: { type: Number },

  // Section 2: Property Description
  buildingName: { type: String },
  ownerName: { type: String },
  numberOfFloors: { type: Number, required: true },
  function: {
    type: String,
    enum: [
      'residence', 'commerce', 'handicraft', 'culture', 'tourism',
      'religion', 'service', 'health', 'store', 'administration', 'unknown'
    ],
    default: 'unknown'
  },
  occupied: { type: Boolean, required: true },
  repairsBegun: { type: Boolean, required: true },
  descriptionNotes: { type: String },

  // Section 3: Building Characteristics
  constructionType: {
    type: String,
    enum: ['coralStone', 'mudBricks', 'burnedBricks', 'woods', 'mud', 'stone', 'unknown'],
    default: 'unknown'
  },
  architecturalQuality: {
    type: String,
    enum: ['excellent', 'good', 'ordinary'],
    default: 'ordinary'
  },
  buildingCharacteristicsNotes: { type: String },

  // Section 4: Evaluation of the Building
  structuralDamage: {
    type: String,
    enum: ['none', 'minor', 'moderate', 'severe'],
    default: 'none'
  },
  foundationDamage: {
    type: String,
    enum: ['none', 'minor', 'moderate', 'severe'],
    default: 'none'
  },
  roofDamage: {
    type: String,
    enum: ['none', 'minor', 'moderate', 'severe'],
    default: 'none'
  },
  cracksPattern: {
    type: String,
    enum: ['none', 'minor', 'moderate', 'severe'],
    default: 'none'
  },
  parapetHazard: {
    type: String,
    enum: ['none', 'minor', 'moderate', 'severe'],
    default: 'none'
  },
  windowsDoorsDamage: {
    type: String,
    enum: ['none', 'minor', 'moderate', 'severe'],
    default: 'none'
  },
  estimatedDamage: {
    type: String,
    enum: [
      'none', 'oneToTen', 'tenToThirty', 'thirtyToSixty',
      'sixtyToNinety', 'ninetyToHundred'
    ],
    default: 'none'
  },
  evaluationNotes: { type: String },

  // Section 5: Potential Hazards
  totalCollapse: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'low'
  },
  partialCollapse: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'low'
  },
  lostElements: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'low'
  },
  looting: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'low'
  },
  hazardNotes: { type: String },

  // Section 6: Urgent Intervention
  totalConsolidation: { type: Boolean, default: false },
  partialConsolidation: { type: Boolean, default: false },
  totalDemolition: { type: Boolean, default: false },
  partialDemolition: { type: Boolean, default: false },
  guard: { type: Boolean, default: false },
  interventionNotes: { type: String },
  "editBy":{
     type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('HeritageBuildingAssessment', heritageBuildingAssessmentSchema);
