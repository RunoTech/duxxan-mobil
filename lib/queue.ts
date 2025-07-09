import { EventEmitter } from 'events';
import { redis } from './redis';
import { firebase } from './firebase';
import { storage } from '../server/storage';

interface QueueJob {
  id: string;
  type: string;
  data: any;
  priority: number;
  retries: number;
  maxRetries: number;
  createdAt: Date;
  processAt: Date;
}

class JobQueue extends EventEmitter {
  private workers: Map<string, Function> = new Map();
  private isRunning: boolean = false;
  private processingInterval?: NodeJS.Timeout;
  private useRedis: boolean = false;

  constructor() {
    super();
    this.initializeRedis();
    this.start();
  }

  private async initializeRedis() {
    try {
      const isRedisAvailable = await redis.ping();
      this.useRedis = isRedisAvailable;
      console.log(`Queue initialized with ${this.useRedis ? 'Redis' : 'in-memory'} backend`);
    } catch (error) {
      console.log('Redis not available, using in-memory queue');
      this.useRedis = false;
    }
  }

  // Register a worker function for a specific job type
  registerWorker(jobType: string, worker: Function) {
    this.workers.set(jobType, worker);
  }

  // Add a job to the queue
  addJob(type: string, data: any, options: {
    priority?: number;
    delay?: number;
    maxRetries?: number;
  } = {}): string {
    const jobId = `${type}_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    const now = new Date();
    
    const job: QueueJob = {
      id: jobId,
      type,
      data,
      priority: options.priority || 0,
      retries: 0,
      maxRetries: options.maxRetries || 3,
      createdAt: now,
      processAt: new Date(now.getTime() + (options.delay || 0))
    };

    this.jobs.set(jobId, job);
    this.emit('jobAdded', job);
    return jobId;
  }

  // Get jobs ready for processing, sorted by priority and creation time
  private getReadyJobs(): QueueJob[] {
    const now = new Date();
    return Array.from(this.jobs.values())
      .filter(job => !this.processing.has(job.id) && job.processAt <= now)
      .sort((a, b) => {
        // Higher priority first, then older jobs first
        if (a.priority !== b.priority) {
          return b.priority - a.priority;
        }
        return a.createdAt.getTime() - b.createdAt.getTime();
      });
  }

  // Process a single job
  private async processJob(job: QueueJob): Promise<void> {
    const worker = this.workers.get(job.type);
    
    if (!worker) {
      console.error(`No worker registered for job type: ${job.type}`);
      this.jobs.delete(job.id);
      return;
    }

    this.processing.add(job.id);
    this.emit('jobStarted', job);

    try {
      await worker(job.data);
      this.jobs.delete(job.id);
      this.emit('jobCompleted', job);
    } catch (error) {
      console.error(`Job ${job.id} failed:`, error);
      
      job.retries++;
      if (job.retries >= job.maxRetries) {
        this.jobs.delete(job.id);
        this.emit('jobFailed', job, error);
      } else {
        // Exponential backoff: retry after 2^retries seconds
        const delayMs = Math.pow(2, job.retries) * 1000;
        job.processAt = new Date(Date.now() + delayMs);
        this.emit('jobRetry', job);
      }
    } finally {
      this.processing.delete(job.id);
    }
  }

  // Main processing loop
  private async processJobs(): Promise<void> {
    if (!this.isRunning) return;

    const readyJobs = this.getReadyJobs();
    const concurrency = 5; // Process up to 5 jobs concurrently
    
    const currentlyProcessing = Math.min(concurrency - this.processing.size, readyJobs.length);
    
    for (let i = 0; i < currentlyProcessing; i++) {
      const job = readyJobs[i];
      this.processJob(job).catch(error => {
        console.error('Unexpected error processing job:', error);
      });
    }
  }

  // Start the queue processor
  start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.processingInterval = setInterval(() => {
      this.processJobs();
    }, 1000); // Check for jobs every second
    
    console.log('Job queue started');
  }

  // Stop the queue processor
  stop(): void {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
    }
    
    console.log('Job queue stopped');
  }

  // Get queue statistics
  getStats() {
    const now = new Date();
    const allJobs = Array.from(this.jobs.values());
    
    return {
      total: allJobs.length,
      processing: this.processing.size,
      waiting: allJobs.filter(job => !this.processing.has(job.id) && job.processAt <= now).length,
      scheduled: allJobs.filter(job => job.processAt > now).length,
      failed: allJobs.filter(job => job.retries >= job.maxRetries).length,
      byType: allJobs.reduce((acc, job) => {
        acc[job.type] = (acc[job.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
  }
}

// Global queue instance
export const jobQueue = new JobQueue();

// Register common job workers
jobQueue.registerWorker('RAFFLE_END_CALCULATION', async (data: { raffleId: number }) => {
  console.log(`Processing raffle end calculation for raffle ${data.raffleId}`);
  
  // Import storage here to avoid circular dependencies
  const { storage } = await import('../server/storage');
  
  try {
    // Get raffle details
    const raffle = await storage.getRaffleById(data.raffleId);
    if (!raffle) {
      throw new Error(`Raffle ${data.raffleId} not found`);
    }

    // Check if raffle has ended
    if (new Date() < new Date(raffle.endDate)) {
      throw new Error(`Raffle ${data.raffleId} has not ended yet`);
    }

    // Get all tickets for this raffle
    const tickets = await storage.getTicketsByRaffle(data.raffleId);
    if (tickets.length === 0) {
      throw new Error(`No tickets found for raffle ${data.raffleId}`);
    }

    // Select random winner
    const totalTickets = tickets.reduce((sum, ticket) => sum + ticket.quantity, 0);
    const winningTicketNumber = Math.floor(Math.random() * totalTickets) + 1;
    
    let currentCount = 0;
    let winnerId: number | null = null;
    
    for (const ticket of tickets) {
      currentCount += ticket.quantity;
      if (winningTicketNumber <= currentCount) {
        winnerId = ticket.userId;
        break;
      }
    }

    if (winnerId) {
      // Update raffle with winner
      await storage.updateRaffle(data.raffleId, { winnerId });
      console.log(`Winner selected for raffle ${data.raffleId}: User ${winnerId}`);
    }

  } catch (error) {
    console.error(`Failed to process raffle end calculation:`, error);
    throw error;
  }
});

jobQueue.registerWorker('EMAIL_NOTIFICATION', async (data: { 
  to: string; 
  subject: string; 
  body: string; 
  type: string;
}) => {
  console.log(`Sending ${data.type} email to ${data.to}`);
  
  // Simulate email sending delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // In a real implementation, you would integrate with an email service like SendGrid, AWS SES, etc.
  console.log(`Email sent successfully: ${data.subject}`);
});

jobQueue.registerWorker('BLOCKCHAIN_TRANSACTION', async (data: {
  transactionHash: string;
  type: string;
  userId: number;
  amount: string;
}) => {
  console.log(`Processing blockchain transaction: ${data.transactionHash}`);
  
  // Simulate blockchain verification delay
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // In a real implementation, you would verify the transaction on the blockchain
  console.log(`Transaction verified: ${data.transactionHash}`);
});

// Helper functions for adding common jobs
export const addRaffleEndJob = (raffleId: number, endDate: Date) => {
  const delay = endDate.getTime() - Date.now();
  
  return jobQueue.addJob('RAFFLE_END_CALCULATION', { raffleId }, {
    delay: Math.max(delay, 0),
    priority: 5,
    maxRetries: 3
  });
};

export const addEmailJob = (to: string, subject: string, body: string, type: string = 'general') => {
  return jobQueue.addJob('EMAIL_NOTIFICATION', { to, subject, body, type }, {
    priority: 3,
    maxRetries: 5
  });
};

export const addBlockchainJob = (transactionHash: string, type: string, userId: number, amount: string) => {
  return jobQueue.addJob('BLOCKCHAIN_TRANSACTION', { transactionHash, type, userId, amount }, {
    priority: 4,
    maxRetries: 3
  });
};