const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv");
dotenv.config();
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUNDERY_API_KEY,
  api_secret: process.env.CLOUNDERY_API_SECRET,
});


const cloudinaryDelete = async (images)=>{
    return cloudinary.api.delete_resources(images,{ type: 'upload', resource_type: 'image' },function (error, result) {
      if (error) {
        console.error(error);
        throw Error("Error");
      } else {
        console.log(result);
        return result;
      }
    })
  }
  module.exports = cloudinaryDelete