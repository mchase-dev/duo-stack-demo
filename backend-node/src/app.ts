import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import path from 'path';
import YAML from 'yamljs';
import swaggerUi from 'swagger-ui-express';

// Import routes and middleware
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * Create and configure Express application
 * This does not start the server or initialize the database
 */
export function createApp() {
  const app = express();

  // Security middleware
  app.use(helmet());

  // CORS configuration
  const corsOptions = {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3001'],
    credentials: true, // Allow cookies
    optionsSuccessStatus: 200,
  };
  app.use(cors(corsOptions));

  // Body parsing middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Cookie parser
  app.use(cookieParser());

  // Logging middleware
  if (NODE_ENV === 'development') {
    app.use(morgan('dev'));
  } else {
    app.use(morgan('combined'));
  }

  // Rate limiting for auth endpoints
  const authLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    message: { success: false, error: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use('/api/v1/auth', authLimiter);

  // Serve uploaded files
  const uploadDir = process.env.UPLOAD_DIR || './uploads';
  app.use('/uploads', express.static(uploadDir));

  // API Documentation (Swagger)
  try {
    const swaggerDocument = YAML.load(path.join(__dirname, '../../openapi.yaml'));
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  } catch (error) {
    console.warn('⚠️  Could not load OpenAPI spec for Swagger UI');
  }

  // Health check endpoint
  app.get('/health', (_req, res) => {
    res.json({
      success: true,
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: NODE_ENV,
      },
    });
  });

  // Mount API routes
  app.use('/api/v1', routes);

  // 404 handler
  app.use(notFoundHandler);

  // Error handler (must be last)
  app.use(errorHandler);

  return app;
}

export default createApp();
