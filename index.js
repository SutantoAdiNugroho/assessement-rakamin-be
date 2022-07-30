const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./models');
const { errorNotFoundHandle, errorInternalHandle } = require('./helpers');
const { PORT } = require('./config');

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

db.sequelize
  .sync({ force: true })
  .then(() => {
    console.log('DB has successfully connected');
  })
  .catch((err) => {
    console.log('failed to connect DB with messages: ', err);
  });

// list of routes
app.use('/', require('./routes'));
app.use('/api/auth', require('./routes/authentication'));

// Not found handle
app.get('*', function (req, res) {
  return errorNotFoundHandle(req, res);
});

// Error internal handle
app.use((error, req, res, next) => {
  console.log('Error Handling Middleware called');
  console.log('Path: ', req.path);

  return errorInternalHandle(req, res, error);
});

module.exports = app.listen(PORT, () => {
  console.log(`This app running on port ${PORT}`);
});
