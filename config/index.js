const { PORT, JWT_SECRET_KEY, ENV } = require('./environment');
const dbConfig = require('./db.config');

module.exports = { PORT, JWT_SECRET_KEY, ENV, dbConfig };
