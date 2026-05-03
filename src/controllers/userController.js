const userService = require('../services/userService');

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const user = await userService.register({ name, email, password });
    res.status(201).json({ message: 'Usuário cadastrado com sucesso', user });
  } catch (err) {
    next(err);
  }
};

const me = async (req, res, next) => {
  try {
    const user = await userService.findById(req.userId);
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, me };
