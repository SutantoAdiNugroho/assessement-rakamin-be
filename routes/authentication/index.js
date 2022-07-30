const router = require('express').Router();
const controller = require('./controller');
const { buildCheckFunction } = require('express-validator');

const checkBody = buildCheckFunction(['body']);

router.post(
  '/user/login',
  [
    checkBody('email')
      .isString()
      .withMessage('email must be filled and type is string!'),
    checkBody('password')
      .isString()
      .withMessage('password must be filled and type is string!'),
  ],
  controller.login
);
router.post(
  '/user/register',
  [
    checkBody('fullName')
      .isString()
      .withMessage('fullName must be filled and type is string!'),
    checkBody('email')
      .isString()
      .withMessage('email must be filled and type is string!'),
    checkBody('password')
      .isString()
      .withMessage('password must be filled and type is string!'),
  ],
  controller.register
);

module.exports = router;
