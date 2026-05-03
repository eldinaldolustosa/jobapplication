require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/database');

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} [${process.env.NODE_ENV}]`);
    console.log(`Swagger docs: ${process.env.BASE_URL || `http://localhost:${PORT}`}/api-docs`);
  });
});
