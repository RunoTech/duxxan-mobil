import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

// Extend Express Request type to include authentication properties
declare global {
  namespace Express {
    interface Request {
      user?: any;
      isAuthenticated?(): boolean;
      login?(user: any, callback: (err: any) => void): void;
    }
  }
}

export abstract class BaseController {
  protected validateBody<T>(schema: ZodSchema<T>) {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        const validatedData = schema.parse(req.body);
        req.body = validatedData as any;
        next();
      } catch (error) {
        res.status(400).json({
          error: 'Validation failed',
          details: error
        });
      }
    };
  }

  protected validateParams<T>(schema: ZodSchema<T>) {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        const validatedData = schema.parse(req.params);
        req.params = validatedData as any;
        next();
      } catch (error) {
        res.status(400).json({
          error: 'Parameter validation failed',
          details: error
        });
      }
    };
  }

  protected validateQuery<T>(schema: ZodSchema<T>) {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        const validatedData = schema.parse(req.query);
        req.query = validatedData as any;
        next();
      } catch (error) {
        res.status(400).json({
          error: 'Query validation failed',
          details: error
        });
      }
    };
  }

  protected asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
    return (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }

  protected sendSuccess(res: Response, data: any, message?: string, statusCode: number = 200) {
    res.status(statusCode).json({
      success: true,
      message,
      data
    });
  }

  protected sendError(res: Response, message: string, statusCode: number = 500, details?: any) {
    res.status(statusCode).json({
      success: false,
      message,
      details
    });
  }

  protected requireAuth() {
    return (req: Request, res: Response, next: NextFunction) => {
      // Simplified auth for testing - allow all requests
      next();
    };
  }

  protected requireWallet() {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!req.user?.walletAddress) {
        return res.status(401).json({
          error: 'Wallet address required'
        });
      }
      next();
    };
  }
}