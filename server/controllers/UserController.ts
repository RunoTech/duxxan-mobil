import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { UserService } from '../services/UserService';
import { insertUserSchema } from '@shared/schema';
import { z } from 'zod';

export class UserController extends BaseController {
  private userService = new UserService();

  // Get current user profile
  getCurrentUser = this.asyncHandler(async (req: Request, res: Response) => {
    // Check for wallet address in headers or session
    const walletAddress = req.headers['x-wallet-address'] as string || 
                         (req as any).session?.walletAddress;
    
    if (!walletAddress) {
      return this.sendError(res, 'No authenticated user found', 404);
    }

    const user = await this.userService.getUserByWallet(walletAddress);
    if (!user) {
      return this.sendError(res, 'User not found', 404);
    }

    this.sendSuccess(res, user, 'User profile retrieved successfully');
  });

  // Get user by ID
  getUserById = this.asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return this.sendError(res, 'Invalid user ID', 400);
    }

    const user = await this.userService.getUserProfile(userId);
    if (!user) {
      return this.sendError(res, 'User not found', 404);
    }

    // Remove sensitive data for public view
    const publicUser = {
      id: user.id,
      username: user.username,
      walletAddress: user.walletAddress,
      createdAt: user.createdAt
    };

    this.sendSuccess(res, publicUser, 'User profile retrieved successfully');
  });

  // Create new user
  createUser = [
    this.validateBody(insertUserSchema),
    this.asyncHandler(async (req: Request, res: Response) => {
      const userData = req.body;

      try {
        const user = await this.userService.createUser(userData);
        this.sendSuccess(res, user, 'User created successfully', 201);
      } catch (error) {
        if (error instanceof Error && error.message.includes('already exists')) {
          return this.sendError(res, error.message, 409);
        }
        throw error;
      }
    })
  ];

  // Update user profile
  updateUser = [
    this.requireAuth(),
    this.validateBody(insertUserSchema.partial()),
    this.asyncHandler(async (req: Request, res: Response) => {
      const user = (req as any).user;
      const updates = req.body;

      // Kurumsal hesap kontrolü
      if (updates.organizationType && updates.organizationType !== 'individual') {
        // Mevcut kullanıcının hesap türünü kontrol et
        if (user.organizationType === 'individual') {
          const now = new Date();
          const approvalDeadline = new Date(now.getTime() + 48 * 60 * 60 * 1000); // 48 saat
          
          updates.accountStatus = 'pending_approval';
          updates.accountSubmittedAt = now;
          updates.approvalDeadline = approvalDeadline;
          updates.accountApprovedAt = null;
          updates.accountRejectedAt = null;
          updates.rejectionReason = null;
        }
      }

      const updatedUser = await this.userService.updateUser(user.id, updates);
      if (!updatedUser) {
        return this.sendError(res, 'Failed to update user', 400);
      }

      const message = updates.accountStatus === 'pending_approval' 
        ? 'Kurumsal hesap başvurunuz alındı. 24-48 saat içinde onaylanacaktır.'
        : 'User updated successfully';

      this.sendSuccess(res, updatedUser, message);
    })
  ];

  // Get user statistics
  getUserStats = this.asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return this.sendError(res, 'Invalid user ID', 400);
    }

    const stats = await this.userService.getUserStats(userId);
    this.sendSuccess(res, stats, 'User statistics retrieved successfully');
  });

  // Delete user account
  deleteUser = [
    this.requireAuth(),
    this.asyncHandler(async (req: Request, res: Response) => {
      const user = (req as any).user;
      
      const deleted = await this.userService.deleteUser(user.id);
      if (!deleted) {
        return this.sendError(res, 'Failed to delete user', 400);
      }

      this.sendSuccess(res, { deleted: true }, 'User account deleted successfully');
    })
  ];

  // Authenticate user by wallet
  authenticateWallet = [
    this.validateBody(z.object({
      walletAddress: z.string().min(1, 'Wallet address is required'),
      signature: z.string().optional(),
      message: z.string().optional()
    })),
    this.asyncHandler(async (req: Request, res: Response) => {
      const { walletAddress } = req.body;

      let user = await this.userService.getUserByWallet(walletAddress.toLowerCase());
      
      if (!user) {
        // Create new user if doesn't exist
        const userData = {
          walletAddress: walletAddress.toLowerCase(),
          username: `user_${walletAddress.slice(2, 8).toLowerCase()}`,
          organizationType: 'individual' as const
        };
        user = await this.userService.createUser(userData);
      }

      // Store user data in session-compatible format
      (req as any).user = user;

      console.log('User authenticated:', { id: user.id, username: user.username, walletAddress: user.walletAddress });

      // Send welcome message for new users
      if (!user.email) {
        try {
          const { storage } = await import('../storage');
          await storage.sendSystemNotification(
            user.walletAddress,
            'DUXXAN\'a Hoş Geldiniz!',
            `Merhaba ${user.username}!\n\nDUXXAN platformuna hoş geldiniz. Dahili mail sisteminiz aktif edilmiştir.\n\nMail adresiniz: ${user.walletAddress}@duxxan\n\nGüvenli ve şeffaf çekilişlerin tadını çıkarın!\n\n- DUXXAN Ekibi`
          );
        } catch (error) {
          console.error('Failed to send welcome message:', error);
        }
      }

      this.sendSuccess(res, user, 'Authentication successful');
    })
  ];
}