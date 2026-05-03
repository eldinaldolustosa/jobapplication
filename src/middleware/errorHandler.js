module.exports = (err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'Erro interno do servidor';

  if (process.env.NODE_ENV !== 'production') {
    console.error(`[${new Date().toISOString()}] ${status} - ${message}`);
    if (status === 500) console.error(err.stack);
  }

  const response = { message };
  if (err.errors) response.errors = err.errors;

  res.status(status).json(response);
};
