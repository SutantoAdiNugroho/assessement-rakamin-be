const db = require('../../models');
const { errorResponse, successResponse } = require('../../helpers');
const status = require('http-status');

let result = {};

module.exports = {
  newChat: async (req, res, next) => {
    try {
      // run validation before create conversation
      const currentChat = await db.questions.findAll({
        where: { fromUserId: req.userId, toUserId: req.body.receiverId },
      });

      const receiverChat = await db.users.findByPk(req.body.receiverId);

      if (currentChat.length) {
        result.status = status.BAD_REQUEST;
        result.message = 'Chat has been created before';
        return errorResponse(req, res, result);
      }

      if (!receiverChat) {
        result.status = status.BAD_REQUEST;
        result.message = 'Receiver chat is not found';
        return errorResponse(req, res, result);
      }

      // create base conversation
      const questionCreate = await db.questions.create({
        fromUserId: req.userId,
        toUserId: req.body.receiverId,
      });
      const answerCreate = await db.answers.create({
        content: req.body.content,
        userId: req.userId,
        questionId: questionCreate.id,
      });

      result = {
        message: 'Question successfully created',
        data: {
          id: questionCreate.id,
          createdAt: questionCreate.createdAt,
          answers: [answerCreate],
        },
      };

      return successResponse(req, res, status.CREATED, result);
    } catch (error) {
      next(error);
    }
  },
  replyChat: async (req, res, next) => {
    try {
      // run validation before create conversation
      const currentChat = await db.questions.findByPk(req.body.questionId);

      if (!currentChat) {
        result.status = status.BAD_REQUEST;
        result.message = 'Chat not found';
        return errorResponse(req, res, result);
      }

      if (
        currentChat.fromUserId != req.userId &&
        currentChat.toUserId != req.userId
      ) {
        result.status = status.UNAUTHORIZED;
        result.message = `You can't reply to this conversation`;
        return errorResponse(req, res, result);
      }

      // create reply chat
      const answerCreate = await db.answers.create({
        content: req.body.content,
        userId: req.userId,
        questionId: currentChat.id,
      });

      currentChat.changed('updatedAt', true);
      await currentChat.update({
        updatedAt: new Date(),
      });

      result = {
        message: 'Reply successfully created',
        data: {
          id: answerCreate.id,
          content: answerCreate.content,
          createdAt: answerCreate.createdAt,
        },
      };

      return successResponse(req, res, status.CREATED, result);
    } catch (error) {
      next(error);
    }
  },
  getAllMyChat: async (req, res, next) => {
    try {
      let chats = [];

      await db.questions
        .findAll({
          where: {
            [db.Sequelize.Op.or]: [
              { fromUserId: req.userId },
              { toUserId: req.userId },
            ],
          },
          include: [
            {
              model: db.users,
              as: 'sender',
              attributes: ['id', 'fullName'],
            },
            {
              model: db.users,
              as: 'receiver',
              attributes: ['id', 'fullName'],
            },
            {
              model: db.answers,
              as: 'answers',
              attributes: { exclude: ['questionId', 'userId', 'updatedAt'] },
              include: [
                {
                  model: db.users,
                  as: 'user',
                  attributes: ['id', 'fullName'],
                },
              ],
            },
          ],
          attributes: {
            exclude: ['createdAt', 'unreadCount', 'fromUserId', 'toUserId'],
          },
          order: [[{ model: db.answers, as: 'answers' }, 'updatedAt', 'DESC']],
        })
        .then((result) => {
          result.forEach((chat) => {
            chats.push({
              id: chat.id,
              partnerChat:
                req.userId == chat.sender.id ? chat.receiver : chat.sender,
              lastAnswer: chat.answers[0],
              updatedAt: chat.updatedAt,
            });
          });

          return result;
        })
        .catch((error) => {
          throw error;
        });

      if (!chats.length) {
        result.message = `You don't have any chat`;
      } else {
        result.message = `Successfully get all my chat`;
      }

      result.data = chats;

      return successResponse(req, res, status.OK, result);
    } catch (error) {
      next(error);
    }
  },
  getChatDetail: async (req, res, next) => {
    try {
      const currentChat = await db.questions.findByPk(req.params.questionId, {
        include: [
          {
            model: db.answers,
            as: 'answers',
            attributes: { exclude: ['questionId'] },
          },
        ],
        order: [[{ model: db.answers, as: 'answers' }, 'updatedAt', 'ASC']],
      });

      if (!currentChat) {
        result.status = status.BAD_REQUEST;
        result.message = 'Chat not found';
        return errorResponse(req, res, result);
      }

      if (
        currentChat.fromUserId != req.userId &&
        currentChat.toUserId != req.userId
      ) {
        result.status = status.UNAUTHORIZED;
        result.message = `You can't see this conversation`;
        return errorResponse(req, res, result);
      }

      // return all chat answers
      result = {
        message: 'Successfully get chat detail',
        data: { answers: currentChat.answers },
      };

      return successResponse(req, res, status.OK, result);
    } catch (error) {
      next(error);
    }
  },
};
