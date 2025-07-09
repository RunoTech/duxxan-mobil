import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import helmet from 'helmet';
import cors from 'cors';
import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import DOMPurify from 'isomorphic-dompurify';
import { body, validationResult } from 'express-validator';

// CORS Configuration
export const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (like mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5000',
      'https://duxxan.replit.app',
      process.env.FRONTEND_URL
    ].filter(Boolean);
    
    // For development, allow localhost with any port
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    
    // Allow all Replit domain variations
    if (origin.includes('.replit.') || origin.includes('replit.dev') || origin.includes('replit.app')) {
      return callback(null, true);
    }
    
    // Allow any origin during development
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(null, false); // Don't throw error, just deny
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-CSRF-Token',
    'X-Device-ID'
  ]
};

// Rate Limiting
export const globalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks and static assets
    return req.path === '/health' || req.path.startsWith('/assets');
  }
});

export const strictRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    error: 'Too many requests, please slow down.',
    retryAfter: '15 minutes'
  }
});

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: {
    error: 'Too many authentication attempts, please try again later.',
    retryAfter: '15 minutes'
  }
});

export const createRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20,
  message: {
    error: 'Creation rate limit exceeded, please wait before creating more content.',
    retryAfter: '5 minutes'
  }
});

// Progressive slowdown - much more lenient to prevent server issues
export const progressiveSlowdown = slowDown({
  windowMs: 15 * 60 * 1000,
  delayAfter: 500, // Increased threshold
  delayMs: () => 100, // Fixed delay function
  maxDelayMs: 5000, // Reduced max delay
  validate: { delayMs: false } // Disable warning
});

// Security Headers
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      connectSrc: ["'self'", "wss:", "ws:"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"], // Allow opening in new tabs
      scriptSrcAttr: ["'none'"],
      upgradeInsecureRequests: []
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

// Security Middleware
export const securityMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Add security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN'); // Allow same-origin frames
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Remove server signature
  res.removeHeader('X-Powered-By');
  
  next();
};

// Request size limiting
export const requestSizeLimit = (req: Request, res: Response, next: NextFunction) => {
  const contentLength = parseInt(req.headers['content-length'] || '0');
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (contentLength > maxSize) {
    return res.status(413).json({
      error: 'Request too large',
      maxSize: '10MB'
    });
  }
  
  next();
};

// Pattern detection for common attacks
export const patternDetection = (req: Request, res: Response, next: NextFunction) => {
  const suspiciousPatterns = [
    /(\<script\>)|(\<\/script\>)/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /onload=/gi,
    /onerror=/gi,
    /(union.*select)|(select.*union)/gi,
    /(drop|delete|truncate|alter)\s+table/gi
  ];
  
  const checkContent = (content: string) => {
    return suspiciousPatterns.some(pattern => pattern.test(content));
  };
  
  // Check URL
  if (checkContent(req.url)) {
    console.warn(`Suspicious URL pattern detected: ${req.url} from IP: ${req.ip}`);
    return res.status(400).json({ error: 'Invalid request pattern' });
  }
  
  // Check query parameters
  for (const [key, value] of Object.entries(req.query)) {
    if (typeof value === 'string' && checkContent(value)) {
      console.warn(`Suspicious query parameter: ${key}=${value} from IP: ${req.ip}`);
      return res.status(400).json({ error: 'Invalid request pattern' });
    }
  }
  
  next();
};

// Security status endpoint
export const getSecurityStatus = (req: Request, res: Response) => {
  res.json({
    timestamp: new Date().toISOString(),
    security: {
      rateLimiting: 'active',
      cors: 'configured',
      headers: 'secure',
      patternDetection: 'active',
      requestSizeLimit: '10MB'
    },
    health: 'ok'
  });
};

// CSRF Protection
export const csrfMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    const token = req.headers['x-csrf-token'] as string;
    const sessionToken = req.session?.csrfToken;
    
    if (!token || !sessionToken || token !== sessionToken) {
      return res.status(403).json({ error: 'Invalid CSRF token' });
    }
  }
  next();
};

// Device fingerprinting
export const deviceFingerprintMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const userAgent = req.headers['user-agent'] || 'unknown';
  const acceptLanguage = req.headers['accept-language'] || 'unknown';
  const acceptEncoding = req.headers['accept-encoding'] || 'unknown';
  
  const fingerprint = crypto
    .createHash('sha256')
    .update(`${userAgent}-${acceptLanguage}-${acceptEncoding}-${req.ip}`)
    .digest('hex');
  
  (req as any).deviceFingerprint = fingerprint;
  next();
};

// Input sanitization
export const sanitizationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const sanitizeObject = (obj: any): any => {
    if (typeof obj === 'string') {
      return DOMPurify.sanitize(obj);
    }
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitizeObject(value);
      }
      return sanitized;
    }
    return obj;
  };
  
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  
  next();
};

// Validation middleware factory
export const validationMiddleware = (validations: any[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(validations.map(validation => validation.run(req)));
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }
    
    next();
  };
};

// Common validations
export const walletValidation = [
  body('walletAddress')
    .matches(/^0x[a-fA-F0-9]{40}$/)
    .withMessage('Invalid wallet address format')
];

export const amountValidation = [
  body('amount')
    .isNumeric()
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number')
];

export const textValidation = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters')
];

export const deviceInfoValidation = [
  body('deviceType')
    .isIn(['mobile', 'desktop', 'tablet'])
    .withMessage('Invalid device type'),
  body('deviceName')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Device name too long')
];

// Utility functions
export const generateDeviceFingerprint = (req: Request): string => {
  const userAgent = req.headers['user-agent'] || '';
  const acceptLanguage = req.headers['accept-language'] || '';
  const acceptEncoding = req.headers['accept-encoding'] || '';
  const ip = req.ip || '';
  
  return crypto
    .createHash('sha256')
    .update(`${userAgent}-${acceptLanguage}-${acceptEncoding}-${ip}`)
    .digest('hex');
};

export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  if (req.method === 'GET') {
    const token = crypto.randomBytes(32).toString('hex');
    if (req.session) {
      req.session.csrfToken = token;
    }
    res.locals.csrfToken = token;
  }
  next();
};