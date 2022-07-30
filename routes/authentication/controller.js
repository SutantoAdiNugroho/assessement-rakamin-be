const db = require('../../models');
const {
  comparedPassword,
  errorResponse,
  errorParams,
  successResponse,
  hashPassword,
  generateToken,
} = require('../../helpers');
const status = require('http-status');
const { validationResult } = require('express-validator');

let result = {};

module.exports = {
  register: async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return errorParams(req, res, errors.array());

      const user = await db.users.findAll({ where: { email: req.body.email } });
      if (user.length) {
        result.status = status.BAD_REQUEST;
        result.message = `User with email ${req.body.email} already used`;
        return errorResponse(req, res, result);
      }

      const hasPassword = await hashPassword(req.body.password);
      const genToken = await generateToken(req.body);

      // continue registration process
      const userRegistration = await db.users.create({
        ...req.body,
        password: hasPassword,
        token: genToken,
      });
      const { full_name, email } = userRegistration;

      result = {
        data: { full_name, email },
        message: 'User successfully created',
      };

      return successResponse(req, res, status.CREATED, result);
    } catch (error) {
      next(error);
    }
  },
  login: async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return errorParams(req, res, errors.array());

      const currentUser = await db.users.findOne({
        where: { email: req.body.email },
      });

      if (!currentUser) {
        result.status = status.BAD_REQUEST;
        result.message = `User with email ${req.body.email} not found`;
        return errorResponse(req, res, result);
      }

      const comparePass = await comparedPassword(
        req.body.password,
        currentUser.password
      );

      if (!comparePass) {
        result.status = status.UNAUTHORIZED;
        result.message = 'The password that entered was incorrect';
        return errorResponse(req, res, result);
      }

      //Successfully validation
      let { full_name, token } = currentUser;

      result = {
        status: status.OK,
        message: 'Login succesfully',
        data: { full_name, token },
      };

      return successResponse(req, res, status.OK, result);
    } catch (error) {
      next(error);
    }
  },
};
