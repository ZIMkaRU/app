'use strict';

const success = function(statusCode, responseModel, res) {
  res.status(statusCode);
  res.json(responseModel);

  return res;
};

const failure = function(statusCode, errorMessage, res) {
  res.status(statusCode);
  res.json({
    message: errorMessage
  });

  return res;
};

const failureAccessDenied = function(res) {
  const statusCode = 403;
  const errorMessage = 'Access Denied';

  return failure(statusCode, errorMessage, res);
};

const failureUnauthorized = function(res) {
  const statusCode = 401;
  const errorMessage = 'Unauthorized';

  return failure(statusCode, errorMessage, res);
};

const failureError = function(statusCode, err, res) {
  const response = {};

  if (err.message) {
    response.message = err.message;

    if (err.errors) {
      if (typeof err.errors === 'object') {
        const arrErrors = [];

        for (let errorKey in err.errors) {
          if (err.errors[errorKey].path) {
            err.errors[errorKey].path = err.errors[errorKey].path.split('.');
          }

          arrErrors.push(err.errors[errorKey]);
        }

        response.errors = arrErrors;
      } else response.errors = err.errors;
    }
  } else response.message = err;

  res.status(statusCode);
  res.json(response);

  return res;
};

module.exports = {
  success,
  failure,
  failureError,
  failureAccessDenied,
  failureUnauthorized,
};
