const User = require('../models/User');

const register = async ({ name, email, password }) => {
  const existing = await User.findOne({ email });
  if (existing) {
    const error = new Error('E-mail já cadastrado');
    error.status = 409;
    throw error;
  }
  const user = await User.create({ name, email, password });
  return user;
};

const findById = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('Usuário não encontrado');
    error.status = 404;
    throw error;
  }
  return user;
};

module.exports = { register, findById };
