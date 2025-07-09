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
    if (process.env.NODE_ENV === 'development' && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
      return callback(null, true);
    }
    
    // Allow specific production domains only
    const productionDomains = [
      'duxxan.com',
      'www.duxxan.com',
      'app.duxxan.com',
      process.env.PRODUCTION_DOMAIN
    ].filter(Boolean);
    
    // Check if origin matches production domains
    const isProductionDomain = productionDomains.some(domain => 
      origin === `https://${domain}` || origin === `http://${domain}`
    );
    
    if (isProductionDomain) {
      return callback(null, true);
    }
    
    // Allow Replit domains only in development
    if (process.env.NODE_ENV === 'development' && (origin.includes('.replit.') || origin.includes('replit.dev'))) {
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

// CSRF Protection
class CSRFProtection {
  private tokens = new Map<string, { token: string; expires: number }>();
  private readonly TOKEN_EXPIRY = 60 * 60 * 1000; // 1 hour

  generateToken(sessionId: string): string {
    const token = crypto.randomBytes(32).toString('hex');
    this.tokens.set(sessionId, {
      token,
      expires: Date.now() + this.TOKEN_EXPIRY
    });
    return token;
  }

  validateToken(sessionId: string, token: string): boolean {
    const stored = this.tokens.get(sessionId);
    if (!stored || stored.expires < Date.now()) {
      this.tokens.delete(sessionId);
      return false;
    }
    return stored.token === token;
  }

  cleanup() {
    const now = Date.now();
    const entries = Array.from(this.tokens.entries());
    for (const [sessionId, data] of entries) {
      if (data.expires < now) {
        this.tokens.delete(sessionId);
      }
    }
  }
}

export const csrfProtection = new CSRFProtection();

// Cleanup expired CSRF tokens every hour
setInterval(() => csrfProtection.cleanup(), 60 * 60 * 1000);

// Device Fingerprinting System
export interface DeviceFingerprint {
  userAgent: string;
  acceptLanguage: string;
  acceptEncoding: string;
  timezone: string;
  screenResolution: string;
  colorDepth: string;
  hash: string;
}

export const generateDeviceFingerprint = (req: Request, clientData?: any): DeviceFingerprint => {
  const userAgent = req.get('User-Agent') || '';
  const acceptLanguage = req.get('Accept-Language') || '';
  const acceptEncoding = req.get('Accept-Encoding') || '';
  const timezone = clientData?.timezone || '';
  const screenResolution = clientData?.screenResolution || '';
  const colorDepth = clientData?.colorDepth || '';
  
  const fingerprint = `${userAgent}|${acceptLanguage}|${acceptEncoding}|${timezone}|${screenResolution}|${colorDepth}`;
  const hash = crypto.createHash('sha256').update(fingerprint).digest('hex');
  
  return {
    userAgent,
    acceptLanguage,
    acceptEncoding,
    timezone,
    screenResolution,
    colorDepth,
    hash
  };
};

// SQL Injection Prevention Patterns
const SQL_INJECTION_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
  /(\b(OR|AND)\s+\d+\s*=\s*\d+)/gi,
  /(--|\#|\/\*|\*\/)/g,
  /(\bxp_cmdshell\b|\bsp_\w+)/gi,
  /(\b(char|ascii|substring|len|right|left)\s*\()/gi,
  /([\'\"][\s]*;[\s]*--)/g,
  /([\'\"][\s]*\bor\b[\s]+[\'\"]?\w+[\'\"]?[\s]*=[\s]*[\'\"]?\w+)/gi
];

const XSS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /<iframe\b[^>]*>/gi,
  /<object\b[^>]*>/gi,
  /<embed\b[^>]*>/gi,
  /<link\b[^>]*>/gi,
  /<meta\b[^>]*>/gi
];

// Advanced Rate Limiting Configuration
export const createRateLimiter = (windowMs: number, max: number, message: string) => {
  return rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    skipSuccessfulRequests: false,
    skipFailedRequests: true,
    keyGenerator: (req: Request) => {
      const deviceId = req.get('X-Device-ID') || '';
      return req.ip + ':' + deviceId + ':' + (req.get('User-Agent') || 'unknown');
    }
  });
};

// Tiered Rate Limiting Strategy
export const globalRateLimit = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  1000, // 1000 requests per IP
  'Too many requests from this IP, please try again later.'
);

export const strictRateLimit = createRateLimiter(
  5 * 60 * 1000, // 5 minutes
  100, // 100 requests per IP - increased for normal usage
  'Rate limit exceeded. Please slow down your requests.'
);

export const authRateLimit = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  10, // 10 auth attempts per IP
  'Too many authentication attempts. Please try again later.'
);

export const createRateLimit = createRateLimiter(
  10 * 60 * 1000, // 10 minutes
  20, // 20 creation attempts per IP - more reasonable for normal usage
  'Too many creation attempts. Please wait before creating more content.'
);

// Progressive Slowdown Middleware
export const progressiveSlowdown = slowDown({
  windowMs: 5 * 60 * 1000, // 5 minutes
  delayAfter: 10, // Allow 10 requests per windowMs without delay
  delayMs: () => 500, // Add 500ms delay per request after delayAfter
  maxDelayMs: 10000, // Maximum delay of 10 seconds
  // Skip successful requests to allow normal usage
  skipSuccessfulRequests: false,
  skipFailedRequests: true,
  validate: { delayMs: false }, // Disable warning
});

// Security Headers with Helmet
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
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
});

// IP Blocking and Suspicious Activity Detection
class SecurityMonitor {
  private suspiciousIPs = new Map<string, {
    requests: number;
    lastActivity: number;
    blocked: boolean;
    violations: string[];
  }>();

  private readonly MAX_REQUESTS_PER_SECOND = 1000; // Disabled for development
  private readonly BLOCK_DURATION = 10 * 1000; // 10 seconds for development
  private readonly VIOLATION_THRESHOLD = 50; // Very tolerant for development

  trackRequest(ip: string, userAgent: string = 'unknown'): boolean {
    const now = Date.now();
    const key = `${ip}:${userAgent}`;
    
    if (!this.suspiciousIPs.has(key)) {
      this.suspiciousIPs.set(key, {
        requests: 1,
        lastActivity: now,
        blocked: false,
        violations: [],
      });
      return true;
    }

    const data = this.suspiciousIPs.get(key)!;
    
    // Check if IP is currently blocked
    if (data.blocked && (now - data.lastActivity) < this.BLOCK_DURATION) {
      return false;
    }

    // Reset block if block duration has passed
    if (data.blocked && (now - data.lastActivity) >= this.BLOCK_DURATION) {
      data.blocked = false;
      data.requests = 0;
      data.violations = [];
    }

    // Count requests in the last second
    if ((now - data.lastActivity) < 1000) {
      data.requests++;
    } else {
      data.requests = 1;
    }

    data.lastActivity = now;

    // Check for suspicious activity
    if (data.requests > this.MAX_REQUESTS_PER_SECOND) {
      data.violations.push(`High frequency: ${data.requests} req/sec at ${new Date(now).toISOString()}`);
      
      if (data.violations.length >= this.VIOLATION_THRESHOLD) {
        data.blocked = true;
        console.warn(`🚫 IP ${ip} blocked for suspicious activity:`, data.violations);
        return false;
      }
    }

    this.suspiciousIPs.set(key, data);
    return true;
  }

  isBlocked(ip: string, userAgent: string = 'unknown'): boolean {
    const key = `${ip}:${userAgent}`;
    const data = this.suspiciousIPs.get(key);
    
    if (!data) return false;
    
    const now = Date.now();
    if (data.blocked && (now - data.lastActivity) >= this.BLOCK_DURATION) {
      data.blocked = false;
      return false;
    }
    
    return data.blocked;
  }

  getStats() {
    const now = Date.now();
    let active = 0;
    let blocked = 0;
    
    const entries = Array.from(this.suspiciousIPs.entries());
    for (const [, data] of entries) {
      if ((now - data.lastActivity) < 5 * 60 * 1000) {
        active++;
      }
      if (data.blocked && (now - data.lastActivity) < this.BLOCK_DURATION) {
        blocked++;
      }
    }

    return { active, blocked, total: this.suspiciousIPs.size };
  }

  // Clean up old entries every hour
  cleanup() {
    const now = Date.now();
    const cutoff = 60 * 60 * 1000; // 1 hour
    const keysToDelete: string[] = [];
    const entries = Array.from(this.suspiciousIPs.entries());
    
    for (const [key, data] of entries) {
      if ((now - data.lastActivity) > cutoff && !data.blocked) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.suspiciousIPs.delete(key));
  }
}

export const securityMonitor = new SecurityMonitor();

// Cleanup old entries every hour
setInterval(() => {
  securityMonitor.cleanup();
}, 60 * 60 * 1000);

// Security Monitoring Middleware
export const securityMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const userAgent = req.get('User-Agent') || 'unknown';

  // Check if IP is blocked
  if (securityMonitor.isBlocked(ip, userAgent)) {
    return res.status(429).json({
      error: 'Access temporarily blocked due to suspicious activity',
      retryAfter: 1800, // 30 minutes
    });
  }

  // Track request
  if (!securityMonitor.trackRequest(ip, userAgent)) {
    return res.status(429).json({
      error: 'Request rate exceeded. Please slow down.',
      retryAfter: 1800,
    });
  }

  next();
};

// Request Size Limiting
export const requestSizeLimit = (req: Request, res: Response, next: NextFunction) => {
  const contentLength = parseInt(req.get('Content-Length') || '0');
  const MAX_REQUEST_SIZE = 10 * 1024 * 1024; // 10MB

  if (contentLength > MAX_REQUEST_SIZE) {
    return res.status(413).json({
      error: 'Request too large',
      maxSize: '10MB',
    });
  }

  next();
};

// Suspicious Pattern Detection
export const patternDetection = (req: Request, res: Response, next: NextFunction) => {
  const userAgent = req.get('User-Agent') || '';
  const url = req.url.toLowerCase();
  
  // Check for suspicious patterns
  const suspiciousPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /sqlmap/i,
    /nikto/i,
    /nmap/i,
    /masscan/i,
  ];

  const sqlInjectionPatterns = [
    /union.*select/i,
    /select.*from/i,
    /insert.*into/i,
    /delete.*from/i,
    /drop.*table/i,
    /exec.*\(/i,
    /script.*>/i,
  ];

  // Check User-Agent
  if (suspiciousPatterns.some(pattern => pattern.test(userAgent))) {
    console.warn(`🚨 Suspicious User-Agent detected: ${userAgent} from ${req.ip}`);
    return res.status(403).json({ error: 'Access denied' });
  }

  // Check URL for SQL injection attempts
  if (sqlInjectionPatterns.some(pattern => pattern.test(url))) {
    console.warn(`🚨 SQL injection attempt detected: ${url} from ${req.ip}`);
    return res.status(403).json({ error: 'Access denied' });
  }

  next();
};

// Connection Limiting
export const connectionLimiter = (req: Request, res: Response, next: NextFunction) => {
  // This would typically be handled by a reverse proxy like nginx
  // But we can implement basic connection tracking
  const ip = req.ip || 'unknown';
  
  // Add connection tracking logic here if needed
  // For now, just pass through
  next();
};

// Input Sanitization and Validation
export const sanitizeInput = (input: any): any => {
  if (typeof input === 'string') {
    // Remove potential XSS patterns
    let sanitized = input;
    XSS_PATTERNS.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });
    
    // Check for SQL injection patterns
    SQL_INJECTION_PATTERNS.forEach(pattern => {
      if (pattern.test(sanitized)) {
        throw new Error('Potentially malicious input detected');
      }
    });
    
    // Use DOMPurify for additional XSS protection
    sanitized = DOMPurify.sanitize(sanitized, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: []
    });
    
    return sanitized.trim();
  }
  
  if (Array.isArray(input)) {
    return input.map(item => sanitizeInput(item));
  }
  
  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[sanitizeInput(key)] = sanitizeInput(value);
    }
    return sanitized;
  }
  
  return input;
};

// Input validation middleware
export const validationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// Sanitization middleware
export const sanitizationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.body) {
      req.body = sanitizeInput(req.body);
    }
    if (req.query) {
      req.query = sanitizeInput(req.query);
    }
    if (req.params) {
      req.params = sanitizeInput(req.params);
    }
    next();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

// CSRF middleware
export const csrfMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
    return next();
  }
  
  const sessionId = (req as any).sessionID || req.ip;
  const token = req.get('X-CSRF-Token') || req.body?._csrf;
  
  if (!token || !csrfProtection.validateToken(sessionId, token)) {
    return res.status(403).json({ error: 'Invalid or missing CSRF token' });
  }
  
  next();
};

// Device fingerprint middleware
export const deviceFingerprintMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const deviceId = req.get('X-Device-ID');
  const fingerprint = generateDeviceFingerprint(req, req.body?.deviceInfo);
  
  // Store fingerprint in request for later use
  (req as any).deviceFingerprint = fingerprint;
  
  if (deviceId && deviceId !== fingerprint.hash) {
    console.warn('Device fingerprint mismatch:', { provided: deviceId, calculated: fingerprint.hash });
  }
  
  next();
};

// Comprehensive validation schemas
export const walletValidation = [
  body('walletAddress')
    .isLength({ min: 42, max: 42 })
    .matches(/^0x[a-fA-F0-9]{40}$/)
    .withMessage('Invalid wallet address format'),
];

export const amountValidation = [
  body('amount')
    .isNumeric()
    .isFloat({ min: 0.01, max: 1000000 })
    .withMessage('Amount must be between 0.01 and 1,000,000'),
];

export const textValidation = (field: string, minLength = 1, maxLength = 1000) => [
  body(field)
    .isLength({ min: minLength, max: maxLength })
    .trim()
    .escape()
    .withMessage(`${field} must be between ${minLength} and ${maxLength} characters`),
];

export const emailValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('Invalid email format'),
];

export const deviceInfoValidation = [
  body('deviceInfo.timezone').optional().isLength({ max: 50 }),
  body('deviceInfo.screenResolution').optional().matches(/^\d+x\d+$/),
  body('deviceInfo.colorDepth').optional().isIn(['16', '24', '32']),
];

// Security Status Endpoint (admin only)
export const getSecurityStatus = (req: Request, res: Response) => {
  const stats = securityMonitor.getStats();
  const sessionId = (req as any).sessionID || req.ip;
  const csrfToken = csrfProtection.generateToken(sessionId);
  
  res.json({
    timestamp: new Date().toISOString(),
    security: {
      activeIPs: stats.active,
      blockedIPs: stats.blocked,
      totalTracked: stats.total,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
    },
    rateLimit: {
      windowMs: '15 minutes',
      globalLimit: 1000,
      strictLimit: 50,
      authLimit: 10,
      createLimit: 5,
    },
    csrfToken,
    deviceFingerprint: (req as any).deviceFingerprint?.hash,
  });
};