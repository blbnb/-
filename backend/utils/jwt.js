const jwt = require('jsonwebtoken');
require('dotenv').config();

// 生成JWT令牌
const generateToken = (userId, level, expiresIn = process.env.JWT_EXPIRES_IN) => {
  return jwt.sign(
    { id: userId, level: level },
    process.env.JWT_SECRET,
    { expiresIn: expiresIn }
  );
};

// 验证JWT令牌
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// 从令牌中提取用户ID
const getUserIdFromToken = (token) => {
  const decoded = verifyToken(token);
  return decoded ? decoded.id : null;
};

module.exports = {
  generateToken,
  verifyToken,
  getUserIdFromToken
};