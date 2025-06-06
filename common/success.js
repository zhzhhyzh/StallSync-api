const passport = require('passport');

module.exports = function returnSuccess(status,data,res){
      const success = {};
      success.result = 'success';
      success.message = data;
      return res.status(status).json(success); // send the error response to client
};
