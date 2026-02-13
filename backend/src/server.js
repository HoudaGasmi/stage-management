require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/database');

const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT} [${process.env.NODE_ENV}]`);
    console.log(`📚 API Docs: http://localhost:${PORT}/api-docs`);
  });
}).catch(err => {
  console.error('❌ Failed to connect to MongoDB:', err.message);
  process.exit(1);
});

module.exports = app;
