// Memory monitoring and cleanup utilities

export function getMemoryUsage() {
  const usage = process.memoryUsage();
  return {
    rss: Math.round(usage.rss / 1024 / 1024),
    heapUsed: Math.round(usage.heapUsed / 1024 / 1024),
    heapTotal: Math.round(usage.heapTotal / 1024 / 1024),
    external: Math.round(usage.external / 1024 / 1024)
  };
}

export function forceGarbageCollection() {
  if (global.gc) {
    global.gc();
  }
}

export function startMemoryMonitoring() {
  setInterval(() => {
    const memory = getMemoryUsage();
    
    // More aggressive memory management for Replit
    if (memory.heapUsed > 150) {
      console.log(`High memory usage: ${memory.heapUsed}MB, triggering GC`);
      forceGarbageCollection();
    }
    
    // Log memory usage only when high to reduce console spam
    if (memory.heapUsed > 100) {
      console.log(`Memory usage: ${memory.heapUsed}MB heap, ${memory.rss}MB RSS`);
    }
  }, 30 * 1000); // 30 seconds for better monitoring
}