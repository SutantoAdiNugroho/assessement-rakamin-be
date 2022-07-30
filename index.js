const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./models');
const { PORT } = require('./config');

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

db.sequelize
  .sync()
  .then(() => {
    console.log('DB has successfully connected');
  })
  .catch((err) => {
    console.log('failed to connect DB with messages: ', err);
  });

module.exports = app.listen(PORT, () => {
  console.log(`This app running on port ${PORT}`);
});
