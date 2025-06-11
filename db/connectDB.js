const { default: mongoose } = require("mongoose");
 const connectDB =  (local = false) => {
  try {
     mongoose.connect(local?process.env.MONGO_URL_LC :process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }).then(()=>{
      console.log('Connected to MongoDB');
    })

  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
  }
}

  
module.exports ={ connectDB}
  