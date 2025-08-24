const signToken = require('./signToken')
const verifyToken = require('./verifyToken')
const hashPassword = require('./hashPassword')
const comparePasswords = require('./comparePasswords')
const generateResetToken = require('./generateResetToken')
const cloudinaryDelete = require('./cloudinaryDelete')
const cloudinaryUpload = require('./cloudinaryUpload')
const sendToEmail = require('./sendToEmail')
const { MapBuildingSituationEnum } = require('../constraints/CONSTANTS')
function evaluateBuildingCondition(rating) {
  // Convert levels to numeric values
  const damageLevels = {
    none: 0,
    minor: 1,
    moderate: 2,
    severe: 3,
  };

  const damagePercentages = {
    none: 0,
    oneToTen: 1,
    tenToThirty: 2,
    thirtyToSixty: 3,
    sixtyToNinety: 4,
    ninetyToHundred: 5,
  };

  const hazardLevels = {
    low: 0,
    medium: 1,
    high: 2,
  };

  // Weighted score for critical damage
  const criticalDamage = 
    (damageLevels[rating.structuralDamage] * 2) +
    (damageLevels[rating.foundationDamage] * 2) +
    (damageLevels[rating.cracksPattern] * 1.5) +
    (damageLevels[rating.parapetHazard] * 1.5);

  // Score for other damage
  const otherDamage = 
    damageLevels[rating.roofDamage] + 
    damageLevels[rating.windowsDoorsDamage];

  const avgDamage = (criticalDamage + otherDamage) / 7;

  // Damage percentage score
  const damagePercentage = damagePercentages[rating.estimatedDamage];

  // Hazard evaluation (weighted)
  const totalHazard = 
    (hazardLevels[rating.totalCollapse] * 2) +
    hazardLevels[rating.partialCollapse] +
    hazardLevels[rating.lostElements] +
    hazardLevels[rating.looting];

  const avgHazard = totalHazard / 5;

  // Final condition evaluation
  if (damagePercentage >= 4 || avgHazard >= 1.5 || avgDamage >= 2.5) {
    return MapBuildingSituationEnum.nearCollapse.key;
  } else if (damagePercentage >= 3 || avgDamage >= 2 || avgHazard >= 1) {
    return MapBuildingSituationEnum.riskyCondition.key;
  } else if (damagePercentage >= 2 || avgDamage >= 1.5) {
    return MapBuildingSituationEnum.moderateCondition.key;
  } else if (damagePercentage >= 1 || avgDamage >= 1) {
    return MapBuildingSituationEnum.minor.key;
  } else {
    return MapBuildingSituationEnum.minor.key;
  }
}

module.exports = {
   signToken,
   verifyToken,
   hashPassword,
   comparePasswords,
   generateResetToken,
   cloudinaryDelete,
   cloudinaryUpload,
   sendToEmail,
   evaluateBuildingCondition
   
}