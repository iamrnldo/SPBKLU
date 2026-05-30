require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./config/db');

// Set port
const PORT = process.env.PORT || 5000;

// Connect to Database and start server
const startServer = async () => {
  try {
    // Attempt database connection
    await connectDB();
    
    // Start listening
    app.listen(PORT, () => {
      console.log(`=========================================`);
      console.log(`  SPBKLU Backend Server Running!`);
      console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`  Port: ${PORT}`);
      console.log(`  URL: http://localhost:${PORT}`);
      console.log(`=========================================`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
