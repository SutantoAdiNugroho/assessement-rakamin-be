module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define(
    'answers',
    {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      content: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    },
    { timestamps: true }
  );

  return User;
};
