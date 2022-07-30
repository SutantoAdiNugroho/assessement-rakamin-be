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
      fullName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      token: {
        type: Sequelize.STRING,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      address: {
        type: Sequelize.STRING,
      },
    },
    {
      hooks: {
        afterCreate: (record) => {
          delete record.dataValues.password;
        },
        afterUpdate: (record) => {
          delete record.dataValues.password;
        },
      },
    },
    { timestamps: true }
  );

  return User;
};
