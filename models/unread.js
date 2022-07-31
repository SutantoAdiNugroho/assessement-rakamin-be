module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define(
    'unreads',
    {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
    },
    { timestamps: true }
  );

  return User;
};
