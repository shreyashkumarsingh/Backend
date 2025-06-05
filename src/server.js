const app = require('./app');
const db = require('./models'); // ✅ Import models (loads and sets up associations)
const config = require('./config/environment');

const connectDB = async () => {
  try {
    await db.sequelize.authenticate();
    console.log('✅ Database connected successfully');
    console.log(`DB_FORCE_SYNC: ${process.env.DB_FORCE_SYNC}`);

    // Sync models
    await db.sequelize.sync({
      force: config.NODE_ENV === 'development' && process.env.DB_FORCE_SYNC === 'true',
      alter: config.NODE_ENV === 'development' && process.env.DB_ALTER_SYNC === 'true'
    });
    console.log('✅ Database synchronized');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

const startServer = async () => {
  await connectDB();

  const server = app.listen(config.PORT, () => {
    console.log(`🚀 Server running on port ${config.PORT}`);
    console.log(`🌐 Environment: ${config.NODE_ENV}`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received, shutting down gracefully');
    server.close(async () => {
      await db.sequelize.close();
      process.exit(0);
    });
  });
};

startServer().catch(console.error);
