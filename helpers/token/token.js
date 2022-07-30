const { JWT_SECRET_KEY } = require('../../config');
const Jwt = require('jsonwebtoken');

const generateToken = async (user) => {
  const { full_name, email } = user;
  const token = Jwt.sign({ full_name, email }, JWT_SECRET_KEY);

  return token;
};

module.exports = { generateToken };
