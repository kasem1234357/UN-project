const nodemailer = require('nodemailer')
const handleError = require('./errorHandeler')
const dotenv = require("dotenv");
const { MSG_TYPE } = require('../constraints/CONSTANTS');
dotenv.config({path: '../config.env'});

/**
 * Description
 * @param {object} options
 * @returns {Promise}
 */

/*
 html: htmlTemplate.replace('{{subject}}', options.subject).replace('{{message}}', options.message).replace('{{type}}', MSG_TYPE[options.type]).replace('{{from}}',options.from),
 */
const sendToEmail= async(options)=>{
    const transporter = nodemailer.createTransport({
        // host: process.env.EMAIL_HOST,
        // port:process.env.EMAIL_PORT,
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_LOCAL,
          pass: process.env.EMAIL_LOCAL_PASSWORD,
        },
      });
      let isSuccess = true
      // Setup email data
      const mailOptions = {
        from: 'midnightX.app',
        to: options.email,
        subject: options.subject,
       
      };
      if(options.isTemplate){
        mailOptions.html = options.template
      }else {
        mailOptions.text = options.message
      }
      // Send the email
       await transporter.sendMail(mailOptions).then(res =>{
        isSuccess = true
      }).catch(err =>{
        isSuccess = false
      });
      return isSuccess
}  
module.exports = sendToEmail