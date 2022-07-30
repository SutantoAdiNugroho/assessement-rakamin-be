const { PORT, JWT_SECRET_KEY } = require('./environment');
const dbConfig = require('./db.config');

module.exports = { PORT, JWT_SECRET_KEY, dbConfig };
