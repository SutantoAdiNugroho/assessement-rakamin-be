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
      const questionCreate = await db.questions
        .create({
          fromUserId: req.userId,
          toUserId: req.body.receiverId,
        })
        .then(async (result) => {
          await db.unreads.bulkCreate([
            { userId: result.fromUserId, questionId: result.id },
            { userId: result.toUserId, questionId: result.id, count: 1 },
          ]);
          return result;
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
      const currentChat = await db.questions.findByPk(req.body.chatId);

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
      const receiverUserId =
        currentChat.fromUserId == req.userId
          ? currentChat.toUserId
          : currentChat.fromUserId;
      const answerCreate = await db.answers
        .create({
          content: req.body.content,
          userId: req.userId,
          questionId: currentChat.id,
        })
        .then(async (result) => {
          await db.unreads.update(
            { count: 0 },
            { where: { userId: req.userId, questionId: currentChat.id } }
          );
          await db.unreads.increment('count', {
            by: 1,
            where: { userId: receiverUserId, questionId: currentChat.id },
          });

          return result;
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
              attributes: { exclude: ['questionId', 'userId', 'createdAt'] },
              include: [
                {
                  model: db.users,
                  as: 'user',
                  attributes: ['id', 'fullName'],
                },
              ],
            },
            {
              model: db.unreads,
              as: 'unreads',
              where: { userId: req.userId },
              attributes: ['count'],
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
              unreadCount: chat.unreads.length ? chat.unreads[0].count : 0,
              partnerChat:
                req.userId == chat.sender.id ? chat.receiver : chat.sender,
              lastAnswer: chat.answers[0],
              updatedAt: chat.updatedAt,
            });
          });
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
      const currentChat = await db.questions.findByPk(req.params.chatId, {
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

      await db.unreads.update(
        { count: 0 },
        { where: { questionId: currentChat.id, userId: req.userId } }
      );

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
  checkChatSession: async (req, res, next) => {
    try {
      let isChatAlreadyCreated = false;

      const receiverChat = await db.users.findByPk(req.body.receiverId);
      const currentChat = await db.questions.findOne({
        where: { fromUserId: req.userId, toUserId: req.body.receiverId },
      });

      if (!receiverChat) {
        result.status = status.BAD_REQUEST;
        result.message = 'Receiver chat is not found';
        return errorResponse(req, res, result);
      }

      if (currentChat) {
        await db.unreads.update(
          { count: 0 },
          { where: { questionId: currentChat.id, userId: req.userId } }
        );
        isChatAlreadyCreated = true;
      }

      result = {
        message: 'Successfully check chat session',
        data: { isChatAlreadyCreated },
      };

      return successResponse(req, res, status.OK, result);
    } catch (error) {
      next(error);
    }
  },
};
