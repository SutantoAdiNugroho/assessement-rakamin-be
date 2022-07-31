const db = require('../../models');
const { successResponse } = require('../../helpers');
const status = require('http-status');

let result = {};

module.exports = {
  getAllUsers: async (req, res, next) => {
    try {
      let query = { id: { [db.Sequelize.Op.not]: req.userId } };

      if (req.query) {
        if (req.query.fullName)
          query.fullName = {
            [db.Sequelize.Op.iLike]: `%${req.query.fullName}%`,
          };
      }

      const users = await db.users.findAll({
        where: query,
        attributes: {
          exclude: ['token', 'password', 'updatedAt', 'createdAt'],
        },
        order: [['fullName', 'ASC']],
      });
      result = {
        message: users.length
          ? 'Successfully show all users'
          : 'No user available',
        data: users,
      };

      return successResponse(req, res, status.OK, result);
    } catch (error) {
      next(error);
    }
  },
};
