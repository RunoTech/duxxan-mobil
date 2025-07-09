import {
  users,
  raffles,
  donations,
  tickets,
  donationContributions,
  userRatings,
  categories,
  countries,
  mailMessages,
  mailAttachments,
  adminSettings,
  countryRestrictions,
  corporateFunds,
  fundAllocations,
  newCorporateFunds,

  follows,
  userDevices,
  userPhotos,
  channels,
  channelSubscriptions,
  upcomingRaffles,
  upcomingRaffleInterests,
  type User,
  type InsertUser,
  type UserDevice,
  type InsertUserDevice,
  type UserPhoto,
  type InsertUserPhoto,
  type Raffle,
  type InsertRaffle,
  type Donation,
  type InsertDonation,
  type Ticket,
  type InsertTicket,
  type DonationContribution,
  type InsertDonationContribution,
  type UserRating,
  type InsertUserRating,
  type Category,
  type Channel,
  type InsertChannel,
  type ChannelSubscription,
  type InsertChannelSubscription,
  type UpcomingRaffle,
  type InsertUpcomingRaffle,
  type UpcomingRaffleInterest,
  type InsertUpcomingRaffleInterest,
  type Country,
  // ChatMessage removed
  type MailMessage,
  type InsertMailMessage,
  type MailAttachment,
  type InsertMailAttachment,
  type CorporateFund,
  type InsertCorporateFund,
  type OldCorporateFund,
  type InsertOldCorporateFund,
  type FundAllocation,
  type InsertFundAllocation
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, and, sql, gt, lt } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByWalletAddress(walletAddress: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User>;
  deleteUser(id: number): Promise<boolean>;
  getUserStats(userId: number): Promise<{
    totalRaffles: number;
    totalDonations: number;
    totalSpent: string;
    totalWon: string;
  }>;
  
  // User Devices
  createUserDevice(device: InsertUserDevice & { userId: number }): Promise<UserDevice>;
  getUserDevices(userId: number): Promise<UserDevice[]>;
  updateUserDeviceLastLogin(deviceId: number): Promise<void>;
  
  // User Photos
  createUserPhoto(photo: InsertUserPhoto & { userId: number }): Promise<UserPhoto>;
  getUserPhotos(userId: number, photoType?: string): Promise<UserPhoto[]>;
  deleteUserPhoto(photoId: number, userId: number): Promise<void>;
  
  // Categories
  getCategories(): Promise<Category[]>;
  
  // Countries
  getCountries(): Promise<Country[]>;
  getCountryByCode(code: string): Promise<Country | undefined>;
  createCountry(country: Omit<Country, 'id'>): Promise<Country>;
  
  // Raffles
  getRaffles(limit?: number, offset?: number): Promise<(Raffle & { creator: User; category: Category })[]>;
  getRaffleById(id: number): Promise<(Raffle & { creator: User; category: Category }) | undefined>;
  createRaffle(raffle: InsertRaffle & { creatorId: number }): Promise<Raffle>;
  updateRaffle(id: number, updates: Partial<Raffle>): Promise<Raffle>;
  getRafflesByCreator(creatorId: number): Promise<Raffle[]>;
  getActiveRaffles(): Promise<(Raffle & { creator: User; category: Category })[]>;
  
  // Tickets
  createTicket(ticket: InsertTicket & { userId: number }): Promise<Ticket>;
  getTicketsByRaffle(raffleId: number): Promise<(Ticket & { user: User })[]>;
  getTicketsByUser(userId: number): Promise<(Ticket & { raffle: Raffle })[]>;
  
  // Donations
  getDonations(limit?: number, offset?: number, filter?: string): Promise<(Donation & { creator: User })[]>;
  getDonationById(id: number): Promise<(Donation & { creator: User }) | undefined>;
  createDonation(donation: InsertDonation & { creatorId: number }): Promise<Donation>;
  updateDonation(id: number, updates: Partial<Donation>): Promise<Donation>;
  getActiveDonations(): Promise<(Donation & { creator: User })[]>;
  getDonationsByCreator(creatorId: number): Promise<Donation[]>;
  getDonationsByOrganizationType(orgType: string): Promise<(Donation & { creator: User })[]>;
  processStartupFeePayment(donationId: number, transactionHash: string): Promise<void>;
  getDonationStats(): Promise<{
    totalDonations: number;
    totalCommissionCollected: string;
    organizationDonations: number;
    individualDonations: number;
  }>;
  
  // Donation Contributions
  createDonationContribution(contribution: InsertDonationContribution & { userId: number }): Promise<DonationContribution>;
  getDonationContributions(donationId: number): Promise<(DonationContribution & { user: User })[]>;
  
  // User Ratings
  createUserRating(rating: InsertUserRating & { raterId: number }): Promise<UserRating>;
  getUserRatings(userId: number): Promise<UserRating[]>;
  
  // Chat Messages
  // Mail System
  getMailMessages(walletAddress: string, category?: string): Promise<MailMessage[]>;
  sendMailMessage(message: InsertMailMessage): Promise<MailMessage>;
  markMailAsRead(messageId: number, walletAddress: string): Promise<boolean>;
  markMailAsStarred(messageId: number, walletAddress: string, starred: boolean): Promise<boolean>;
  getUnreadMailCount(walletAddress: string): Promise<number>;
  sendSystemNotification(toWalletAddress: string, subject: string, content: string, raffleId?: number): Promise<MailMessage>;
  sendCommunityMessage(fromWalletAddress: string, communityId: number, subject: string, content: string): Promise<number>;
  
  // Platform Stats
  getPlatformStats(): Promise<{
    totalRaffles: number;
    totalPrizePool: string;
    totalDonations: string;
    activeUsers: number;
  }>;

  // Admin-specific methods
  getAdminStats(): Promise<any>;
  getAnalytics(): Promise<any>;
  getAllUsers(): Promise<User[]>;
  getUserById(id: number): Promise<User | undefined>;
  getAllRaffles(): Promise<Raffle[]>;
  getRaffleParticipants(raffleId: number): Promise<any[]>;
  getAllDonations(): Promise<Donation[]>;
  getAllWallets(): Promise<any[]>;
  getAllCountryRestrictions(): Promise<any[]>;
  createCountryRestriction(restriction: any): Promise<any>;
  updateCountryRestriction(id: number, updates: any): Promise<any>;
  getDraftRaffles(): Promise<any[]>;
  approveRaffle(id: number, approve: boolean): Promise<any>;
  getAllAdminSettings(): Promise<any[]>;
  updateAdminSetting(key: string, value: string): Promise<any>;

  // Corporate Funds (Old System)
  getCorporateFunds(): Promise<OldCorporateFund[]>;
  getCorporateFundById(id: number): Promise<OldCorporateFund | undefined>;
  createCorporateFund(fund: InsertOldCorporateFund & { managerId: number; availableAmount: string }): Promise<OldCorporateFund>;
  updateCorporateFund(id: number, updates: Partial<OldCorporateFund>): Promise<OldCorporateFund | undefined>;

  // New Corporate Funds (CorporateFundsPage)
  getAllNewCorporateFunds(): Promise<CorporateFund[]>;
  getNewCorporateFundById(id: number): Promise<CorporateFund | undefined>;
  createNewCorporateFund(fund: InsertCorporateFund & { creatorId: number }): Promise<CorporateFund>;
  updateNewCorporateFund(id: number, updates: Partial<InsertCorporateFund>): Promise<CorporateFund | undefined>;
  getNewCorporateFundStatistics(): Promise<{
    totalFunds: number;
    totalTargetAmount: string;
    totalCurrentAmount: string;
    activeFunds: number;
  }>;
  getFundAllocations(fundId: number): Promise<FundAllocation[]>;
  createFundAllocation(allocation: InsertFundAllocation): Promise<FundAllocation>;
  approveFundAllocation(id: number, approvedBy: number): Promise<FundAllocation | undefined>;
  rejectFundAllocation(id: number, rejectedBy: number, rejectionReason: string): Promise<FundAllocation | undefined>;
  disburseFundAllocation(id: number, transactionHash: string): Promise<FundAllocation | undefined>;
  getCorporateFundStatistics(): Promise<{
    totalFunds: number;
    totalCapital: string;
    totalAllocated: string;
    totalAvailable: string;
    pendingAllocations: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  private async withErrorHandling<T>(operation: () => Promise<T>, operationName: string): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      console.error(`Database operation failed [${operationName}]:`, error);
      throw new Error(`Database operation failed: ${operationName}`);
    }
  }

  async getUserByWalletAddress(walletAddress: string): Promise<User | undefined> {
    return this.withErrorHandling(async () => {
      const [user] = await db.select().from(users).where(eq(users.walletAddress, walletAddress));
      return user || undefined;
    }, 'getUserByWalletAddress');
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User> {
    const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return user;
  }

  async getPendingApprovals(): Promise<User[]> {
    return await db.select()
      .from(users)
      .where(eq(users.accountStatus, 'pending_approval'))
      .orderBy(users.accountSubmittedAt);
  }

  async approveAccount(walletAddress: string): Promise<User> {
    const [user] = await db.update(users)
      .set({
        accountStatus: 'active',
        accountApprovedAt: new Date(),
        accountRejectedAt: null,
        rejectionReason: null
      })
      .where(eq(users.walletAddress, walletAddress))
      .returning();
    
    if (!user) {
      throw new Error('User not found');
    }
    
    return user;
  }

  async rejectAccount(walletAddress: string, reason: string): Promise<User> {
    const [user] = await db.update(users)
      .set({
        accountStatus: 'rejected',
        accountRejectedAt: new Date(),
        rejectionReason: reason,
        // Kurumsal hesap bilgilerini temizle
        organizationType: 'individual',
        organizationName: null
      })
      .where(eq(users.walletAddress, walletAddress))
      .returning();
    
    if (!user) {
      throw new Error('User not found');
    }
    
    return user;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.withErrorHandling(async () => {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user || undefined;
    }, 'getUser');
  }

  async deleteUser(id: number): Promise<boolean> {
    return this.withErrorHandling(async () => {
      const result = await db.delete(users).where(eq(users.id, id));
      return (result.rowCount || 0) > 0;
    }, 'deleteUser');
  }

  async getUserStats(userId: number): Promise<{
    totalRaffles: number;
    totalDonations: number;
    totalSpent: string;
    totalWon: string;
  }> {
    return this.withErrorHandling(async () => {
      // Get raffle statistics
      const raffleStats = await db.select({
        count: sql<number>`count(*)::int`,
        totalSpent: sql<string>`coalesce(sum(${tickets.totalAmount}), '0')`
      }).from(tickets).where(eq(tickets.userId, userId));

      // Get donation statistics  
      const donationStats = await db.select({
        count: sql<number>`count(*)::int`,
        totalDonated: sql<string>`coalesce(sum(${donationContributions.amount}), '0')`
      }).from(donationContributions).where(eq(donationContributions.userId, userId));

      // Get won raffles (this would need a winners table in a real implementation)
      const totalWon = "0"; // Placeholder until winners tracking is implemented

      return {
        totalRaffles: raffleStats[0]?.count || 0,
        totalDonations: donationStats[0]?.count || 0,
        totalSpent: raffleStats[0]?.totalSpent || "0",
        totalWon
      };
    }, 'getUserStats');
  }

  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(asc(categories.name));
  }

  async getCountries(): Promise<Country[]> {
    return await db.select().from(countries).where(eq(countries.isActive, true)).orderBy(asc(countries.name));
  }

  async getCountryByCode(code: string): Promise<Country | undefined> {
    const [country] = await db.select().from(countries).where(eq(countries.code, code));
    return country || undefined;
  }

  async createCountry(country: Omit<Country, 'id'>): Promise<Country> {
    const [newCountry] = await db.insert(countries).values(country).returning();
    return newCountry;
  }

  async getRaffles(limit = 20, offset = 0): Promise<(Raffle & { creator: User; category: Category })[]> {
    return await db
      .select()
      .from(raffles)
      .innerJoin(users, eq(raffles.creatorId, users.id))
      .innerJoin(categories, eq(raffles.categoryId, categories.id))
      .where(eq(raffles.isActive, true))
      .orderBy(desc(raffles.createdAt))
      .limit(limit)
      .offset(offset)
      .then(rows => rows.map(row => ({ ...row.raffles, creator: row.users, category: row.categories })));
  }

  async getRaffleById(id: number): Promise<(Raffle & { creator: User; category: Category }) | undefined> {
    const [result] = await db
      .select({
        raffle: raffles,
        creator: users,
        category: categories
      })
      .from(raffles)
      .innerJoin(users, eq(raffles.creatorId, users.id))
      .innerJoin(categories, eq(raffles.categoryId, categories.id))
      .where(eq(raffles.id, id));
    
    if (!result) return undefined;
    
    const raffleData = {
      ...result.raffle,
      creator: result.creator,
      category: result.category
    };
    
    console.log('Storage getRaffleById - returning:', {
      id: raffleData.id,
      title: raffleData.title,
      images: (raffleData as any).images || 'undefined',
      imagesType: typeof (raffleData as any).images
    });
    
    return raffleData;
  }

  async createRaffle(raffle: InsertRaffle & { creatorId: number }): Promise<Raffle> {
    const [newRaffle] = await db.insert(raffles).values(raffle).returning();
    return newRaffle;
  }

  async updateRaffle(id: number, updates: Partial<Raffle>): Promise<Raffle> {
    const [raffle] = await db.update(raffles).set(updates).where(eq(raffles.id, id)).returning();
    return raffle;
  }

  async getRafflesByCreator(creatorId: number): Promise<Raffle[]> {
    return await db.select().from(raffles).where(eq(raffles.creatorId, creatorId)).orderBy(desc(raffles.createdAt));
  }

  async getActiveRaffles(): Promise<(Raffle & { creator: User; category: Category })[]> {
    try {
      console.log('Fetching active raffles...');
      const rows = await db
        .select({
          raffle: raffles,
          creator: users,
          category: categories
        })
        .from(raffles)
        .innerJoin(users, eq(raffles.creatorId, users.id))
        .innerJoin(categories, eq(raffles.categoryId, categories.id))
        .where(eq(raffles.isActive, true))
        .orderBy(desc(raffles.createdAt));
      
      console.log(`Found ${rows.length} active raffles`);
      return rows.map(row => ({ 
        ...row.raffle, 
        creator: row.creator, 
        category: row.category 
      }));
    } catch (error) {
      console.error('Error in getActiveRaffles:', error);
      return [];
    }
  }

  async createTicket(ticket: InsertTicket & { userId: number }): Promise<Ticket> {
    const [newTicket] = await db.insert(tickets).values(ticket).returning();
    
    // Update raffle tickets sold count
    await db
      .update(raffles)
      .set({ ticketsSold: sql`${raffles.ticketsSold} + ${ticket.quantity}` })
      .where(eq(raffles.id, ticket.raffleId));
    
    return newTicket;
  }

  async getTicketsByRaffle(raffleId: number): Promise<(Ticket & { user: User })[]> {
    return await db
      .select()
      .from(tickets)
      .innerJoin(users, eq(tickets.userId, users.id))
      .where(eq(tickets.raffleId, raffleId))
      .orderBy(desc(tickets.createdAt))
      .then(rows => rows.map(row => ({ ...row.tickets, user: row.users })));
  }

  async getTicketsByUser(userId: number): Promise<(Ticket & { raffle: Raffle })[]> {
    return await db
      .select()
      .from(tickets)
      .innerJoin(raffles, eq(tickets.raffleId, raffles.id))
      .where(eq(tickets.userId, userId))
      .orderBy(desc(tickets.createdAt))
      .then(rows => rows.map(row => ({ ...row.tickets, raffle: row.raffles })));
  }

  async getDonations(limit = 20, offset = 0, filter?: string): Promise<(Donation & { creator: User })[]> {
    const result = await db
      .select({
        donation: donations,
        creator: users,
      })
      .from(donations)
      .innerJoin(users, eq(donations.creatorId, users.id))
      .orderBy(desc(donations.createdAt))
      .limit(limit)
      .offset(offset);
    
    return result.map(row => ({ ...row.donation, creator: row.creator }));
  }

  async getDonationById(id: number): Promise<(Donation & { creator: User }) | undefined> {
    const [result] = await db
      .select({
        donation: donations,
        creator: users,
      })
      .from(donations)
      .innerJoin(users, eq(donations.creatorId, users.id))
      .where(eq(donations.id, id));
    
    return result ? { ...result.donation, creator: result.creator } : undefined;
  }

  async createDonation(donation: InsertDonation & { creatorId: number }): Promise<Donation> {
    // Get user info to determine commission rate and startup fee
    const [user] = await db.select().from(users).where(eq(users.id, donation.creatorId));
    
    let commissionRate = "10.00"; // Default 10% for individuals
    let startupFee = "0";
    
    if (user && user.organizationType !== "individual") {
      commissionRate = "2.00"; // 2% for organizations
      if (donation.isUnlimited) {
        startupFee = "100.000000"; // 100 USDT startup fee for unlimited donations
      }
    }
    
    const donationData = {
      creatorId: donation.creatorId,
      title: donation.title,
      description: donation.description,
      goalAmount: donation.goalAmount,
      endDate: donation.endDate ? new Date(donation.endDate) : null,
      isUnlimited: donation.isUnlimited || false,
      category: donation.category || "general",
      country: donation.country || null,
      commissionRate,
      startupFee,
    };
    
    const [newDonation] = await db.insert(donations).values(donationData).returning();
    return newDonation;
  }

  async updateDonation(id: number, updates: Partial<Donation>): Promise<Donation> {
    const [donation] = await db.update(donations).set(updates).where(eq(donations.id, id)).returning();
    return donation;
  }

  async getActiveDonations(): Promise<(Donation & { creator: User })[]> {
    return await this.getDonations(100, 0);
  }

  async getDonationsByCreator(creatorId: number): Promise<Donation[]> {
    return await db.select().from(donations).where(eq(donations.creatorId, creatorId));
  }

  async createDonationContribution(contribution: InsertDonationContribution & { userId: number }): Promise<DonationContribution> {
    const [newContribution] = await db.insert(donationContributions).values(contribution).returning();
    
    // Update donation current amount and donor count
    await db
      .update(donations)
      .set({
        currentAmount: sql`${donations.currentAmount} + ${contribution.amount}`,
        donorCount: sql`${donations.donorCount} + 1`,
      })
      .where(eq(donations.id, contribution.donationId));
    
    return newContribution;
  }

  async getDonationContributions(donationId: number): Promise<(DonationContribution & { user: User })[]> {
    return await db
      .select()
      .from(donationContributions)
      .innerJoin(users, eq(donationContributions.userId, users.id))
      .where(eq(donationContributions.donationId, donationId))
      .orderBy(desc(donationContributions.createdAt))
      .then(rows => rows.map(row => ({ ...row.donation_contributions, user: row.users })));
  }

  async createUserRating(rating: InsertUserRating & { raterId: number }): Promise<UserRating> {
    const [newRating] = await db.insert(userRatings).values(rating).returning();
    
    // Update user's average rating
    const ratings = await db.select().from(userRatings).where(eq(userRatings.ratedId, rating.ratedId));
    const avgRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
    
    await db
      .update(users)
      .set({
        rating: avgRating.toFixed(1),
        ratingCount: ratings.length,
      })
      .where(eq(users.id, rating.ratedId));
    
    return newRating;
  }

  async getUserRatings(userId: number): Promise<UserRating[]> {
    return await db.select().from(userRatings).where(eq(userRatings.ratedId, userId));
  }

  // Mail System Implementation
  async getMailMessages(walletAddress: string, category?: string): Promise<MailMessage[]> {
    return this.withErrorHandling(async () => {
      let query = db
        .select()
        .from(mailMessages)
        .where(eq(mailMessages.toWalletAddress, walletAddress))
        .orderBy(desc(mailMessages.createdAt));

      if (category && category !== 'all' && category !== 'starred') {
        const baseQuery = db
          .select()
          .from(mailMessages)
          .where(and(
            eq(mailMessages.toWalletAddress, walletAddress),
            eq(mailMessages.category, category)
          ))
          .orderBy(desc(mailMessages.createdAt));
        
        return await baseQuery;
      }

      const messages = await query;
      
      // Filter starred messages if requested
      if (category === 'starred') {
        return messages.filter(msg => msg.isStarred);
      }

      return messages;
    }, 'getMailMessages');
  }

  async sendMailMessage(message: InsertMailMessage): Promise<MailMessage> {
    return this.withErrorHandling(async () => {
      const [newMessage] = await db.insert(mailMessages).values(message).returning();
      return newMessage;
    }, 'sendMailMessage');
  }

  async markMailAsRead(messageId: number, walletAddress: string): Promise<boolean> {
    return this.withErrorHandling(async () => {
      const result = await db
        .update(mailMessages)
        .set({ isRead: true })
        .where(and(
          eq(mailMessages.id, messageId),
          eq(mailMessages.toWalletAddress, walletAddress)
        ));
      
      return (result.rowCount || 0) > 0;
    }, 'markMailAsRead');
  }

  async markMailAsStarred(messageId: number, walletAddress: string, starred: boolean): Promise<boolean> {
    return this.withErrorHandling(async () => {
      const result = await db
        .update(mailMessages)
        .set({ isStarred: starred })
        .where(and(
          eq(mailMessages.id, messageId),
          eq(mailMessages.toWalletAddress, walletAddress)
        ));
      
      return (result.rowCount || 0) > 0;
    }, 'markMailAsStarred');
  }

  async getUnreadMailCount(walletAddress: string): Promise<number> {
    return this.withErrorHandling(async () => {
      const [result] = await db
        .select({ count: sql<number>`count(*)` })
        .from(mailMessages)
        .where(and(
          eq(mailMessages.toWalletAddress, walletAddress),
          eq(mailMessages.isRead, false)
        ));
      
      return result.count || 0;
    }, 'getUnreadMailCount');
  }

  async sendSystemNotification(toWalletAddress: string, subject: string, content: string, raffleId?: number): Promise<MailMessage> {
    return this.withErrorHandling(async () => {
      const message: InsertMailMessage = {
        fromWalletAddress: 'system@duxxan',
        toWalletAddress,
        subject,
        content,
        category: 'system',
        raffleId
      };
      
      return await this.sendMailMessage(message);
    }, 'sendSystemNotification');
  }

  async sendCommunityMessage(fromWalletAddress: string, communityId: number, subject: string, content: string): Promise<number> {
    return this.withErrorHandling(async () => {
      // For now, return 0 since communities table is not fully implemented
      // This will be updated when community system is complete
      console.log('Community message sending not yet implemented');
      return 0;
    }, 'sendCommunityMessage');
  }

  async getPlatformStats(): Promise<{
    totalRaffles: number;
    totalPrizePool: string;
    totalDonations: string;
    activeUsers: number;
  }> {
    const [raffleStats] = await db
      .select({
        count: sql<number>`count(*)`,
        totalPrizePool: sql<string>`sum(${raffles.prizeValue})`,
      })
      .from(raffles)
      .where(eq(raffles.isActive, true));

    const [donationStats] = await db
      .select({
        totalDonations: sql<string>`sum(${donations.currentAmount})`,
      })
      .from(donations)
      .where(eq(donations.isActive, true));

    const [userStats] = await db
      .select({
        activeUsers: sql<number>`count(*)`,
      })
      .from(users)
      .where(eq(users.isActive, true));

    return {
      totalRaffles: raffleStats.count || 0,
      totalPrizePool: raffleStats.totalPrizePool || "0",
      totalDonations: donationStats.totalDonations || "0",
      activeUsers: userStats.activeUsers || 0,
    };
  }

  async getDonationsByOrganizationType(orgType: string): Promise<(Donation & { creator: User })[]> {
    const results = await db
      .select({
        donation: donations,
        creator: users,
      })
      .from(donations)
      .innerJoin(users, eq(donations.creatorId, users.id))
      .where(and(
        eq(donations.isActive, true),
        eq(users.organizationType, orgType)
      ))
      .orderBy(desc(donations.createdAt));
    
    return results.map(result => ({
      ...result.donation,
      creator: result.creator
    }));
  }

  async processStartupFeePayment(donationId: number, transactionHash: string): Promise<void> {
    await db
      .update(donations)
      .set({ startupFeePaid: true })
      .where(eq(donations.id, donationId));
  }

  async getDonationStats(): Promise<{
    totalDonations: number;
    totalCommissionCollected: string;
    organizationDonations: number;
    individualDonations: number;
  }> {
    const [totalStats] = await db
      .select({
        totalDonations: sql<number>`count(*)`,
        totalCommissionCollected: sql<string>`sum(${donations.totalCommissionCollected})`,
      })
      .from(donations)
      .where(eq(donations.isActive, true));

    const [orgStats] = await db
      .select({
        organizationDonations: sql<number>`count(*)`,
      })
      .from(donations)
      .innerJoin(users, eq(donations.creatorId, users.id))
      .where(and(
        eq(donations.isActive, true),
        sql`${users.organizationType} != 'individual'`
      ));

    const [indivStats] = await db
      .select({
        individualDonations: sql<number>`count(*)`,
      })
      .from(donations)
      .innerJoin(users, eq(donations.creatorId, users.id))
      .where(and(
        eq(donations.isActive, true),
        eq(users.organizationType, "individual")
      ));

    return {
      totalDonations: totalStats.totalDonations || 0,
      totalCommissionCollected: totalStats.totalCommissionCollected || "0",
      organizationDonations: orgStats.organizationDonations || 0,
      individualDonations: indivStats.individualDonations || 0,
    };
  }

  // User Device methods
  async createUserDevice(device: InsertUserDevice & { userId: number }): Promise<UserDevice> {
    return this.withErrorHandling(async () => {
      const [newDevice] = await db
        .insert(userDevices)
        .values({
          ...device,
          deviceFingerprint: 'auto-generated'
        })
        .returning();
      return newDevice;
    }, 'createUserDevice');
  }

  async getUserDevices(userId: number): Promise<UserDevice[]> {
    return await db
      .select()
      .from(userDevices)
      .where(eq(userDevices.userId, userId))
      .orderBy(desc(userDevices.lastLoginAt));
  }

  async updateUserDeviceLastLogin(deviceId: number): Promise<void> {
    await db
      .update(userDevices)
      .set({ lastLoginAt: new Date() })
      .where(eq(userDevices.id, deviceId));
  }

  // User Photo methods
  async createUserPhoto(photo: InsertUserPhoto & { userId: number }): Promise<UserPhoto> {
    const [newPhoto] = await db
      .insert(userPhotos)
      .values(photo)
      .returning();
    return newPhoto;
  }

  async getUserPhotos(userId: number, photoType?: string): Promise<UserPhoto[]> {
    let whereConditions = and(
      eq(userPhotos.userId, userId),
      eq(userPhotos.isActive, true)
    );

    if (photoType) {
      whereConditions = and(
        eq(userPhotos.userId, userId),
        eq(userPhotos.photoType, photoType),
        eq(userPhotos.isActive, true)
      );
    }

    return await db
      .select()
      .from(userPhotos)
      .where(whereConditions)
      .orderBy(desc(userPhotos.uploadedAt));
  }

  async deleteUserPhoto(photoId: number, userId: number): Promise<void> {
    await db
      .update(userPhotos)
      .set({ isActive: false })
      .where(and(
        eq(userPhotos.id, photoId),
        eq(userPhotos.userId, userId)
      ));
  }

  // Community Channel Methods
  async createChannel(channelData: InsertChannel & { creatorId: number }): Promise<Channel> {
    console.log('DatabaseStorage.createChannel - channelData:', channelData);
    
    try {
      const insertData = {
        name: channelData.name,
        description: channelData.description,
        categoryId: channelData.categoryId,
        creatorId: channelData.creatorId,
        subscriberCount: 0,
        isActive: true,
        isDemo: channelData.isDemo || false,
        totalPrizeAmount: '0',
        activeRaffleCount: 0
      };
      
      console.log('DatabaseStorage.createChannel - insertData:', insertData);
      
      const [channel] = await db.insert(channels).values(insertData).returning();
      
      console.log('DatabaseStorage.createChannel - created channel:', channel);
      return channel;
    } catch (error) {
      console.error('DatabaseStorage.createChannel - error:', error);
      throw error;
    }
  }

  async getChannels(): Promise<Channel[]> {
    return await db.select({
      id: channels.id,
      name: channels.name,
      description: channels.description,
      categoryId: channels.categoryId,
      creatorId: channels.creatorId,
      subscriberCount: channels.subscriberCount,
      isActive: channels.isActive,
      createdAt: channels.createdAt,
      isDemo: channels.isDemo,
      demoContent: channels.demoContent,
      totalPrizeAmount: channels.totalPrizeAmount,
      activeRaffleCount: channels.activeRaffleCount,
      creator: users.username,
      creatorWalletAddress: users.walletAddress,
      categoryName: categories.name
    }).from(channels)
    .leftJoin(users, eq(channels.creatorId, users.id))
    .leftJoin(categories, eq(channels.categoryId, categories.id))
    .where(eq(channels.isActive, true));
  }

  async getChannelById(id: number): Promise<Channel | undefined> {
    const [channel] = await db.select().from(channels).where(eq(channels.id, id));
    return channel;
  }

  async updateChannel(channelId: number, updateData: Partial<InsertChannel>): Promise<Channel | undefined> {
    const [updatedChannel] = await db.update(channels)
      .set(updateData)
      .where(eq(channels.id, channelId))
      .returning();
    return updatedChannel;
  }

  async isChannelCreator(channelId: number, userId: number): Promise<boolean> {
    const [channel] = await db.select({ creatorId: channels.creatorId })
      .from(channels)
      .where(eq(channels.id, channelId));
    return channel?.creatorId === userId;
  }

  async updateChannelSubscriberCount(channelId: number, count: number): Promise<void> {
    await db.update(channels).set({ subscriberCount: count }).where(eq(channels.id, channelId));
  }

  async getChannelSubscriptionCount(channelId: number): Promise<number> {
    try {
      const result = await db.select({ count: sql<number>`count(*)` })
        .from(channelSubscriptions)
        .where(eq(channelSubscriptions.channelId, channelId));
      return result[0]?.count || 0;
    } catch (error) {
      console.error('Error getting channel subscription count:', error);
      return 0;
    }
  }

  async getUpcomingRafflesByChannel(channelId: number): Promise<UpcomingRaffle[]> {
    console.log(`Storage: Getting upcoming raffles for channel ${channelId}`);
    
    try {
      // Since channelId is not in upcomingRaffles schema yet, return all raffles
      const allRaffles = await db.select().from(upcomingRaffles).orderBy(upcomingRaffles.createdAt);
      console.log(`Storage: Found ${allRaffles.length} total upcoming raffles:`, allRaffles);
      
      return allRaffles;
    } catch (error) {
      console.error('Error getting upcoming raffles by channel:', error);
      return [];
    }
  }

  // Channel Subscription Methods
  async subscribeToChannel(userId: number, channelId: number): Promise<ChannelSubscription> {
    const [subscription] = await db.insert(channelSubscriptions).values({ userId, channelId }).returning();
    
    // Update subscriber count
    const subscriberCount = await db.select({ count: sql`count(*)` }).from(channelSubscriptions).where(eq(channelSubscriptions.channelId, channelId));
    await this.updateChannelSubscriberCount(channelId, Number(subscriberCount[0].count));
    
    return subscription;
  }

  async unsubscribeFromChannel(userId: number, channelId: number): Promise<void> {
    await db.delete(channelSubscriptions).where(
      and(eq(channelSubscriptions.userId, userId), eq(channelSubscriptions.channelId, channelId))
    );
    
    // Update subscriber count
    const subscriberCount = await db.select({ count: sql`count(*)` }).from(channelSubscriptions).where(eq(channelSubscriptions.channelId, channelId));
    await this.updateChannelSubscriberCount(channelId, Number(subscriberCount[0].count));
  }

  async getUserChannelSubscriptions(userId: number): Promise<ChannelSubscription[]> {
    return await db.select().from(channelSubscriptions).where(eq(channelSubscriptions.userId, userId));
  }

  async isUserSubscribedToChannel(userId: number, channelId: number): Promise<boolean> {
    const [subscription] = await db.select().from(channelSubscriptions).where(
      and(eq(channelSubscriptions.userId, userId), eq(channelSubscriptions.channelId, channelId))
    );
    return !!subscription;
  }

  // Upcoming Raffle Methods
  async createUpcomingRaffle(raffleData: InsertUpcomingRaffle & { creatorId: number }): Promise<UpcomingRaffle> {
    console.log('DatabaseStorage.createUpcomingRaffle - raffleData:', raffleData);
    
    try {
      const insertData = {
        title: raffleData.title,
        description: raffleData.description,
        prizeValue: raffleData.prizeValue,
        ticketPrice: raffleData.ticketPrice,
        maxTickets: raffleData.maxTickets,
        startDate: raffleData.startDate,
        categoryId: raffleData.categoryId,
        creatorId: raffleData.creatorId,
        channelId: raffleData.channelId || null,
        interestedCount: 0,
        isActive: true
      };
      
      console.log('DatabaseStorage.createUpcomingRaffle - insertData:', insertData);
      
      const [raffle] = await db.insert(upcomingRaffles).values(insertData).returning();
      
      console.log('DatabaseStorage.createUpcomingRaffle - created raffle:', raffle);
      return raffle;
    } catch (error) {
      console.error('DatabaseStorage.createUpcomingRaffle - error:', error);
      throw error;
    }
  }

  async getUpcomingRaffles(): Promise<UpcomingRaffle[]> {
    return await db.select().from(upcomingRaffles).where(eq(upcomingRaffles.isActive, true));
  }

  async getUpcomingRaffleById(id: number): Promise<UpcomingRaffle | undefined> {
    const [raffle] = await db.select().from(upcomingRaffles).where(eq(upcomingRaffles.id, id));
    return raffle;
  }

  async updateUpcomingRaffleInterestCount(raffleId: number, count: number): Promise<void> {
    await db.update(upcomingRaffles).set({ interestedCount: count }).where(eq(upcomingRaffles.id, raffleId));
  }

  // Upcoming Raffle Interest Methods
  async addUpcomingRaffleInterest(userId: number, upcomingRaffleId: number): Promise<UpcomingRaffleInterest> {
    const [interest] = await db.insert(upcomingRaffleInterests).values({ userId, upcomingRaffleId }).returning();
    
    // Update interest count
    const interestCount = await db.select({ count: sql`count(*)` }).from(upcomingRaffleInterests).where(eq(upcomingRaffleInterests.upcomingRaffleId, upcomingRaffleId));
    await this.updateUpcomingRaffleInterestCount(upcomingRaffleId, Number(interestCount[0].count));
    
    return interest;
  }

  async removeUpcomingRaffleInterest(userId: number, upcomingRaffleId: number): Promise<void> {
    await db.delete(upcomingRaffleInterests).where(
      and(eq(upcomingRaffleInterests.userId, userId), eq(upcomingRaffleInterests.upcomingRaffleId, upcomingRaffleId))
    );
    
    // Update interest count
    const interestCount = await db.select({ count: sql`count(*)` }).from(upcomingRaffleInterests).where(eq(upcomingRaffleInterests.upcomingRaffleId, upcomingRaffleId));
    await this.updateUpcomingRaffleInterestCount(upcomingRaffleId, Number(interestCount[0].count));
  }

  async isUserInterestedInUpcomingRaffle(userId: number, upcomingRaffleId: number): Promise<boolean> {
    const [interest] = await db.select().from(upcomingRaffleInterests).where(
      and(eq(upcomingRaffleInterests.userId, userId), eq(upcomingRaffleInterests.upcomingRaffleId, upcomingRaffleId))
    );
    return !!interest;
  }

  // Admin-specific methods implementation
  async getAdminStats(): Promise<any> {
    return this.withErrorHandling(async () => {
      const platformStats = await this.getPlatformStats();
      const donationStats = await this.getDonationStats();
      
      return {
        ...platformStats,
        ...donationStats,
        timestamp: new Date().toISOString()
      };
    }, 'getAdminStats');
  }

  async getAnalytics(): Promise<any> {
    return this.withErrorHandling(async () => {
      // Return basic analytics data
      return {
        dailyUsers: 0,
        monthlyUsers: 0,
        popularCategories: [],
        timestamp: new Date().toISOString()
      };
    }, 'getAnalytics');
  }

  async getAllUsers(): Promise<User[]> {
    return this.withErrorHandling(async () => {
      return await db.select().from(users).orderBy(desc(users.createdAt));
    }, 'getAllUsers');
  }

  async getUserById(id: number): Promise<User | undefined> {
    return this.withErrorHandling(async () => {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user || undefined;
    }, 'getUserById');
  }

  async getAllRaffles(): Promise<Raffle[]> {
    return this.withErrorHandling(async () => {
      return await db.select().from(raffles).orderBy(desc(raffles.createdAt));
    }, 'getAllRaffles');
  }

  async getRaffleParticipants(raffleId: number): Promise<any[]> {
    return this.withErrorHandling(async () => {
      const participants = await db
        .select({
          ticket: tickets,
          user: users
        })
        .from(tickets)
        .innerJoin(users, eq(tickets.userId, users.id))
        .where(eq(tickets.raffleId, raffleId));
      
      return participants.map(p => ({
        ...p.ticket,
        user: p.user
      }));
    }, 'getRaffleParticipants');
  }

  async getAllDonations(): Promise<Donation[]> {
    return this.withErrorHandling(async () => {
      return await db.select().from(donations).orderBy(desc(donations.createdAt));
    }, 'getAllDonations');
  }

  async getAllWallets(): Promise<any[]> {
    return this.withErrorHandling(async () => {
      return await db.select({
        walletAddress: users.walletAddress,
        username: users.username,
        isActive: users.isActive,
        createdAt: users.createdAt
      }).from(users).orderBy(desc(users.createdAt));
    }, 'getAllWallets');
  }

  async getAllCountryRestrictions(): Promise<any[]> {
    return this.withErrorHandling(async () => {
      return await db.select().from(countryRestrictions);
    }, 'getAllCountryRestrictions');
  }

  async createCountryRestriction(restriction: any): Promise<any> {
    return this.withErrorHandling(async () => {
      const [newRestriction] = await db.insert(countryRestrictions).values(restriction).returning();
      return newRestriction;
    }, 'createCountryRestriction');
  }

  async updateCountryRestriction(id: number, updates: any): Promise<any> {
    return this.withErrorHandling(async () => {
      const [updated] = await db.update(countryRestrictions).set(updates).where(eq(countryRestrictions.id, id)).returning();
      return updated;
    }, 'updateCountryRestriction');
  }

  async getDraftRaffles(): Promise<any[]> {
    return this.withErrorHandling(async () => {
      return await db.select().from(raffles).where(eq(raffles.isActive, false));
    }, 'getDraftRaffles');
  }

  async approveRaffle(id: number, approve: boolean): Promise<any> {
    return this.withErrorHandling(async () => {
      const [updated] = await db.update(raffles).set({ isActive: approve }).where(eq(raffles.id, id)).returning();
      return updated;
    }, 'approveRaffle');
  }

  async getAllAdminSettings(): Promise<any[]> {
    return this.withErrorHandling(async () => {
      return await db.select().from(adminSettings);
    }, 'getAllAdminSettings');
  }

  async updateAdminSetting(key: string, value: string): Promise<any> {
    return this.withErrorHandling(async () => {
      const [updated] = await db.update(adminSettings).set({ settingValue: value }).where(eq(adminSettings.settingKey, key)).returning();
      return updated;
    }, 'updateAdminSetting');
  }

  // Corporate Fund Methods
  async getCorporateFunds(): Promise<OldCorporateFund[]> {
    return this.withErrorHandling(async () => {
      return await db.select().from(corporateFunds).orderBy(desc(corporateFunds.createdAt));
    }, 'getCorporateFunds');
  }

  async getCorporateFundById(id: number): Promise<OldCorporateFund | undefined> {
    return this.withErrorHandling(async () => {
      const [fund] = await db.select().from(corporateFunds).where(eq(corporateFunds.id, id));
      return fund || undefined;
    }, 'getCorporateFundById');
  }

  async createCorporateFund(fund: InsertOldCorporateFund & { managerId: number; availableAmount: string }): Promise<OldCorporateFund> {
    return this.withErrorHandling(async () => {
      const [newFund] = await db.insert(corporateFunds).values({
        ...fund,
        allocatedAmount: "0", // Initially no allocation
      }).returning();
      return newFund;
    }, 'createCorporateFund');
  }

  async updateCorporateFund(id: number, updates: Partial<OldCorporateFund>): Promise<OldCorporateFund | undefined> {
    return this.withErrorHandling(async () => {
      const [updated] = await db.update(corporateFunds).set(updates).where(eq(corporateFunds.id, id)).returning();
      return updated || undefined;
    }, 'updateCorporateFund');
  }

  async getFundAllocations(fundId: number): Promise<FundAllocation[]> {
    return this.withErrorHandling(async () => {
      return await db.select().from(fundAllocations).where(eq(fundAllocations.fundId, fundId)).orderBy(desc(fundAllocations.createdAt));
    }, 'getFundAllocations');
  }

  async createFundAllocation(allocation: InsertFundAllocation): Promise<FundAllocation> {
    return this.withErrorHandling(async () => {
      const [newAllocation] = await db.insert(fundAllocations).values(allocation).returning();
      
      // Update fund allocated amount
      await db
        .update(corporateFunds)
        .set({
          allocatedAmount: sql`${corporateFunds.allocatedAmount} + ${allocation.allocatedAmount}`,
          availableAmount: sql`${corporateFunds.availableAmount} - ${allocation.allocatedAmount}`
        })
        .where(eq(corporateFunds.id, allocation.fundId));

      return newAllocation;
    }, 'createFundAllocation');
  }

  async approveFundAllocation(id: number, approvedBy: number): Promise<FundAllocation | undefined> {
    return this.withErrorHandling(async () => {
      const [updated] = await db
        .update(fundAllocations)
        .set({
          status: 'approved',
          approvedBy,
          approvedAt: new Date(),
        })
        .where(and(eq(fundAllocations.id, id), eq(fundAllocations.status, 'pending')))
        .returning();
      
      return updated || undefined;
    }, 'approveFundAllocation');
  }

  async rejectFundAllocation(id: number, rejectedBy: number, rejectionReason: string): Promise<FundAllocation | undefined> {
    return this.withErrorHandling(async () => {
      // Get allocation details first
      const [allocation] = await db.select().from(fundAllocations).where(eq(fundAllocations.id, id));
      if (!allocation || allocation.status !== 'pending') {
        return undefined;
      }

      // Update allocation status
      const [updated] = await db
        .update(fundAllocations)
        .set({
          status: 'rejected',
          rejectedBy,
          rejectedAt: new Date(),
          rejectionReason,
        })
        .where(eq(fundAllocations.id, id))
        .returning();

      // Restore fund amounts
      await db
        .update(corporateFunds)
        .set({
          allocatedAmount: sql`${corporateFunds.allocatedAmount} - ${allocation.allocatedAmount}`,
          availableAmount: sql`${corporateFunds.availableAmount} + ${allocation.allocatedAmount}`
        })
        .where(eq(corporateFunds.id, allocation.fundId));

      return updated || undefined;
    }, 'rejectFundAllocation');
  }

  async disburseFundAllocation(id: number, transactionHash: string): Promise<FundAllocation | undefined> {
    return this.withErrorHandling(async () => {
      const [updated] = await db
        .update(fundAllocations)
        .set({
          status: 'disbursed',
          disbursedAt: new Date(),
          transactionHash,
        })
        .where(and(eq(fundAllocations.id, id), eq(fundAllocations.status, 'approved')))
        .returning();
      
      return updated || undefined;
    }, 'disburseFundAllocation');
  }

  async getCorporateFundStatistics(): Promise<{
    totalFunds: number;
    totalCapital: string;
    totalAllocated: string;
    totalAvailable: string;
    pendingAllocations: number;
  }> {
    return this.withErrorHandling(async () => {
      const [fundStats] = await db
        .select({
          totalFunds: sql<number>`count(*)::int`,
          totalCapital: sql<string>`coalesce(sum(${corporateFunds.totalCapital}::decimal), '0')`,
          totalAllocated: sql<string>`coalesce(sum(${corporateFunds.allocatedAmount}::decimal), '0')`,
          totalAvailable: sql<string>`coalesce(sum(${corporateFunds.availableAmount}::decimal), '0')`,
        })
        .from(corporateFunds)
        .where(eq(corporateFunds.isActive, true));

      const [allocationStats] = await db
        .select({
          pendingAllocations: sql<number>`count(*)::int`,
        })
        .from(fundAllocations)
        .where(eq(fundAllocations.status, 'pending'));

      return {
        totalFunds: fundStats?.totalFunds || 0,
        totalCapital: fundStats?.totalCapital || '0',
        totalAllocated: fundStats?.totalAllocated || '0',
        totalAvailable: fundStats?.totalAvailable || '0',
        pendingAllocations: allocationStats?.pendingAllocations || 0,
      };
    }, 'getCorporateFundStatistics');
  }

  // New Corporate Funds Methods
  async getAllNewCorporateFunds(): Promise<CorporateFund[]> {
    return this.withErrorHandling(async () => {
      return await db.select().from(newCorporateFunds).orderBy(desc(newCorporateFunds.createdAt));
    }, 'getAllNewCorporateFunds');
  }

  async getActiveCorporateFunds(): Promise<CorporateFund[]> {
    return this.withErrorHandling(async () => {
      return await db
        .select()
        .from(newCorporateFunds)
        .where(eq(newCorporateFunds.status, 'active'))
        .orderBy(desc(newCorporateFunds.createdAt));
    }, 'getActiveCorporateFunds');
  }

  async getNewCorporateFundById(id: number): Promise<CorporateFund | undefined> {
    return this.withErrorHandling(async () => {
      const [fund] = await db.select().from(newCorporateFunds).where(eq(newCorporateFunds.id, id));
      return fund || undefined;
    }, 'getNewCorporateFundById');
  }

  async createNewCorporateFund(fund: InsertCorporateFund & { creatorId: number }): Promise<CorporateFund> {
    return this.withErrorHandling(async () => {
      const [newFund] = await db.insert(newCorporateFunds).values({
        ...fund,
        currentAmount: "0", // Initially no funding
      }).returning();
      return newFund;
    }, 'createNewCorporateFund');
  }

  async updateNewCorporateFund(id: number, updates: Partial<InsertCorporateFund>): Promise<CorporateFund | undefined> {
    return this.withErrorHandling(async () => {
      const [updated] = await db.update(newCorporateFunds).set(updates).where(eq(newCorporateFunds.id, id)).returning();
      return updated || undefined;
    }, 'updateNewCorporateFund');
  }

  async getNewCorporateFundStatistics(): Promise<{
    totalFunds: number;
    totalTargetAmount: string;
    totalCurrentAmount: string;
    activeFunds: number;
  }> {
    return this.withErrorHandling(async () => {
      const fundStats = await db.select({
        totalFunds: sql<number>`COUNT(*)`,
        totalTargetAmount: sql<string>`COALESCE(SUM(${newCorporateFunds.targetAmount}), '0')`,
        totalCurrentAmount: sql<string>`COALESCE(SUM(${newCorporateFunds.currentAmount}), '0')`,
        activeFunds: sql<number>`COUNT(CASE WHEN ${newCorporateFunds.status} = 'active' THEN 1 END)`,
      }).from(newCorporateFunds);

      const stats = fundStats[0];
      return {
        totalFunds: stats?.totalFunds || 0,
        totalTargetAmount: stats?.totalTargetAmount || '0',
        totalCurrentAmount: stats?.totalCurrentAmount || '0',
        activeFunds: stats?.activeFunds || 0,
      };
    }, 'getNewCorporateFundStatistics');
  }
}

export const storage = new DatabaseStorage();
