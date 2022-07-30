module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define(
    'users',
    {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      full_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    },
    { timestamps: true }
  );

  return User;
};
