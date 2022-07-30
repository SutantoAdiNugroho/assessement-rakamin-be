module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define(
    'questions',
    {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      unreadCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
    },
    { timestamps: true },
    {
      hooks: {
        afterCreate: (record) => {
          delete record.dataValues.questionId;
        },
      },
    }
  );

  return User;
};
