const status = require('http-status');

const errorMiddlewareHandle = (req, res, next, error) => {
  console.log('Middleware user called, with errors: ', error);

  let errorMsg = error.message,
    result = {};

  switch (String(errorMsg).toLowerCase()) {
    case 'jwt must be provided':
      result.status = status.UNAUTHORIZED;
      result.message =
        "User's token is mandatory, please insert the token correctly first";
      break;
    case 'invalid signature':
    case 'jwt malformed':
    case 'malformed utf-8 data':
      result.status = status.BAD_REQUEST;
      result.message = 'Token does not correct!';
      break;
    default:
      next(error);
  }

  return errorResponse(req, res, result);
};

const errorInternalHandle = (req, res, error) => {
  console.error('Error occured with message :', error);

  const result = {
    status: status.INTERNAL_SERVER_ERROR,
    message: error.message,
  };
  return errorResponse(req, res, result);
};

const errorNotFoundHandle = (req, res) => {
  const objError = {
    status: status.NOT_FOUND,
    message: 'Route not found',
  };

  return errorResponse(req, res, objError);
};

const errorResponse = (req, res, objError) => {
  res.status(objError.status).json({
    path: req.originalUrl,
    status: objError.status,
    message: objError.message,
  });
};

const errorParams = (req, res, requiredFields) => {
  res.status(status.BAD_REQUEST).json({
    path: req.originalUrl,
    status: status.BAD_REQUEST,
    message: 'Some parameters need to be correct filled!',
    missings: requiredFields,
  });
};

const successResponse = (req, res, statusCode, result) => {
  res
    .status(statusCode)
    .json({
      status: statusCode,
      message: result.message,
      data: result.data,
    })
    .end();
};

module.exports = {
  successResponse,
  errorResponse,
  errorParams,
  errorInternalHandle,
  errorNotFoundHandle,
  errorMiddlewareHandle,
};
