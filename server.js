const dotenv = require('dotenv');
dotenv.config({path: './config.env'});

const { connectDB } = require('./db/connectDB');
// handle unknown variable error
process.on('uncaughtException', (err) => {
    console.log(err.name, err.message);
    console.log('Uncaught Exception occured! Shutting down...');
    process.exit(1);
 })

const app = require('./app');

connectDB(false)
const port = process.env.PORT || 8000;

const server = app.listen(port, () => {
    console.log('server has started...');
})
// handling connect to DB error
process.on('unhandledRejection', (err) => {
   console.log(err.name, err.message);
   console.log('Unhandled rejection occured! Shutting down...');

   server.close(() => {
    process.exit(1);
   })
})


