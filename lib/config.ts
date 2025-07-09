import { z } from 'zod';

// Environment configuration schema
const configSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),
  
  // JWT
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('24h'),
  
  // Server
  API_PORT: z.string().transform(Number).pipe(z.number().int().min(1).max(65535)).default('5000'),
  API_HOST: z.string().default('0.0.0.0'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Frontend
  FRONTEND_URL: z.string().url().optional(),
  
  // Security
  CORS_ORIGIN: z.string().transform(val => val.split(',')).optional(),
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).pipe(z.number().int()).default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).pipe(z.number().int()).default('100'),
  
  // Blockchain
  BSC_RPC_URL: z.string().url().optional(),
  CONTRACT_ADDRESS: z.string().regex(/^0x[a-fA-F0-9]{40}$/).optional(),
  PRIVATE_KEY: z.string().optional(),
  
  // Payment
  STRIPE_SECRET_KEY: z.string().optional(),
  
  // Email
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().transform(Number).pipe(z.number().int()).optional(),
  SMTP_USER: z.string().email().optional(),
  SMTP_PASSWORD: z.string().optional(),
  
  // Monitoring
  SENTRY_DSN: z.string().url().optional(),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  
  // File upload
  MAX_FILE_SIZE: z.string().transform(Number).pipe(z.number().int()).default('10485760'),
  UPLOAD_PATH: z.string().default('./uploads'),
});

// Validate and parse environment variables
function loadConfig() {
  try {
    const env = {
      ...process.env,
      // Provide default JWT_SECRET for development
      JWT_SECRET: process.env.JWT_SECRET || 'development-jwt-secret-key-at-least-32-characters-long-for-security'
    };
    return configSchema.parse(env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Environment configuration error:');
      error.errors.forEach(err => {
        console.error(`  ${err.path.join('.')}: ${err.message}`);
      });
      process.exit(1);
    }
    throw error;
  }
}

export const config = loadConfig();

// Type-safe config object
export type Config = z.infer<typeof configSchema>;

// Helper functions
export const isDevelopment = () => config.NODE_ENV === 'development';
export const isProduction = () => config.NODE_ENV === 'production';
export const isTest = () => config.NODE_ENV === 'test';

// Logging configuration
export const getLogLevel = () => {
  if (isProduction()) return 'warn';
  if (isTest()) return 'error';
  return config.LOG_LEVEL;
};

// CORS origins helper
export const getCorsOrigins = () => {
  if (config.CORS_ORIGIN) {
    return config.CORS_ORIGIN;
  }
  
  if (isDevelopment()) {
    return ['http://localhost:3000', 'http://localhost:5000'];
  }
  
  return [];
};