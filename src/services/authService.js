const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ sub: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  });
  const refreshToken = jwt.sign({ sub: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });
  return { accessToken, refreshToken };
};

const login = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    const error = new Error('Credenciais inválidas');
    error.status = 401;
    throw error;
  }
  const tokens = generateTokens(user._id.toString());
  return { user, ...tokens };
};

const refreshToken = async (token) => {
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch {
    const error = new Error('Refresh token inválido ou expirado');
    error.status = 401;
    throw error;
  }
  const user = await User.findById(decoded.sub);
  if (!user) {
    const error = new Error('Usuário não encontrado');
    error.status = 401;
    throw error;
  }
  return generateTokens(user._id.toString());
};

module.exports = { login, refreshToken };
