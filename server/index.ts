import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { 
  corsOptions, 
  globalRateLimit, 
  securityHeaders, 
  securityMiddleware,
  sanitizationMiddleware,
  deviceFingerprintMiddleware,
  requestSizeLimit,
  patternDetection
} from "./middleware/security";
import { languageDetectionMiddleware, translationHeadersMiddleware } from "./middleware/translation";
import apiRoutes from "./routes/index";
import { startMemoryMonitoring } from "./utils/memory";
import { startPeriodicCleanup, optimizeNodeOptions } from "./utils/cleanup";

const app = express();
app.set('trust proxy', 1); // Trust first proxy for accurate IP detection

// Direct health check endpoint - bypasses all middleware
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Test endpoint to verify server accessibility
app.get('/test', (req, res) => {
  res.status(200).send('<h1>DUXXAN Server Test</h1><p>Server is accessible and running properly</p><p>Time: ' + new Date().toISOString() + '</p>');
});

// Apply minimal middleware for stability and performance
app.use(cors(corsOptions));
app.use(securityHeaders);
app.use(express.json({ limit: '1mb' })); // Reduced limit
app.use(express.urlencoded({ extended: false, limit: '1mb' }));
// Disabled all heavy middleware for performance
// app.use(requestSizeLimit);
// app.use(securityMiddleware);
// app.use(globalRateLimit);

// Apply only essential middleware for stability - minimal overhead
// app.use(sanitizationMiddleware); // Disabled for performance
// Disabled device fingerprinting to reduce memory usage
// app.use(deviceFingerprintMiddleware);

// Disabled translation middleware for performance
// app.use(languageDetectionMiddleware);
// app.use(translationHeadersMiddleware);

app.post('/api/raffles/:id/assign-winner', async (req: any, res) => {
  try {
    console.log('Demo winner assignment request received', req.body);
    const raffleId = parseInt(req.params.id);
    // Ignore winnerId from request body, always use user ID 1 for demo

    // Import storage here to avoid circular dependency
    const { storage } = await import('./storage');
    
    const raffle = await storage.getRaffleById(raffleId);
    
    if (!raffle) {
      return res.status(404).json({ message: 'Raffle not found' });
    }

    // Use existing user ID 1 as demo winner
    const updatedRaffle = await storage.updateRaffle(raffleId, { winnerId: 1 });
    console.log(`Winner assigned: Raffle ${raffleId}, Winner ID: 1 (TechMaster2024)`);

    // Get the full raffle with creator and winner data
    const raffleWithDetails = await storage.getRaffleById(raffleId);

    res.json({ 
      success: true,
      message: 'Winner assigned successfully', 
      data: raffleWithDetails 
    });
  } catch (error: any) {
    console.error('Winner assignment error:', error);
    res.status(500).json({ message: 'Failed to assign winner', error: error.message });
  }
});

// Mutual approval routes BEFORE any middleware
app.post('/api/raffles/:id/approve-winner', async (req: any, res) => {
  try {
    const raffleId = parseInt(req.params.id);
    const { storage } = await import('./storage');
    
    const raffle = await storage.getRaffleById(raffleId);
    
    if (!raffle) {
      return res.status(404).json({ message: 'Raffle not found' });
    }

    if (!raffle.winnerId) {
      return res.status(400).json({ message: 'No winner assigned yet' });
    }

    // For demo: Approve as creator (organization)
    const updatedRaffle = await storage.updateRaffle(raffleId, { 
      isApprovedByCreator: true 
    });

    console.log(`Creator approved raffle ${raffleId}`);
    res.json({ message: 'Approved by creator', raffle: updatedRaffle });
  } catch (error) {
    console.error('Creator approval error:', error);
    res.status(500).json({ message: 'Failed to approve by creator' });
  }
});

app.post('/api/raffles/:id/approve-creator', async (req: any, res) => {
  try {
    const raffleId = parseInt(req.params.id);
    const { storage } = await import('./storage');
    
    const raffle = await storage.getRaffleById(raffleId);
    
    if (!raffle) {
      return res.status(404).json({ message: 'Raffle not found' });
    }

    if (!raffle.winnerId) {
      return res.status(400).json({ message: 'No winner assigned yet' });
    }

    // For demo: Approve as winner
    const updatedRaffle = await storage.updateRaffle(raffleId, { 
      isApprovedByWinner: true 
    });

    console.log(`Winner approved raffle ${raffleId}`);
    res.json({ message: 'Approved by winner', raffle: updatedRaffle });
  } catch (error) {
    console.error('Winner approval error:', error);
    res.status(500).json({ message: 'Failed to approve by winner' });
  }
});

// Chat system removed

// Remove duplicate middleware - already defined above

// Optimized request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    
    // Log all API requests for debugging, but only errors for others
    if (path.startsWith('/api/') || statusCode >= 400 || duration > 3000) {
      let logLine = `${req.method} ${path} ${statusCode} in ${duration}ms`;
      if (capturedJsonResponse && statusCode >= 400) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 100) {
        logLine = logLine.slice(0, 99) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Add controller-based API routes
app.use('/api', apiRoutes);

(async () => {
  // Register routes but skip the demo route since it's already defined
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  const httpServer = server.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
    log('DUXXAN server running with controller-based architecture');
  });

  // Start optimized monitoring for stability
  optimizeNodeOptions();
  startPeriodicCleanup();

  // Graceful shutdown handling
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    httpServer.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    httpServer.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });

  // Handle unhandled promise rejections to prevent crashes
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  });

  process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception thrown:', err);
  });
})();
