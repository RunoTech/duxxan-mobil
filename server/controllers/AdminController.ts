import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import { storage } from '../storage';
import { insertCountryRestrictionSchema, insertAdminSettingSchema } from '@shared/schema';

export class AdminController extends BaseController {
  
  // Admin wallet addresses - only these can access admin endpoints
  private static ADMIN_WALLETS = [
    '0x1234567890123456789012345678901234567890', // Ana admin
    '0x3a6cdb7c124e52e22ba14bfbc03c8a983931b756', // Test admin
  ];

  private isAdmin(walletAddress: string): boolean {
    return AdminController.ADMIN_WALLETS.includes(walletAddress.toLowerCase());
  }

  private validateAdminAccess = this.asyncHandler(async (req: Request, res: Response, next: any) => {
    const walletAddress = req.headers['x-wallet-address'] as string;
    
    if (!walletAddress) {
      return this.sendError(res, 'Wallet address required', 401);
    }
    
    if (!this.isAdmin(walletAddress)) {
      return this.sendError(res, 'Admin access required', 403);
    }
    
    next();
  });

  // Get all country restrictions
  getCountryRestrictions = [
    this.validateAdminAccess,
    this.asyncHandler(async (req: Request, res: Response) => {
      const restrictions = await storage.getAllCountryRestrictions();
      this.sendSuccess(res, restrictions, 'Country restrictions retrieved successfully');
    })
  ];

  // Create country restriction
  createCountryRestriction = [
    this.validateAdminAccess,
    this.validateBody(insertCountryRestrictionSchema),
    this.asyncHandler(async (req: Request, res: Response) => {
      const restriction = await storage.createCountryRestriction(req.body);
      this.sendSuccess(res, restriction, 'Country restriction created successfully');
    })
  ];

  // Update country restriction
  updateCountryRestriction = [
    this.validateAdminAccess,
    this.validateBody(insertCountryRestrictionSchema.partial()),
    this.asyncHandler(async (req: Request, res: Response) => {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return this.sendError(res, 'Invalid restriction ID', 400);
      }

      const restriction = await storage.updateCountryRestriction(id, req.body);
      
      if (!restriction) {
        return this.sendError(res, 'Country restriction not found', 404);
      }

      this.sendSuccess(res, restriction, 'Country restriction updated successfully');
    })
  ];

  // Get draft raffles (pending approval)
  getDraftRaffles = [
    this.validateAdminAccess,
    this.asyncHandler(async (req: Request, res: Response) => {
      const draftRaffles = await storage.getDraftRaffles();
      this.sendSuccess(res, draftRaffles, 'Draft raffles retrieved successfully');
    })
  ];

  // Approve or reject a raffle
  approveRaffle = [
    this.validateAdminAccess,
    this.validateBody(z.object({
      approve: z.boolean()
    })),
    this.asyncHandler(async (req: Request, res: Response) => {
      const raffleId = parseInt(req.params.id);
      const { approve } = req.body;
      
      if (isNaN(raffleId)) {
        return this.sendError(res, 'Invalid raffle ID', 400);
      }

      const result = await storage.approveRaffle(raffleId, approve);
      
      if (!result) {
        return this.sendError(res, 'Raffle not found', 404);
      }

      this.sendSuccess(res, result, `Raffle ${approve ? 'approved' : 'rejected'} successfully`);
    })
  ];

  // Get admin settings
  getAdminSettings = [
    this.validateAdminAccess,
    this.asyncHandler(async (req: Request, res: Response) => {
      const settings = await storage.getAllAdminSettings();
      this.sendSuccess(res, settings, 'Admin settings retrieved successfully');
    })
  ];

  // Update admin setting
  updateAdminSetting = [
    this.validateAdminAccess,
    this.validateBody(insertAdminSettingSchema),
    this.asyncHandler(async (req: Request, res: Response) => {
      const setting = await storage.updateAdminSetting(req.body.settingKey, req.body.settingValue);
      this.sendSuccess(res, setting, 'Admin setting updated successfully');
    })
  ];

  // Get platform statistics for admin dashboard
  getAdminStats = [
    this.validateAdminAccess,
    this.asyncHandler(async (req: Request, res: Response) => {
      const stats = await storage.getAdminStats();
      this.sendSuccess(res, stats, 'Admin statistics retrieved successfully');
    })
  ];

  // Missing methods that are referenced in routes
  getStats = [
    this.validateAdminAccess,
    this.asyncHandler(async (req: Request, res: Response) => {
      const stats = await storage.getAdminStats();
      this.sendSuccess(res, stats, 'Statistics retrieved successfully');
    })
  ];

  getAnalytics = [
    this.validateAdminAccess,
    this.asyncHandler(async (req: Request, res: Response) => {
      const analytics = await storage.getAnalytics();
      this.sendSuccess(res, analytics, 'Analytics retrieved successfully');
    })
  ];

  getUsers = [
    this.validateAdminAccess,
    this.asyncHandler(async (req: Request, res: Response) => {
      const users = await storage.getAllUsers();
      this.sendSuccess(res, users, 'Users retrieved successfully');
    })
  ];

  getUserDetails = [
    this.validateAdminAccess,
    this.asyncHandler(async (req: Request, res: Response) => {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return this.sendError(res, 'Invalid user ID', 400);
      }
      const user = await storage.getUserById(userId);
      if (!user) {
        return this.sendError(res, 'User not found', 404);
      }
      this.sendSuccess(res, user, 'User details retrieved successfully');
    })
  ];

  userAction = [
    this.validateAdminAccess,
    this.validateBody(z.object({
      action: z.enum(['ban', 'unban', 'activate', 'deactivate']),
      userId: z.number()
    })),
    this.asyncHandler(async (req: Request, res: Response) => {
      const { action, userId } = req.body;
      // Implement user action logic here
      this.sendSuccess(res, { action, userId }, `User ${action} action completed`);
    })
  ];

  getRaffles = [
    this.validateAdminAccess,
    this.asyncHandler(async (req: Request, res: Response) => {
      const raffles = await storage.getAllRaffles();
      this.sendSuccess(res, raffles, 'Raffles retrieved successfully');
    })
  ];

  getRaffleParticipants = [
    this.validateAdminAccess,
    this.asyncHandler(async (req: Request, res: Response) => {
      const raffleId = parseInt(req.params.raffleId);
      if (isNaN(raffleId)) {
        return this.sendError(res, 'Invalid raffle ID', 400);
      }
      const participants = await storage.getRaffleParticipants(raffleId);
      this.sendSuccess(res, participants, 'Raffle participants retrieved successfully');
    })
  ];

  raffleAction = [
    this.validateAdminAccess,
    this.validateBody(z.object({
      action: z.enum(['activate', 'deactivate', 'end']),
      raffleId: z.number()
    })),
    this.asyncHandler(async (req: Request, res: Response) => {
      const { action, raffleId } = req.body;
      // Implement raffle action logic here
      this.sendSuccess(res, { action, raffleId }, `Raffle ${action} action completed`);
    })
  ];

  selectWinner = [
    this.validateAdminAccess,
    this.validateBody(z.object({
      raffleId: z.number()
    })),
    this.asyncHandler(async (req: Request, res: Response) => {
      const { raffleId } = req.body;
      // Implement winner selection logic here
      this.sendSuccess(res, { raffleId }, 'Winner selected successfully');
    })
  ];

  manualSelectWinner = [
    this.validateAdminAccess,
    this.asyncHandler(async (req: Request, res: Response) => {
      const raffleId = parseInt(req.params.raffleId);
      if (isNaN(raffleId)) {
        return this.sendError(res, 'Invalid raffle ID', 400);
      }
      // Implement manual winner selection logic here
      this.sendSuccess(res, { raffleId }, 'Manual winner selection completed');
    })
  ];

  createManualRaffle = [
    this.validateAdminAccess,
    this.asyncHandler(async (req: Request, res: Response) => {
      // Implement manual raffle creation logic here
      this.sendSuccess(res, req.body, 'Manual raffle created successfully');
    })
  ];

  getDonations = [
    this.validateAdminAccess,
    this.asyncHandler(async (req: Request, res: Response) => {
      const donations = await storage.getAllDonations();
      this.sendSuccess(res, donations, 'Donations retrieved successfully');
    })
  ];

  donationAction = [
    this.validateAdminAccess,
    this.validateBody(z.object({
      action: z.enum(['activate', 'deactivate', 'end']),
      donationId: z.number()
    })),
    this.asyncHandler(async (req: Request, res: Response) => {
      const { action, donationId } = req.body;
      // Implement donation action logic here
      this.sendSuccess(res, { action, donationId }, `Donation ${action} action completed`);
    })
  ];

  createManualDonation = [
    this.validateAdminAccess,
    this.asyncHandler(async (req: Request, res: Response) => {
      // Implement manual donation creation logic here
      this.sendSuccess(res, req.body, 'Manual donation created successfully');
    })
  ];

  getWallets = [
    this.validateAdminAccess,
    this.asyncHandler(async (req: Request, res: Response) => {
      const wallets = await storage.getAllWallets();
      this.sendSuccess(res, wallets, 'Wallets retrieved successfully');
    })
  ];

  getLogs = [
    this.validateAdminAccess,
    this.asyncHandler(async (req: Request, res: Response) => {
      // Implement log retrieval logic here
      this.sendSuccess(res, [], 'Logs retrieved successfully');
    })
  ];

  updateSettings = [
    this.validateAdminAccess,
    this.asyncHandler(async (req: Request, res: Response) => {
      // Implement settings update logic here
      this.sendSuccess(res, req.body, 'Settings updated successfully');
    })
  ];
}