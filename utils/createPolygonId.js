const crypto = require('crypto');

/**
 * Generate a polygon ID from an array of points
 * @param {Array<{latitude: number, longitude: number}>} points
 * @returns {string} Polygon ID
 */
function generatePolygonIdFromPoints(points) {
  let buffer = '';

  for (const point of points) {
    console.log(point[1]);
    
    buffer += `${parseFloat(point[1]).toFixed(6)},${parseFloat(point[0]).toFixed(6)};`;
  }

  const hash = crypto.createHash('sha256').update(buffer, 'utf8').digest('hex');

  return `poly_${hash.substring(0, 10)}`;
}
module.exports = {
    generatePolygonIdFromPoints
}

