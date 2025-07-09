import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { RaffleService } from '../services/RaffleService';
import { UserService } from '../services/UserService';
import { insertRaffleSchema, insertTicketSchema } from '@shared/schema';
import { z } from 'zod';

export class RaffleController extends BaseController {
  private raffleService = new RaffleService();

  // Get all raffles with pagination
  getRaffles = this.asyncHandler(async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    const raffles = await this.raffleService.getRaffles(limit, offset);
    this.sendSuccess(res, raffles, 'Raffles retrieved successfully');
  });

  // Get active raffles
  getActiveRaffles = this.asyncHandler(async (req: Request, res: Response) => {
    const raffles = await this.raffleService.getActiveRaffles();
    this.sendSuccess(res, raffles, 'Active raffles retrieved successfully');
  });

  // Get raffle by ID
  getRaffleById = this.asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const raffleId = parseInt(id);

    if (isNaN(raffleId)) {
      return this.sendError(res, 'Invalid raffle ID', 400);
    }

    const raffle = await this.raffleService.getRaffleById(raffleId);
    if (!raffle) {
      return this.sendError(res, 'Raffle not found', 404);
    }

    // Debug: Log the raffle data to see if images field is present
    console.log('Returning raffle data:', JSON.stringify({
      id: raffle.id,
      title: raffle.title,
      images: raffle.images,
      imagesType: typeof raffle.images
    }, null, 2));

    this.sendSuccess(res, raffle, 'Raffle retrieved successfully');
  });

  // Create new raffle - requires blockchain payment
  createRaffle = [
    this.validateBody(insertRaffleSchema.extend({
      transactionHash: z.string().min(66, 'Valid transaction hash required')
    })),
    this.asyncHandler(async (req: Request, res: Response) => {
      // Check for wallet address in headers
      const walletAddress = req.headers['x-wallet-address'] as string;
      
      if (!walletAddress) {
        return this.sendError(res, 'Wallet address required', 401);
      }

      // Get user by wallet address
      const userService = new UserService();
      const user = await userService.getUserByWallet(walletAddress);
      
      if (!user) {
        return this.sendError(res, 'User not found', 404);
      }

      const { transactionHash, ...raffleData } = req.body;

      try {
        // Verify blockchain payment first
        const verified = await this.raffleService.verifyRaffleCreationPayment(
          transactionHash,
          walletAddress,
          raffleData.prizeValue
        );

        if (!verified) {
          return this.sendError(res, 'Payment verification failed. Please ensure you paid the 25 USDT creation fee to the contract.', 400);
        }

        // Create raffle only after payment verification
        const raffle = await this.raffleService.createRaffle({
          ...raffleData,
          creatorId: user.id,
          transactionHash
        });

        this.sendSuccess(res, raffle, 'Raffle created successfully after payment verification', 201);
      } catch (error) {
        if (error instanceof Error) {
          return this.sendError(res, error.message, 400);
        }
        throw error;
      }
    })
  ];

  // Update raffle
  updateRaffle = [
    this.requireAuth(),
    this.requireWallet(),
    this.validateBody(insertRaffleSchema.partial()),
    this.asyncHandler(async (req: Request, res: Response) => {
      const { id } = req.params;
      const raffleId = parseInt(id);
      const user = req.user;

      if (isNaN(raffleId)) {
        return this.sendError(res, 'Invalid raffle ID', 400);
      }

      // Check if user owns the raffle
      const existingRaffle = await this.raffleService.getRaffleById(raffleId);
      if (!existingRaffle) {
        return this.sendError(res, 'Raffle not found', 404);
      }

      if (existingRaffle.creatorId !== user.id) {
        return this.sendError(res, 'Unauthorized to update this raffle', 403);
      }

      const updatedRaffle = await this.raffleService.updateRaffle(raffleId, req.body);
      if (!updatedRaffle) {
        return this.sendError(res, 'Failed to update raffle', 400);
      }

      this.sendSuccess(res, updatedRaffle, 'Raffle updated successfully');
    })
  ];

  // Get raffles by creator
  getRafflesByCreator = this.asyncHandler(async (req: Request, res: Response) => {
    const { creatorId } = req.params;
    const id = parseInt(creatorId);

    if (isNaN(id)) {
      return this.sendError(res, 'Invalid creator ID', 400);
    }

    const raffles = await this.raffleService.getRafflesByCreator(id);
    this.sendSuccess(res, raffles, 'Creator raffles retrieved successfully');
  });

  // Purchase tickets
  purchaseTickets = [
    this.requireAuth(),
    this.requireWallet(),
    this.validateBody(z.object({
      raffleId: z.number().min(1, 'Raffle ID is required'),
      quantity: z.number().min(1, 'Quantity must be at least 1'),
      totalAmount: z.string().min(1, 'Total amount is required'),
      transactionHash: z.string().optional()
    })),
    this.asyncHandler(async (req: Request, res: Response) => {
      const user = req.user;
      const { raffleId, quantity, totalAmount, transactionHash } = req.body;

      // Check if raffle exists and is active
      const raffle = await this.raffleService.getRaffleById(raffleId);
      if (!raffle) {
        return this.sendError(res, 'Raffle not found', 404);
      }

      if (!raffle.isActive || new Date() > new Date(raffle.endDate)) {
        return this.sendError(res, 'Raffle is not active or has ended', 400);
      }

      try {
        const ticket = await this.raffleService.purchaseTickets(
          user.id,
          raffleId,
          quantity,
          totalAmount,
          transactionHash
        );

        this.sendSuccess(res, ticket, 'Tickets purchased successfully', 201);
      } catch (error) {
        if (error instanceof Error) {
          return this.sendError(res, error.message, 400);
        }
        throw error;
      }
    })
  ];

  // Get raffle tickets
  getRaffleTickets = this.asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const raffleId = parseInt(id);

    if (isNaN(raffleId)) {
      return this.sendError(res, 'Invalid raffle ID', 400);
    }

    const tickets = await this.raffleService.getRaffleTickets(raffleId);
    this.sendSuccess(res, tickets, 'Raffle tickets retrieved successfully');
  });

  // Get user's tickets
  getUserTickets = [
    this.requireAuth(),
    this.asyncHandler(async (req: Request, res: Response) => {
      const user = req.user;
      const tickets = await this.raffleService.getUserTickets(user.id);
      this.sendSuccess(res, tickets, 'User tickets retrieved successfully');
    })
  ];

  // Get my raffles (created by current user)
  getMyRaffles = [
    this.requireAuth(),
    this.asyncHandler(async (req: Request, res: Response) => {
      const user = req.user;
      const raffles = await this.raffleService.getRafflesByCreator(user.id);
      this.sendSuccess(res, raffles, 'Your raffles retrieved successfully');
    })
  ];
}