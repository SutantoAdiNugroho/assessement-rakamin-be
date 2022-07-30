const hashPassword = require('./password/hash');
const comparedPassword = require('./password/compared');
const { generateToken } = require('./token/token');
const {
  errorResponse,
  errorParams,
  successResponse,
  errorInternalHandle,
  errorNotFoundHandle,
  errorMiddlewareHandle,
} = require('./response/response');

module.exports = {
  hashPassword,
  comparedPassword,
  generateToken,
  errorResponse,
  successResponse,
  errorParams,
  errorInternalHandle,
  errorNotFoundHandle,
  errorMiddlewareHandle,
};
