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

      // continue registration process
      const hasPassword = await hashPassword(req.body.password);
      const userRegistration = await db.users.create({
        ...req.body,
        password: hasPassword,
      });

      const { fullName, email, id } = userRegistration;
      const genToken = await generateToken(req.body, id);

      await db.users.update({ token: genToken }, { where: { id } });

      result = {
        data: { fullName, email },
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
      let { fullName, token } = currentUser;

      result = {
        status: status.OK,
        message: 'Login succesfully',
        data: { fullName, token },
      };

      return successResponse(req, res, status.OK, result);
    } catch (error) {
      next(error);
    }
  },
};
