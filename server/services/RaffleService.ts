import { BaseService } from './BaseService';
import { storage } from '../storage';
import { Raffle, InsertRaffle } from '@shared/schema';
import { redis } from '../../lib/redis';
import { firebase } from '../../lib/firebase';
import { ethers } from 'ethers';

export class RaffleService extends BaseService {
  async getRaffles(limit?: number, offset?: number): Promise<any[]> {
    try {
      // Try cache first
      const cached = await redis.get(`raffles:${limit}:${offset}`);
      if (cached) return cached;
      
      const raffles = await storage.getRaffles(limit, offset);
      
      // Cache for 5 minutes
      await redis.set(`raffles:${limit}:${offset}`, raffles, 300);
      
      return raffles;
    } catch (error) {
      return this.handleError(error, 'Failed to get raffles');
    }
  }

  async getActiveRaffles(): Promise<any[]> {
    try {
      // Skip Redis for now and get directly from database
      const raffles = await storage.getActiveRaffles();
      
      // Ensure images field is present for each raffle
      const rafflesWithImages = (raffles || []).map(raffle => ({
        ...raffle,
        images: raffle.images || null
      }));
      
      return rafflesWithImages;
    } catch (error) {
      console.error('Error getting active raffles:', error);
      // Return empty array instead of throwing error
      return [];
    }
  }

  async getRaffleById(id: number): Promise<any | null> {
    try {
      this.validatePositiveNumber(id, 'Raffle ID');
      
      const cached = await redis.get(`raffle:${id}`);
      if (cached) return cached;
      
      const raffle = await storage.getRaffleById(id);
      
      if (raffle) {
        // Ensure images field is present and log for debugging
        const raffleWithImages = {
          ...raffle,
          images: raffle.images || null
        };
        console.log('RaffleService - getRaffleById - Raffle data:', {
          id: raffleWithImages.id,
          title: raffleWithImages.title,
          images: raffleWithImages.images,
          imagesType: typeof raffleWithImages.images
        });
        
        await redis.set(`raffle:${id}`, raffleWithImages, 300);
        return raffleWithImages;
      }
      
      return null;
    } catch (error) {
      return this.handleError(error, 'Failed to get raffle');
    }
  }

  async verifyRaffleCreationPayment(
    transactionHash: string,
    walletAddress: string,
    prizeValue: string
  ): Promise<boolean> {
    try {
      // BSC mainnet RPC
      const provider = new ethers.JsonRpcProvider('https://bsc-dataseed1.binance.org/');
      
      // Get transaction receipt
      const receipt = await provider.getTransactionReceipt(transactionHash);
      if (!receipt) {
        throw new Error('Transaction not found');
      }

      // Verify transaction success
      if (receipt.status !== 1) {
        throw new Error('Transaction failed');
      }

      // Contract address (deployed DuxxanPlatform)
      const contractAddress = '0x7e1B19CE44AcCF69360A23cAdCBeA551B215Cade';
      
      // Verify transaction is to our contract
      if (receipt.to?.toLowerCase() !== contractAddress.toLowerCase()) {
        throw new Error('Transaction not sent to correct contract');
      }

      // Verify sender
      const tx = await provider.getTransaction(transactionHash);
      if (tx?.from.toLowerCase() !== walletAddress.toLowerCase()) {
        throw new Error('Transaction not sent from user wallet');
      }

      // USDT contract address on BSC (USDT has 18 decimals on BSC)
      const usdtAddress = '0x55d398326f99059fF775485246999027B3197955';
      
      // Verify USDT transfer of 25 tokens (with 18 decimals)
      const expectedAmount = ethers.parseUnits('25', 18);
      
      // Check logs for USDT transfer event
      const transferTopic = ethers.id('Transfer(address,address,uint256)');
      const usdtTransferLog = receipt.logs.find(log => 
        log.address.toLowerCase() === usdtAddress.toLowerCase() &&
        log.topics[0] === transferTopic &&
        log.topics[1] === ethers.zeroPadValue(walletAddress.toLowerCase(), 32) &&
        log.topics[2] === ethers.zeroPadValue(contractAddress.toLowerCase(), 32)
      );

      if (!usdtTransferLog) {
        throw new Error('USDT transfer not found in transaction');
      }

      // Verify amount (25 USDT)
      const transferAmount = ethers.getBigInt(usdtTransferLog.data);
      if (transferAmount < expectedAmount) {
        throw new Error('Insufficient payment amount');
      }

      return true;
    } catch (error) {
      console.error('Payment verification failed:', error);
      return false;
    }
  }

  async createRaffle(raffleData: InsertRaffle & { creatorId: number; transactionHash?: string }): Promise<Raffle> {
    try {
      this.validateRequired(raffleData.title, 'Title');
      this.validateRequired(raffleData.description, 'Description');
      this.validatePositiveNumber(raffleData.creatorId, 'Creator ID');
      
      // Sanitize text fields
      raffleData.title = this.sanitizeString(raffleData.title);
      raffleData.description = this.sanitizeString(raffleData.description);
      
      const raffle = await storage.createRaffle(raffleData);
      
      // Clear cache
      await redis.del('raffles:active');
      await redis.invalidateCache('raffles:*');
      
      // Log to Firebase
      await firebase.saveRaffleEvent(raffle.id, 'raffle_created', {
        creatorId: raffleData.creatorId,
        title: raffle.title,
        prizeValue: raffle.prizeValue,
        transactionHash: raffleData.transactionHash,
        timestamp: new Date()
      });
      
      return raffle;
    } catch (error) {
      return this.handleError(error, 'Failed to create raffle');
    }
  }

  async updateRaffle(id: number, updates: Partial<Raffle>): Promise<Raffle | null> {
    try {
      this.validatePositiveNumber(id, 'Raffle ID');
      
      if (updates.title) {
        updates.title = this.sanitizeString(updates.title);
      }
      if (updates.description) {
        updates.description = this.sanitizeString(updates.description);
      }
      
      const raffle = await storage.updateRaffle(id, updates);
      
      if (raffle) {
        // Update cache
        await redis.set(`raffle:${id}`, raffle, 300);
        await redis.del('raffles:active');
        await redis.invalidateCache('raffles:*');
        
        // Log to Firebase
        await firebase.saveRaffleEvent(id, 'raffle_updated', {
          updates,
          timestamp: new Date()
        });
      }
      
      return raffle || null;
    } catch (error) {
      return this.handleError(error, 'Failed to update raffle');
    }
  }

  async getRafflesByCreator(creatorId: number): Promise<Raffle[]> {
    try {
      this.validatePositiveNumber(creatorId, 'Creator ID');
      
      const cached = await redis.get(`raffles:creator:${creatorId}`);
      if (cached) return cached;
      
      const raffles = await storage.getRafflesByCreator(creatorId);
      
      // Cache for 10 minutes
      await redis.set(`raffles:creator:${creatorId}`, raffles, 600);
      
      return raffles;
    } catch (error) {
      return this.handleError(error, 'Failed to get raffles by creator');
    }
  }

  async purchaseTickets(userId: number, raffleId: number, quantity: number, totalAmount: string, transactionHash?: string): Promise<any> {
    try {
      this.validatePositiveNumber(userId, 'User ID');
      this.validatePositiveNumber(raffleId, 'Raffle ID');
      this.validatePositiveNumber(quantity, 'Quantity');
      this.validateRequired(totalAmount, 'Total amount');
      
      // Create ticket entry
      const ticket = await storage.createTicket({
        userId,
        raffleId,
        quantity,
        totalAmount,
        transactionHash: transactionHash || null
      });
      
      // Clear relevant caches
      await redis.del(`raffle:${raffleId}`);
      await redis.del('raffles:active');
      
      // Log to Firebase
      await firebase.saveRaffleEvent(raffleId, 'ticket_purchased', {
        userId,
        quantity,
        totalAmount,
        transactionHash,
        timestamp: new Date()
      });
      
      return ticket;
    } catch (error) {
      return this.handleError(error, 'Failed to purchase tickets');
    }
  }

  async getRaffleTickets(raffleId: number): Promise<any[]> {
    try {
      this.validatePositiveNumber(raffleId, 'Raffle ID');
      
      const tickets = await storage.getTicketsByRaffle(raffleId);
      return tickets;
    } catch (error) {
      return this.handleError(error, 'Failed to get raffle tickets');
    }
  }

  async getUserTickets(userId: number): Promise<any[]> {
    try {
      this.validatePositiveNumber(userId, 'User ID');
      
      const cached = await redis.get(`tickets:user:${userId}`);
      if (cached) return cached;
      
      const tickets = await storage.getTicketsByUser(userId);
      
      // Cache for 5 minutes
      await redis.set(`tickets:user:${userId}`, tickets, 300);
      
      return tickets;
    } catch (error) {
      return this.handleError(error, 'Failed to get user tickets');
    }
  }
}