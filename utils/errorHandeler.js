// Create a reusable function to handle errors

 const handleError = (res, statusCode, message) => {
    res.status(statusCode).json({ error: message });
  };
module.exports = handleError
  