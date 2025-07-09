import { BaseService } from './BaseService';
import { storage } from '../storage';
import { db } from '../db';
import { users, raffles, donations, tickets, donationContributions } from '@shared/schema';
import { eq, desc, sql, and, gte, lte, like, or, count } from 'drizzle-orm';
import { redis } from '../../lib/redis';
import { firebase } from '../../lib/firebase';
import crypto from 'crypto';

interface DashboardStats {
  totalUsers: number;
  totalRaffles: number;
  totalDonations: number;
  totalRevenue: string;
  activeRaffles: number;
  activeDonations: number;
  pendingApprovals: number;
  flaggedContent: number;
  todaySignups: number;
  todayRaffles: number;
  todayDonations: number;
  averageTicketPrice: string;
  topCreator: any;
  platformFees: string;
}

interface UserFilters {
  page: number;
  limit: number;
  search?: string;
  status?: string;
}

interface RaffleFilters {
  page: number;
  limit: number;
  status?: string;
}

export class AdminService extends BaseService {
  
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Get total counts
      const [totalUsersResult] = await db.select({ count: count() }).from(users);
      const [totalRafflesResult] = await db.select({ count: count() }).from(raffles);
      const [totalDonationsResult] = await db.select({ count: count() }).from(donations);

      // Get active counts
      const [activeRafflesResult] = await db
        .select({ count: count() })
        .from(raffles)
        .where(eq(raffles.isActive, true));

      const [activeDonationsResult] = await db
        .select({ count: count() })
        .from(donations)
        .where(eq(donations.isActive, true));

      // Get pending approvals
      const [pendingApprovalsResult] = await db
        .select({ count: count() })
        .from(users)
        .where(eq(users.accountStatus, 'pending_approval'));

      // Get today's signups
      const [todaySignupsResult] = await db
        .select({ count: count() })
        .from(users)
        .where(gte(users.createdAt, today));

      // Get today's raffles
      const [todayRafflesResult] = await db
        .select({ count: count() })
        .from(raffles)
        .where(gte(raffles.createdAt, today));

      // Get today's donations
      const [todayDonationsResult] = await db
        .select({ count: count() })
        .from(donations)
        .where(gte(donations.createdAt, today));

      // Calculate total revenue (platform fees)
      const [revenueResult] = await db
        .select({ 
          totalRevenue: sql<string>`COALESCE(SUM(${tickets.totalAmount} * 0.05), 0)` 
        })
        .from(tickets);

      // Calculate average ticket price
      const [avgTicketResult] = await db
        .select({ 
          avgPrice: sql<string>`COALESCE(AVG(${raffles.ticketPrice}), 0)` 
        })
        .from(raffles);

      // Get top creator
      const topCreator = await db
        .select({
          creatorId: raffles.creatorId,
          username: users.username,
          totalRaffles: count(raffles.id)
        })
        .from(raffles)
        .innerJoin(users, eq(raffles.creatorId, users.id))
        .groupBy(raffles.creatorId, users.username)
        .orderBy(desc(count(raffles.id)))
        .limit(1);

      return {
        totalUsers: totalUsersResult.count,
        totalRaffles: totalRafflesResult.count,
        totalDonations: totalDonationsResult.count,
        totalRevenue: revenueResult.totalRevenue || '0',
        activeRaffles: activeRafflesResult.count,
        activeDonations: activeDonationsResult.count,
        pendingApprovals: pendingApprovalsResult.count,
        flaggedContent: 0, // TODO: Implement flagged content tracking
        todaySignups: todaySignupsResult.count,
        todayRaffles: todayRafflesResult.count,
        todayDonations: todayDonationsResult.count,
        averageTicketPrice: avgTicketResult.avgPrice || '0',
        topCreator: topCreator[0] || null,
        platformFees: revenueResult.totalRevenue || '0'
      };
    } catch (error) {
      return this.handleError(error, 'Failed to get dashboard stats');
    }
  }

  async getUsers(filters: UserFilters): Promise<any> {
    try {
      const offset = (filters.page - 1) * filters.limit;
      let query = db.select().from(users);

      // Apply search filter
      if (filters.search) {
        query = query.where(
          or(
            like(users.username, `%${filters.search}%`),
            like(users.walletAddress, `%${filters.search}%`),
            like(users.email, `%${filters.search}%`)
          )
        ) as any;
      }

      // Apply status filter
      if (filters.status && filters.status !== 'all') {
        query = query.where(eq(users.accountStatus, filters.status)) as any;
      }

      const result = await query
        .orderBy(desc(users.createdAt))
        .limit(filters.limit)
        .offset(offset);

      // Get user stats for each user
      const usersWithStats = await Promise.all(
        result.map(async (user) => {
          const userStats = await storage.getUserStats(user.id);
          return {
            ...user,
            ...userStats,
            lastLogin: await this.getLastLogin(user.id)
          };
        })
      );

      // Get total count for pagination
      const [totalResult] = await db.select({ count: count() }).from(users);

      return {
        data: usersWithStats,
        pagination: {
          page: filters.page,
          limit: filters.limit,
          total: totalResult.count,
          pages: Math.ceil(totalResult.count / filters.limit)
        }
      };
    } catch (error) {
      return this.handleError(error, 'Failed to get users');
    }
  }

  async getRaffles(filters: RaffleFilters): Promise<any> {
    try {
      const offset = (filters.page - 1) * filters.limit;
      
      console.log('AdminService.getRaffles - fetching raffles with filters:', filters);
      
      const result = await db
        .select({
          raffle: raffles,
          creator: users,
          category: {
            id: sql<number>`1`,
            name: sql<string>`'General'`,
            slug: sql<string>`'general'`
          }
        })
        .from(raffles)
        .innerJoin(users, eq(raffles.creatorId, users.id))
        .orderBy(desc(raffles.createdAt))
        .limit(filters.limit)
        .offset(offset);

      console.log('AdminService.getRaffles - found raffles:', result.length);

      const rafflesData = result.map(row => ({
        ...row.raffle,
        creator: row.creator,
        category: row.category
      }));

      // Get total count
      const [totalResult] = await db.select({ count: count() }).from(raffles);

      const response = {
        data: rafflesData,
        pagination: {
          page: filters.page,
          limit: filters.limit,
          total: totalResult.count,
          pages: Math.ceil(totalResult.count / filters.limit)
        }
      };

      console.log('AdminService.getRaffles - returning:', response.data.length, 'raffles, total:', response.pagination.total);
      console.log('AdminService.getRaffles - first raffle sample:', response.data[0] ? { 
        id: response.data[0].id, 
        title: response.data[0].title 
      } : 'no data');
      
      return response;
    } catch (error) {
      console.error('AdminService.getRaffles - error:', error);
      return this.handleError(error, 'Failed to get raffles');
    }
  }

  async getDonations(filters: RaffleFilters): Promise<any> {
    try {
      const offset = (filters.page - 1) * filters.limit;
      
      const result = await db
        .select({
          donation: donations,
          creator: users
        })
        .from(donations)
        .innerJoin(users, eq(donations.creatorId, users.id))
        .orderBy(desc(donations.createdAt))
        .limit(filters.limit)
        .offset(offset);

      const donationsData = result.map(row => ({
        ...row.donation,
        creator: row.creator
      }));

      // Get total count
      const [totalResult] = await db.select({ count: count() }).from(donations);

      const response = {
        data: donationsData,
        pagination: {
          page: filters.page,
          limit: filters.limit,
          total: totalResult.count,
          pages: Math.ceil(totalResult.count / filters.limit)
        }
      };

      console.log('AdminService.getDonations - returning:', response.data.length, 'donations, total:', response.pagination.total);
      return response;
    } catch (error) {
      return this.handleError(error, 'Failed to get donations');
    }
  }

  async getWalletData(): Promise<any> {
    try {
      // Get wallet information with balances
      const result = await db
        .select({
          user: users,
          totalSpent: sql<string>`COALESCE(SUM(${tickets.totalAmount}), '0')`,
          totalTickets: sql<number>`COALESCE(COUNT(${tickets.id}), 0)`,
          totalDonated: sql<string>`COALESCE(SUM(${donationContributions.amount}), '0')`
        })
        .from(users)
        .leftJoin(tickets, eq(users.id, tickets.userId))
        .leftJoin(donationContributions, eq(users.id, donationContributions.userId))
        .groupBy(users.id)
        .orderBy(desc(sql`COALESCE(SUM(${tickets.totalAmount}), 0)`));

      const response = {
        data: result.map(row => ({
          ...row.user,
          walletStats: {
            totalSpent: row.totalSpent,
            totalTickets: row.totalTickets,
            totalDonated: row.totalDonated,
            // Note: We can't get actual wallet balance without calling blockchain
            // This would require implementing Web3 calls to get USDT balance
            currentBalance: 'N/A' // TODO: Implement real balance checking
          }
        }))
      };

      console.log('AdminService.getWalletData - returning:', response.data.length, 'wallets');
      return response;
    } catch (error) {
      return this.handleError(error, 'Failed to get wallet data');
    }
  }

  async selectRaffleWinner(raffleId: number, method: string = 'random', winnerId?: number, adminId?: number): Promise<any> {
    try {
      const raffle = await storage.getRaffleById(raffleId);
      if (!raffle) {
        throw new Error('Raffle not found');
      }

      if (raffle.winnerId) {
        throw new Error('Winner already selected for this raffle');
      }

      let selectedWinnerId: number;

      if (method === 'manual' && winnerId) {
        // Manual selection
        selectedWinnerId = winnerId;
      } else {
        // Random selection from ticket holders
        const participants = await this.getRaffleParticipants(raffleId);
        if (participants.data.length === 0) {
          throw new Error('No participants found for this raffle');
        }

        // Create weighted array based on ticket quantities
        const weightedParticipants: number[] = [];
        participants.data.forEach((participant: any) => {
          for (let i = 0; i < participant.ticketCount; i++) {
            weightedParticipants.push(participant.userId);
          }
        });

        // Select random winner
        const randomIndex = Math.floor(Math.random() * weightedParticipants.length);
        selectedWinnerId = weightedParticipants[randomIndex];
      }

      // Update raffle with winner
      const now = new Date();
      const approvalDeadline = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

      await db
        .update(raffles)
        .set({
          winnerId: selectedWinnerId,
          winnerSelectedAt: now,
          approvalDeadline: approvalDeadline,
          isActive: false // End the raffle
        })
        .where(eq(raffles.id, raffleId));

      // Log the action
      await this.logAdminAction(adminId, 'select_winner', {
        raffleId,
        winnerId: selectedWinnerId,
        method,
        timestamp: now
      });

      // Get winner details
      const winner = await storage.getUser(selectedWinnerId);

      return {
        raffleId,
        winnerId: selectedWinnerId,
        winner: winner,
        method,
        selectedAt: now,
        approvalDeadline
      };
    } catch (error) {
      return this.handleError(error, 'Failed to select winner');
    }
  }

  async performUserAction(userId: number, action: string, reason?: string, adminId?: number): Promise<any> {
    try {
      const user = await storage.getUser(userId);
      if (!user) {
        throw new Error('User not found');
      }

      let updates: any = {};

      switch (action) {
        case 'activate':
          updates.accountStatus = 'active';
          break;
        case 'deactivate':
          updates.accountStatus = 'inactive';
          break;
        case 'ban':
          updates.accountStatus = 'banned';
          break;
        case 'unban':
          updates.accountStatus = 'active';
          break;
        case 'verify':
          updates.isVerified = true;
          updates.accountStatus = 'active';
          break;
        case 'unverify':
          updates.isVerified = false;
          break;
        default:
          throw new Error('Invalid action');
      }

      // Update user
      await db.update(users).set(updates).where(eq(users.id, userId));

      // Log the action
      await this.logAdminAction(adminId, 'user_action', {
        userId,
        action,
        reason,
        timestamp: new Date()
      });

      return {
        userId,
        action,
        reason,
        updatedFields: updates
      };
    } catch (error) {
      return this.handleError(error, 'Failed to perform user action');
    }
  }

  async performRaffleAction(raffleId: number, action: string, adminId?: number): Promise<any> {
    try {
      const raffle = await storage.getRaffleById(raffleId);
      if (!raffle) {
        throw new Error('Raffle not found');
      }

      let updates: any = {};

      switch (action) {
        case 'activate':
          updates.isActive = true;
          break;
        case 'deactivate':
          updates.isActive = false;
          break;
        case 'end':
          updates.isActive = false;
          updates.endDate = new Date();
          break;
        case 'extend':
          // Extend by 7 days
          const newEndDate = new Date(raffle.endDate);
          newEndDate.setDate(newEndDate.getDate() + 7);
          updates.endDate = newEndDate;
          break;
        default:
          throw new Error('Invalid action');
      }

      // Update raffle
      await db.update(raffles).set(updates).where(eq(raffles.id, raffleId));

      // Log the action
      await this.logAdminAction(adminId, 'raffle_action', {
        raffleId,
        action,
        timestamp: new Date()
      });

      return {
        raffleId,
        action,
        updatedFields: updates
      };
    } catch (error) {
      return this.handleError(error, 'Failed to perform raffle action');
    }
  }

  async getRaffleParticipants(raffleId: number): Promise<any> {
    try {
      const participants = await db
        .select({
          userId: tickets.userId,
          user: users,
          ticketCount: sql<number>`SUM(${tickets.quantity})`,
          totalAmount: sql<string>`SUM(${tickets.totalAmount})`,
          lastPurchase: sql<Date>`MAX(${tickets.createdAt})`
        })
        .from(tickets)
        .innerJoin(users, eq(tickets.userId, users.id))
        .where(eq(tickets.raffleId, raffleId))
        .groupBy(tickets.userId, users.id)
        .orderBy(desc(sql`SUM(${tickets.quantity})`));

      return {
        data: participants.map(p => ({
          userId: p.userId,
          username: p.user.username,
          walletAddress: p.user.walletAddress,
          ticketCount: p.ticketCount,
          totalAmount: p.totalAmount,
          lastPurchase: p.lastPurchase
        }))
      };
    } catch (error) {
      return this.handleError(error, 'Failed to get raffle participants');
    }
  }

  async createManualRaffle(raffleData: any, adminId: number): Promise<any> {
    try {
      // Create manual raffle with admin flags
      const raffle = await storage.createRaffle({
        ...raffleData,
        creatorId: adminId,
        isManual: true,
        createdByAdmin: true,
        transactionHash: null // Manual raffles don't require transaction
      });

      // Log the action
      await this.logAdminAction(adminId, 'create_manual_raffle', {
        raffleId: raffle.id,
        title: raffle.title,
        timestamp: new Date()
      });

      return raffle;
    } catch (error) {
      return this.handleError(error, 'Failed to create manual raffle');
    }
  }

  async createManualDonation(donationData: any, adminId: number): Promise<any> {
    try {
      // Create manual donation with admin flags
      const donation = await storage.createDonation({
        ...donationData,
        creatorId: adminId,
        isManual: true,
        createdByAdmin: true
      });

      // Log the action
      await this.logAdminAction(adminId, 'create_manual_donation', {
        donationId: donation.id,
        title: donation.title,
        timestamp: new Date()
      });

      return donation;
    } catch (error) {
      return this.handleError(error, 'Failed to create manual donation');
    }
  }

  async getUserDetails(userId: number): Promise<any> {
    try {
      const user = await storage.getUser(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const userStats = await storage.getUserStats(userId);
      const lastLogin = await this.getLastLogin(userId);

      // Get user's raffles
      const userRaffles = await storage.getRafflesByCreator(userId);

      // Get user's tickets
      const userTickets = await db
        .select({
          ticket: tickets,
          raffle: raffles
        })
        .from(tickets)
        .innerJoin(raffles, eq(tickets.raffleId, raffles.id))
        .where(eq(tickets.userId, userId))
        .orderBy(desc(tickets.createdAt));

      // Get user's donations
      const userDonations = await db
        .select({
          contribution: donationContributions,
          donation: donations
        })
        .from(donationContributions)
        .innerJoin(donations, eq(donationContributions.donationId, donations.id))
        .where(eq(donationContributions.userId, userId))
        .orderBy(desc(donationContributions.createdAt));

      return {
        user,
        stats: userStats,
        lastLogin,
        raffles: userRaffles,
        tickets: userTickets.map(t => ({ ...t.ticket, raffle: t.raffle })),
        donations: userDonations.map(d => ({ ...d.contribution, donation: d.donation }))
      };
    } catch (error) {
      return this.handleError(error, 'Failed to get user details');
    }
  }

  async getSystemLogs(filters: any): Promise<any> {
    try {
      // TODO: Implement system logs retrieval from Redis or database
      // This would require implementing a logging system first
      
      return {
        data: [
          {
            id: 1,
            type: 'admin_action',
            message: 'Admin selected winner for raffle #75',
            timestamp: new Date(),
            adminId: 1
          }
        ],
        pagination: {
          page: filters.page,
          limit: filters.limit,
          total: 1,
          pages: 1
        }
      };
    } catch (error) {
      return this.handleError(error, 'Failed to get system logs');
    }
  }

  async getAnalytics(period: string): Promise<any> {
    try {
      // Calculate date range based on period
      const now = new Date();
      let startDate = new Date();
      
      switch (period) {
        case '7d':
          startDate.setDate(now.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(now.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(now.getDate() - 90);
          break;
        default:
          startDate.setDate(now.getDate() - 30);
      }

      // Get analytics data
      const userGrowth = await this.getUserGrowthAnalytics(startDate, now);
      const revenueAnalytics = await this.getRevenueAnalytics(startDate, now);
      const raffleAnalytics = await this.getRaffleAnalytics(startDate, now);

      return {
        period,
        userGrowth,
        revenue: revenueAnalytics,
        raffles: raffleAnalytics
      };
    } catch (error) {
      return this.handleError(error, 'Failed to get analytics');
    }
  }

  async updatePlatformSettings(settings: any, adminId: number): Promise<any> {
    try {
      // TODO: Implement platform settings storage and update
      // This would require a settings table or Redis storage
      
      await this.logAdminAction(adminId, 'update_settings', {
        settings,
        timestamp: new Date()
      });

      return {
        success: true,
        updatedSettings: settings
      };
    } catch (error) {
      return this.handleError(error, 'Failed to update platform settings');
    }
  }

  // Helper methods
  private async getLastLogin(userId: number): Promise<Date | null> {
    try {
      // Get last login from Redis session data
      const sessionKey = `duxxan:user:${userId}:session`;
      const lastLogin = await redis.hget(sessionKey, 'lastLoginTime');
      return lastLogin ? new Date(lastLogin) : null;
    } catch (error) {
      return null;
    }
  }

  private async logAdminAction(adminId: number | undefined, action: string, data: any): Promise<void> {
    try {
      if (!adminId) return;

      // Log to Firebase
      await firebase.saveUserActivity(adminId, 'admin_action', {
        action,
        data,
        timestamp: new Date().toISOString()
      });

      // Also log to Redis for quick access
      const logKey = `duxxan:admin:logs:${Date.now()}`;
      await redis.hset(logKey, {
        adminId: adminId.toString(),
        action,
        data: JSON.stringify(data),
        timestamp: new Date().toISOString()
      });
      await redis.expire(logKey, 86400 * 30); // Keep for 30 days
    } catch (error) {
      console.warn('Failed to log admin action:', error);
    }
  }

  private async getUserGrowthAnalytics(startDate: Date, endDate: Date): Promise<any> {
    try {
      const result = await db
        .select({
          date: sql<string>`DATE(${users.createdAt})`,
          count: count()
        })
        .from(users)
        .where(and(gte(users.createdAt, startDate), lte(users.createdAt, endDate)))
        .groupBy(sql`DATE(${users.createdAt})`)
        .orderBy(sql`DATE(${users.createdAt})`);

      return result;
    } catch (error) {
      return [];
    }
  }

  private async getRevenueAnalytics(startDate: Date, endDate: Date): Promise<any> {
    try {
      const result = await db
        .select({
          date: sql<string>`DATE(${tickets.createdAt})`,
          revenue: sql<string>`SUM(${tickets.totalAmount} * 0.05)`,
          transactions: count()
        })
        .from(tickets)
        .where(and(gte(tickets.createdAt, startDate), lte(tickets.createdAt, endDate)))
        .groupBy(sql`DATE(${tickets.createdAt})`)
        .orderBy(sql`DATE(${tickets.createdAt})`);

      return result;
    } catch (error) {
      return [];
    }
  }

  private async getRaffleAnalytics(startDate: Date, endDate: Date): Promise<any> {
    try {
      const result = await db
        .select({
          date: sql<string>`DATE(${raffles.createdAt})`,
          count: count(),
          totalValue: sql<string>`SUM(${raffles.prizeValue})`
        })
        .from(raffles)
        .where(and(gte(raffles.createdAt, startDate), lte(raffles.createdAt, endDate)))
        .groupBy(sql`DATE(${raffles.createdAt})`)
        .orderBy(sql`DATE(${raffles.createdAt})`);

      return result;
    } catch (error) {
      return [];
    }
  }
}