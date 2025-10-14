import app from './app';
import { config } from './config/env.config';
import database from './config/database.config';
import { seedRoles } from './utils/seedRoles';

class Server {
  private port: number;

  constructor() {
    this.port = config.PORT;
  }

  public async start(): Promise<void> {
    try {
      // Connect to database
      await database.connect();

      // Seed default roles
      await seedRoles();

      // Start server
      app.listen(this.port, () => {
        console.log('=================================');
        console.log(`🚀 Server is running on port ${this.port}`);
        console.log(`📝 Environment: ${config.NODE_ENV}`);
        console.log(`🌐 API URL: http://localhost:${this.port}/api/v1`);
        console.log(`📚 API Docs: http://localhost:${this.port}/api-docs`);
        console.log('=================================');
      });
    } catch (error) {
      console.error('❌ Failed to start server:', error);
      process.exit(1);
    }
  }

  public stop(): void {
    console.log('Server shutting down...');
    process.exit(0);
  }
}

// Create server instance
const server = new Server();

// Start server
server.start();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.error('❌ UNHANDLED REJECTION! Shutting down...');
  console.error(err.name, err.message);
  server.stop();
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  console.error('❌ UNCAUGHT EXCEPTION! Shutting down...');
  console.error(err.name, err.message);
  server.stop();
});

export default server;
