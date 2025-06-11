const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv");
dotenv.config({path: '../config.env'});

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUNDERY_API_KEY,
  api_secret: process.env.CLOUNDERY_API_SECRET,
});

const cloudinaryUpload = async (file,galleryName,public_id=null) => {
    public_id && await cloudinaryDelete([`${galleryName}/${public_id}`])
    console.log(file);
    return cloudinary.uploader.upload(
      file,
      { timeout: 60000,
      quality_analysis:true,
    folder:galleryName },
      function (error, result) {
        if (error) {
          console.error(error);
          throw Error("Error");
        } else {
          console.log(result);
          return result;
        }
      }
    );
  };
  module.exports = cloudinaryUpload