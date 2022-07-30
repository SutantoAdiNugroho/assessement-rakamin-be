const { dbConfig } = require('../config');
const Sequelize = require('sequelize');
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  pool: { ...dbConfig.pool },
});

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// defining models
db.users = require('./user')(sequelize, Sequelize);
db.questions = require('./question')(sequelize, Sequelize);
db.answers = require('./answer')(sequelize, Sequelize);

// relation models
db.questions.hasMany(db.answers, { as: 'answers' });
db.answers.belongsTo(db.questions, {
  foreignKey: 'questionId',
  as: 'question',
});
db.answers.belongsTo(db.users, {
  foreignKey: 'userId',
  as: 'user',
});
db.questions.belongsTo(db.users, { foreignKey: 'toUserId', as: 'receiver' });
db.questions.belongsTo(db.users, { foreignKey: 'fromUserId', as: 'sender' });

module.exports = db;
