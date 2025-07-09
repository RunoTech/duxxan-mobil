import { BaseService } from './BaseService';
import { storage } from '../storage';
import { User, InsertUser } from '@shared/schema';
import { redis } from '../../lib/redis';
import { firebase } from '../../lib/firebase';

export class UserService extends BaseService {
  async getUserProfile(userId: number): Promise<User | null> {
    try {
      this.validatePositiveNumber(userId, 'User ID');
      
      // Try cache first
      const cached = await redis.get<User>(`user:${userId}`);
      if (cached) return cached;
      
      const user = await storage.getUser(userId);
      
      // Cache for 5 minutes
      if (user) {
        await redis.set(`user:${userId}`, user, 300);
      }
      
      return user || null;
    } catch (error) {
      return this.handleError(error, 'Failed to get user profile');
    }
  }

  async getUserByWallet(walletAddress: string): Promise<User | null> {
    try {
      this.validateRequired(walletAddress, 'Wallet address');
      
      const user = await storage.getUserByWalletAddress(walletAddress.toLowerCase());
      return user || null;
    } catch (error) {
      return this.handleError(error, 'Failed to get user by wallet');
    }
  }

  async createUser(userData: InsertUser): Promise<User> {
    try {
      this.validateRequired(userData.walletAddress, 'Wallet address');
      this.validateRequired(userData.username, 'Username');
      
      // Normalize wallet address
      userData.walletAddress = userData.walletAddress.toLowerCase();
      userData.username = this.sanitizeString(userData.username);
      
      // Check if user already exists
      const existingUser = await this.getUserByWallet(userData.walletAddress);
      if (existingUser) {
        return existingUser; // Return existing user instead of throwing error
      }
      
      const user = await storage.createUser(userData);
      
      // Cache the new user
      await redis.set(`user:${user.id}`, user, 300);
      
      // Log user creation to Firebase (safely)
      try {
        await firebase.saveUserActivity(user.id, 'user_created', {
          walletAddress: user.walletAddress,
          username: user.username,
          timestamp: new Date()
        });
      } catch (firebaseError) {
        console.log('Firebase logging failed, continuing without it');
      }
      
      return user;
    } catch (error: any) {
      // Handle duplicate key constraint specifically
      if (error.code === '23505' && error.constraint === 'users_wallet_address_unique') {
        const existingUser = await this.getUserByWallet(userData.walletAddress);
        if (existingUser) {
          return existingUser;
        }
      }
      return this.handleError(error, 'Failed to create user');
    }
  }

  async updateUser(userId: number, updates: Partial<InsertUser>): Promise<User | null> {
    try {
      this.validatePositiveNumber(userId, 'User ID');
      
      if (updates.username) {
        updates.username = this.sanitizeString(updates.username);
      }
      
      const user = await storage.updateUser(userId, updates);
      
      if (user) {
        // Update cache
        await redis.set(`user:${userId}`, user, 300);
        
        // Log update to Firebase
        await firebase.saveUserActivity(userId, 'user_updated', {
          updates,
          timestamp: new Date()
        });
      }
      
      return user || null;
    } catch (error) {
      return this.handleError(error, 'Failed to update user');
    }
  }

  async getUserStats(userId: number): Promise<{
    totalRaffles: number;
    totalDonations: number;
    totalSpent: string;
    totalWon: string;
  }> {
    try {
      this.validatePositiveNumber(userId, 'User ID');
      
      // Try cache first
      const cached = await redis.get(`user:${userId}:stats`);
      if (cached) return cached;
      
      const stats = await storage.getUserStats(userId);
      
      // Cache for 10 minutes
      await redis.set(`user:${userId}:stats`, stats, 600);
      
      return stats;
    } catch (error) {
      return this.handleError(error, 'Failed to get user stats');
    }
  }

  async deleteUser(userId: number): Promise<boolean> {
    try {
      this.validatePositiveNumber(userId, 'User ID');
      
      const deleted = await storage.deleteUser(userId);
      
      if (deleted) {
        // Clear cache
        await redis.del(`user:${userId}`);
        await redis.del(`user:${userId}:stats`);
        
        // Log deletion to Firebase
        await firebase.saveUserActivity(userId, 'user_deleted', {
          timestamp: new Date()
        });
      }
      
      return deleted;
    } catch (error) {
      return this.handleError(error, 'Failed to delete user');
    }
  }
}