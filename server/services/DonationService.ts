import { BaseService } from './BaseService';
import { storage } from '../storage';
import { Donation, InsertDonation } from '@shared/schema';
import { redis } from '../../lib/redis';
import { firebase } from '../../lib/firebase';

export class DonationService extends BaseService {
  async getDonations(limit?: number, offset?: number, filter?: string): Promise<any[]> {
    try {
      const cacheKey = `donations:${limit}:${offset}:${filter || 'all'}`;
      const cached = await redis.get(cacheKey);
      if (cached) return cached;
      
      const donations = await storage.getDonations(limit, offset, filter);
      
      // Cache for 5 minutes
      await redis.set(cacheKey, donations, 300);
      
      return donations;
    } catch (error) {
      return this.handleError(error, 'Failed to get donations');
    }
  }

  async getActiveDonations(): Promise<any[]> {
    try {
      // Skip Redis for now and get directly from database
      const donations = await storage.getActiveDonations();
      return donations || [];
    } catch (error) {
      console.error('Error getting active donations:', error);
      // Return empty array instead of throwing error
      return [];
    }
  }

  async getDonationById(id: number): Promise<any | null> {
    try {
      this.validatePositiveNumber(id, 'Donation ID');
      
      const cached = await redis.get(`donation:${id}`);
      if (cached) return cached;
      
      const donation = await storage.getDonationById(id);
      
      if (donation) {
        await redis.set(`donation:${id}`, donation, 300);
      }
      
      return donation || null;
    } catch (error) {
      return this.handleError(error, 'Failed to get donation');
    }
  }

  async createDonation(donationData: InsertDonation & { creatorId: number }): Promise<Donation> {
    try {
      this.validateRequired(donationData.title, 'Title');
      this.validateRequired(donationData.description, 'Description');
      this.validateRequired(donationData.targetAmount, 'Target amount');
      this.validatePositiveNumber(donationData.creatorId, 'Creator ID');
      
      // Sanitize text fields
      donationData.title = this.sanitizeString(donationData.title);
      donationData.description = this.sanitizeString(donationData.description);
      
      const donation = await storage.createDonation(donationData);
      
      // Clear cache
      await redis.del('donations:active');
      await redis.invalidateCache('donations:*');
      
      // Log to Firebase
      await firebase.saveDonationEvent(donation.id, 'donation_created', {
        creatorId: donationData.creatorId,
        title: donation.title,
        targetAmount: donation.targetAmount,
        organizationType: donation.organizationType,
        timestamp: new Date()
      });
      
      return donation;
    } catch (error) {
      return this.handleError(error, 'Failed to create donation');
    }
  }

  async updateDonation(id: number, updates: Partial<Donation>): Promise<Donation | null> {
    try {
      this.validatePositiveNumber(id, 'Donation ID');
      
      if (updates.title) {
        updates.title = this.sanitizeString(updates.title);
      }
      if (updates.description) {
        updates.description = this.sanitizeString(updates.description);
      }
      
      const donation = await storage.updateDonation(id, updates);
      
      if (donation) {
        // Update cache
        await redis.set(`donation:${id}`, donation, 300);
        await redis.del('donations:active');
        await redis.invalidateCache('donations:*');
        
        // Log to Firebase
        await firebase.saveDonationEvent(id, 'donation_updated', {
          updates,
          timestamp: new Date()
        });
      }
      
      return donation || null;
    } catch (error) {
      return this.handleError(error, 'Failed to update donation');
    }
  }

  async getDonationsByCreator(creatorId: number): Promise<Donation[]> {
    try {
      this.validatePositiveNumber(creatorId, 'Creator ID');
      
      const cached = await redis.get(`donations:creator:${creatorId}`);
      if (cached) return cached;
      
      const donations = await storage.getDonationsByCreator(creatorId);
      
      // Cache for 10 minutes
      await redis.set(`donations:creator:${creatorId}`, donations, 600);
      
      return donations;
    } catch (error) {
      return this.handleError(error, 'Failed to get donations by creator');
    }
  }

  async makeDonationContribution(userId: number, donationId: number, amount: string, isAnonymous: boolean = false, message?: string, transactionHash?: string): Promise<any> {
    try {
      this.validatePositiveNumber(userId, 'User ID');
      this.validatePositiveNumber(donationId, 'Donation ID');
      this.validateRequired(amount, 'Amount');
      
      if (message) {
        message = this.sanitizeString(message);
      }
      
      // Create contribution
      const contribution = await storage.createDonationContribution({
        userId,
        donationId,
        amount,
        isAnonymous,
        message: message || null,
        transactionHash: transactionHash || null
      });
      
      // Clear relevant caches
      await redis.del(`donation:${donationId}`);
      await redis.del('donations:active');
      
      // Log to Firebase
      await firebase.saveDonationEvent(donationId, 'contribution_made', {
        userId,
        amount,
        isAnonymous,
        transactionHash,
        timestamp: new Date()
      });
      
      return contribution;
    } catch (error) {
      return this.handleError(error, 'Failed to make donation contribution');
    }
  }

  async getDonationContributions(donationId: number): Promise<any[]> {
    try {
      this.validatePositiveNumber(donationId, 'Donation ID');
      
      const contributions = await storage.getDonationContributions(donationId);
      return contributions;
    } catch (error) {
      return this.handleError(error, 'Failed to get donation contributions');
    }
  }

  async getDonationsByOrganizationType(orgType: string): Promise<any[]> {
    try {
      this.validateRequired(orgType, 'Organization type');
      
      const cached = await redis.get(`donations:org:${orgType}`);
      if (cached) return cached;
      
      const donations = await storage.getDonationsByOrganizationType(orgType);
      
      // Cache for 5 minutes
      await redis.set(`donations:org:${orgType}`, donations, 300);
      
      return donations;
    } catch (error) {
      return this.handleError(error, 'Failed to get donations by organization type');
    }
  }

  async getDonationStats(): Promise<any> {
    try {
      const cached = await redis.get('donation:stats');
      if (cached) return cached;
      
      const stats = await storage.getDonationStats();
      
      // Cache for 10 minutes
      await redis.set('donation:stats', stats, 600);
      
      return stats;
    } catch (error) {
      return this.handleError(error, 'Failed to get donation statistics');
    }
  }

  async processStartupFeePayment(donationId: number, transactionHash: string): Promise<void> {
    try {
      this.validatePositiveNumber(donationId, 'Donation ID');
      this.validateRequired(transactionHash, 'Transaction hash');
      
      await storage.processStartupFeePayment(donationId, transactionHash);
      
      // Clear cache
      await redis.del(`donation:${donationId}`);
      
      // Log to Firebase
      await firebase.saveDonationEvent(donationId, 'startup_fee_paid', {
        transactionHash,
        timestamp: new Date()
      });
    } catch (error) {
      return this.handleError(error, 'Failed to process startup fee payment');
    }
  }
}