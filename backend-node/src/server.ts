import { config } from 'dotenv';
import { createServer } from 'http';

// Load environment variables
config();

// Import database configuration
import { sequelize, testConnection } from './config/database';
import { initModels } from './models';
import { createApp } from './app';
import { initializeSocketIO } from './config/socket';
import { RealtimeService } from './services/realtimeService';

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Initialize models with sequelize instance
initModels(sequelize);

// Create Express app
const app = createApp();

// Create HTTP server
const httpServer = createServer(app);

// Initialize Socket.IO
const io = initializeSocketIO(httpServer);

// Create RealtimeService instance
const realtimeService = new RealtimeService(io);

// Make io and realtimeService accessible in routes via app.locals
app.locals.io = io;
app.locals.realtimeService = realtimeService;

/**
 * Start server and connect to database
 */
async function startServer() {
  try {
    // Test database connection
    await testConnection();

    // Sync models (only in development)
    if (NODE_ENV === 'development') {
      await sequelize.sync({ alter: false });
      console.log('✅ Database models synchronized');
    }

    // Start HTTP server (with Socket.IO)
    httpServer.listen(PORT, () => {
      console.log('');
      console.log('🚀 ========================================');
      console.log(`   Server running on port ${PORT}`);
      console.log(`   Environment: ${NODE_ENV}`);
      console.log(`   API: http://localhost:${PORT}/api/v1`);
      console.log(`   API Docs: http://localhost:${PORT}/api-docs`);
      console.log(`   Health: http://localhost:${PORT}/health`);
      console.log(`   Socket.IO: ws://localhost:${PORT}`);
      console.log('========================================== 🚀');
      console.log('');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // In production, you might want to exit the process
  if (NODE_ENV === 'production') {
    process.exit(1);
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Closing server gracefully...');
  await sequelize.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\nSIGINT received. Closing server gracefully...');
  await sequelize.close();
  process.exit(0);
});

// Start the server
startServer();

export default app;
