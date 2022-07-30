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

module.exports = db;
