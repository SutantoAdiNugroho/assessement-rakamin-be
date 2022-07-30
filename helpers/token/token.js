const { JWT_SECRET_KEY } = require('../../config');
const Jwt = require('jsonwebtoken');

const generateToken = async (user, id) => {
  const { fullName, email } = user;
  const token = Jwt.sign({ fullName, email, id }, JWT_SECRET_KEY);

  return token;
};

module.exports = { generateToken };
