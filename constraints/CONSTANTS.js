 const REPORT_STATES = {
    NOT_READ: 1,
    IN_PROGRESS: 2,
    FIXED: 3,
  };
const GET_VERIFIED_EMAIL_MASSEGE = (code)=>{
   return `the code for verfication is \n ${code}`
}
 const SET_VERIFIED_EMAIL_MASSEGE =()=>{
  return `you are verified now `
}
const GET_RESET_PASSWORD_URL = (url)=>{
  return `this is reset password url ${url}
  its valid for 15 min`
}
const SUPPORT_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Template</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f6f6f6;">
    <!-- Main Container -->
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <!-- Header -->
        <tr>
            <td style="padding: 20px 0; text-align: center; background-color: #2c3e50; border-radius: 8px 8px 0 0;">
                <h1 style="margin: 0; color: #ffffff; font-size: 24px;">I.Solution Dashboard</h1>
            </td>
        </tr>
        
        <!-- Content Card -->
        <tr>
            <td style="padding: 30px; background-color: #ffffff; border-radius: 0 0 8px 8px;">
                <h2 style="margin-top: 0; color: #2c3e50;">{{subject}}</h2>
                <h3 style="margin-top: 0; color: #2c3e50;">{{type}}</h3>
                
                <div style="color: #666666; font-size: 16px; line-height: 1.6;">
                    {{message}}
                </div>
            </td>
        </tr>
        
        <!-- Footer -->
        <tr>
            <td style="padding: 20px 0; text-align: center; color: #666666; font-size: 12px;">
                <p style="margin: 0;">
                    This email was sent by UN PROJECT to user {{from}}<br>
                    
                </p>
                <p style="margin: 10px 0 0;">
                    © ${new Date().getFullYear()} UN PROJECT. All rights reserved.
                </p>
            </td>
        </tr>
    </table>
</body>
</html>
`
const RESET_PASSWORD_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Template</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f6f6f6;">
    <!-- Main Container -->
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <!-- Header -->
        <tr>
            <td style="padding: 20px 0; text-align: center; background-color:rgb(188, 27, 27); border-radius: 8px 8px 0 0;">
                <h1 style="margin: 0; color: #ffffff; font-size: 24px;">UN PROJECT Dashboard</h1>
            </td>
        </tr>
        
        <!-- Content Card -->
        <tr>
            <td style="padding: 30px; background-color: #ffffff; border-radius: 0 0 8px 8px;">
                <h2 style="margin-top: 0; color: #2c3e50;">{{subject}}</h2>
                <h3 style="margin-top: 0; color: #2c3e50;">{{type}}</h3>
                
                <div style="color: #666666; font-size: 16px; line-height: 1.6;">
                   <p>if you don't trying to change the password ignore this massege and please contact with us</p>
                    {{message}}
                </div>
            </td>
        </tr>
        
        <!-- Footer -->
        <tr>
            <td style="padding: 20px 0; text-align: center; color: #666666; font-size: 12px;">
                <p style="margin: 0;">
                    This email was sent by UN PROJECT to user {{from}}<br>
                    
                </p>
                <p style="margin: 10px 0 0;">
                    © ${new Date().getFullYear()} UN PROJECT. All rights reserved.
                </p>
            </td>
        </tr>
    </table>
</body>
</html>
`
const MapBuildingSituationEnum = {
  nearCollapse: { key: 'nearCollapse' },
  riskyCondition: { key: 'riskyCondition' },
  moderateCondition: { key: 'moderateCondition' },
  minor: { key: 'minor' },
};
module.exports = {
  REPORT_STATES,
  GET_VERIFIED_EMAIL_MASSEGE,
  SET_VERIFIED_EMAIL_MASSEGE,
  GET_RESET_PASSWORD_URL,
  SUPPORT_EMAIL_TEMPLATE,
  RESET_PASSWORD_TEMPLATE,
  MapBuildingSituationEnum
}