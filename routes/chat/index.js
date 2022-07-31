const router = require('express').Router();
const controller = require('./controller');
const middleware = require('../../middleware');
const { buildCheckFunction } = require('express-validator');

const checkBody = buildCheckFunction(['body']);

router.get('/all', middleware.authenticate, controller.getAllMyChat);
router.post(
  '/new',
  [
    checkBody('receiverId')
      .isString()
      .withMessage('receiverId must be filled and type is string!'),
    checkBody('content')
      .isString()
      .withMessage('content must be filled and type is string!'),
  ],
  middleware.authenticate,
  controller.newChat
);
router.post(
  '/reply',
  [
    checkBody('chatId')
      .isString()
      .withMessage('chatId must be filled and type is string!'),
    checkBody('content')
      .isString()
      .withMessage('content must be filled and type is string!'),
  ],
  middleware.authenticate,
  controller.replyChat
);
router.get(
  '/:chatId/detail',
  middleware.authenticate,
  controller.getChatDetail
);
router.post(
  '/chat_session',
  [
    checkBody('receiverId')
      .isString()
      .withMessage('receiverId must be filled and type is string!'),
  ],
  middleware.authenticate,
  controller.checkChatSession
);

module.exports = router;
