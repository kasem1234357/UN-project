const { default: mongoose } = require("mongoose");
const dotenv = require('dotenv')
dotenv.config({path: './config.env'})
const connectDB = (isOnlineDB = true) => {
    // mongoose.set('strictQuery', false);

    mongoose.connect(
      isOnlineDB?process.env.MONGO_URL:process.env.MONGO_URL_LC,
      { useNewUrlParser: true },
      (error) => {
        if (error) {
          console.error('Failed to connect to MongoDB:', error);
        } else {
          console.log('Connected to MongoDB');
        }
      }
    );
  };
  
module.exports ={ connectDB}
  