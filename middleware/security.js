const db = require('../models');
const { JWT_SECRET_KEY } = require('../config');
const {
  errorResponse,
  errorMiddlewareHandle,
  errorParams,
} = require('../helpers');
const jwt = require('jsonwebtoken');
const status = require('http-status');
const { validationResult } = require('express-validator');

let result = {};

module.exports = {
  authenticate: async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return errorParams(req, res, errors.array());

      const token = req.headers['authorization'];
      if (!token) {
        result.status = status.UNAUTHORIZED;
        result.message = 'Token is mandatory!';
        return errorResponse(req, res, result);
      }

      const tokenHashed = jwt.verify(token, JWT_SECRET_KEY);

      const findUserToken = await db.users.findOne({
        where: { token },
      });
      if (!findUserToken || findUserToken.token != token) {
        result.status = status.UNAUTHORIZED;
        result.message = 'Token is not match with any users';
        return errorResponse(req, res, result);
      }

      req.userId = tokenHashed.id;
      next();
    } catch (error) {
      errorMiddlewareHandle(req, res, next, error);
    }
  },
};
