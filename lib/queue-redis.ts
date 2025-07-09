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
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

class RedisJobQueue extends EventEmitter {
  private workers: Map<string, Function> = new Map();
  private isRunning: boolean = false;
  private processingInterval?: NodeJS.Timeout;
  private readonly QUEUE_PREFIX = 'duxxan:queue';
  private readonly PROCESSING_PREFIX = 'duxxan:processing';

  constructor() {
    super();
    this.registerDefaultWorkers();
    this.start();
  }

  // Register worker functions
  registerWorker(jobType: string, worker: Function) {
    this.workers.set(jobType, worker);
    console.log(`Worker registered for job type: ${jobType}`);
  }

  // Add job to Redis queue
  async addJob(type: string, data: any, options: {
    priority?: number;
    delay?: number;
    maxRetries?: number;
  } = {}): Promise<string> {
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
      processAt: new Date(now.getTime() + (options.delay || 0)),
      status: 'pending'
    };

    try {
      // Add to Redis with priority score
      await redis.addToQueue(`${this.QUEUE_PREFIX}:${type}`, job, job.priority);
      
      // Track job details
      await redis.set(`job:${jobId}`, job, 3600); // 1 hour TTL
      
      console.log(`Job added to queue: ${jobId} (${type})`);
      return jobId;
    } catch (error) {
      console.error('Failed to add job to Redis queue:', error);
      throw error;
    }
  }

  // Get next job from queue
  private async getNextJob(): Promise<QueueJob | null> {
    try {
      // Check all queue types
      for (const [jobType] of this.workers) {
        const job = await redis.getFromQueue(`${this.QUEUE_PREFIX}:${jobType}`);
        if (job && job.data) {
          // Check if job is ready to process
          const processAt = new Date(job.data.processAt);
          if (processAt <= new Date()) {
            return job.data;
          } else {
            // Put back in queue if not ready
            await redis.addToQueue(`${this.QUEUE_PREFIX}:${jobType}`, job.data, job.data.priority);
          }
        }
      }
      return null;
    } catch (error) {
      console.error('Error getting next job:', error);
      return null;
    }
  }

  // Process a single job
  private async processJob(job: QueueJob): Promise<void> {
    const worker = this.workers.get(job.type);
    if (!worker) {
      console.error(`No worker found for job type: ${job.type}`);
      return;
    }

    try {
      // Mark as processing
      job.status = 'processing';
      await redis.set(`${this.PROCESSING_PREFIX}:${job.id}`, job, 300); // 5 min TTL
      
      console.log(`Processing job: ${job.id} (${job.type})`);
      
      // Execute worker
      await worker(job.data);
      
      // Mark as completed
      job.status = 'completed';
      await redis.set(`job:${job.id}`, job, 86400); // Keep completed jobs for 24 hours
      await redis.del(`${this.PROCESSING_PREFIX}:${job.id}`);
      
      console.log(`Job completed: ${job.id}`);
      
      // Log to Firebase
      await firebase.saveDocument('job_logs', job.id, {
        jobId: job.id,
        type: job.type,
        status: 'completed',
        completedAt: new Date().toISOString(),
        retries: job.retries
      });

    } catch (error) {
      console.error(`Job failed: ${job.id}`, error);
      
      job.retries++;
      
      if (job.retries <= job.maxRetries) {
        // Retry with exponential backoff
        const delay = Math.pow(2, job.retries) * 1000; // 2s, 4s, 8s...
        job.processAt = new Date(Date.now() + delay);
        job.status = 'pending';
        
        await this.addJob(job.type, job.data, {
          priority: job.priority,
          delay,
          maxRetries: job.maxRetries
        });
        
        console.log(`Job ${job.id} scheduled for retry ${job.retries}/${job.maxRetries} in ${delay}ms`);
      } else {
        // Mark as failed
        job.status = 'failed';
        await redis.set(`job:${job.id}`, job, 86400);
        
        // Log failure to Firebase
        await firebase.saveDocument('job_logs', job.id, {
          jobId: job.id,
          type: job.type,
          status: 'failed',
          failedAt: new Date().toISOString(),
          retries: job.retries,
          error: error instanceof Error ? error.message : String(error)
        });
        
        console.error(`Job permanently failed: ${job.id} after ${job.retries} retries`);
      }
      
      await redis.del(`${this.PROCESSING_PREFIX}:${job.id}`);
    }
  }

  // Main processing loop
  private async processJobs(): Promise<void> {
    if (!this.isRunning) return;

    try {
      const job = await this.getNextJob();
      if (job) {
        // Process job without blocking the loop
        this.processJob(job).catch(error => {
          console.error('Unexpected error processing job:', error);
        });
      }
    } catch (error) {
      console.error('Error in job processing loop:', error);
    }
  }

  // Start the queue processor
  start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.processingInterval = setInterval(() => {
      this.processJobs();
    }, 1000); // Check every second
    
    console.log('Redis job queue started');
  }

  // Stop the queue processor
  stop(): void {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
    }
    
    console.log('Redis job queue stopped');
  }

  // Get queue statistics
  async getStats() {
    try {
      const stats: Record<string, any> = {};
      
      for (const [jobType] of this.workers) {
        const queueLength = await redis.getQueueLength(`${this.QUEUE_PREFIX}:${jobType}`);
        stats[jobType] = { pending: queueLength };
      }
      
      return {
        queues: stats,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting queue stats:', error);
      return { error: 'Failed to get stats' };
    }
  }

  // Register default workers for DUXXAN platform
  private registerDefaultWorkers() {
    // Raffle end calculation worker
    this.registerWorker('RAFFLE_END_CALCULATION', async (data: { raffleId: number }) => {
      console.log(`Processing raffle end calculation for raffle ${data.raffleId}`);
      
      try {
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
          
          // Cache invalidation
          await redis.invalidateCache('raffles');
          
          // Log to Firebase
          await firebase.saveRaffleEvent(data.raffleId, 'winner_selected', {
            winnerId,
            totalTickets,
            winningTicketNumber
          });
          
          // Send notification (if device tokens available)
          // Note: Device tokens would need to be stored in user profile
          console.log(`Winner selected for raffle ${data.raffleId}: User ${winnerId}`);
        }

      } catch (error) {
        console.error(`Failed to process raffle end calculation:`, error);
        throw error;
      }
    });

    // Email notification worker
    this.registerWorker('EMAIL_NOTIFICATION', async (data: { 
      to: string; 
      subject: string; 
      body: string; 
      type: string;
    }) => {
      console.log(`Sending email notification to: ${data.to}`);
      
      // In a real implementation, integrate with email service (SendGrid, SES, etc.)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Log to Firebase
      await firebase.saveDocument('email_logs', `${Date.now()}_${Math.random().toString(36).substring(2)}`, {
        to: data.to,
        subject: data.subject,
        type: data.type,
        sentAt: new Date().toISOString(),
        status: 'sent'
      });
      
      console.log(`Email sent successfully to: ${data.to}`);
    });

    // Blockchain transaction worker
    this.registerWorker('BLOCKCHAIN_TRANSACTION', async (data: { 
      transactionHash: string; 
      type: string; 
      userId: number; 
      amount: string;
    }) => {
      console.log(`Processing blockchain transaction: ${data.transactionHash}`);
      
      try {
        // Track in Redis
        await redis.trackTransaction(data.transactionHash, {
          type: data.type,
          userId: data.userId,
          amount: data.amount
        });
        
        // Simulate blockchain verification (replace with actual Web3 calls)
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Update transaction status
        await redis.updateTransactionStatus(data.transactionHash, 'confirmed', 12345);
        
        // Log to Firebase
        await firebase.saveDocument('blockchain_logs', data.transactionHash, {
          transactionHash: data.transactionHash,
          type: data.type,
          userId: data.userId,
          amount: data.amount,
          status: 'confirmed',
          confirmedAt: new Date().toISOString()
        });
        
        console.log(`Transaction confirmed: ${data.transactionHash}`);
        
      } catch (error) {
        await redis.updateTransactionStatus(data.transactionHash, 'failed');
        throw error;
      }
    });

    // Push notification worker
    this.registerWorker('PUSH_NOTIFICATION', async (data: {
      userIds: number[];
      title: string;
      body: string;
      type: string;
      metadata?: any;
    }) => {
      console.log(`Sending push notification to ${data.userIds.length} users`);
      
      try {
        // In a real implementation, you'd fetch device tokens from user profiles
        const deviceTokens: string[] = []; // Fetch from database
        
        if (deviceTokens.length > 0) {
          await firebase.sendMulticastNotification(
            deviceTokens,
            { title: data.title, body: data.body },
            { type: data.type, ...data.metadata }
          );
        }
        
        // Log to Firebase
        await firebase.saveDocument('notification_logs', `${Date.now()}_${Math.random().toString(36).substring(2)}`, {
          userIds: data.userIds,
          title: data.title,
          type: data.type,
          sentAt: new Date().toISOString(),
          deviceCount: deviceTokens.length
        });
        
      } catch (error) {
        console.error('Push notification failed:', error);
        throw error;
      }
    });
  }
}

// Create singleton instance
export const jobQueue = new RedisJobQueue();

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

export const addPushNotificationJob = (userIds: number[], title: string, body: string, type: string, metadata?: any) => {
  return jobQueue.addJob('PUSH_NOTIFICATION', { userIds, title, body, type, metadata }, {
    priority: 2,
    maxRetries: 2
  });
};

export default jobQueue;