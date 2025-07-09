// Cleanup utilities for server stability

export function startPeriodicCleanup() {
  // Less frequent cleanup to reduce resource usage
  setInterval(() => {
    try {
      // Force garbage collection only when needed
      const memUsage = process.memoryUsage();
      const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
      
      if (heapUsedMB > 180 && global.gc) {
        global.gc();
      }
    } catch (error) {
      // Silent error handling
    }
  }, 10 * 60 * 1000); // 10 minutes
}

export function optimizeNodeOptions() {
  // Set optimal Node.js options for Replit environment
  process.env.NODE_OPTIONS = '--max-old-space-size=512 --optimize-for-size --gc-interval=100 --max-semi-space-size=64';
}