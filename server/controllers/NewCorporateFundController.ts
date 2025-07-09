import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { storage } from '../storage';
import { insertCorporateFundSchema } from '@shared/schema';

export class NewCorporateFundController extends BaseController {
  // Get all corporate funds
  getAllCorporateFunds = [
    this.asyncHandler(async (req: Request, res: Response) => {
      const funds = await storage.getAllNewCorporateFunds();
      this.sendSuccess(res, funds, 'Corporate funds retrieved successfully');
    })
  ];

  // Get active corporate funds
  getActiveCorporateFunds = [
    this.asyncHandler(async (req: Request, res: Response) => {
      const funds = await storage.getActiveCorporateFunds();
      this.sendSuccess(res, funds, 'Active corporate funds retrieved successfully');
    })
  ];

  // Get corporate fund by ID
  getCorporateFundById = [
    this.asyncHandler(async (req: Request, res: Response) => {
      const { id } = req.params;
      const fundId = parseInt(id);

      if (isNaN(fundId)) {
        return this.sendError(res, 'Invalid fund ID', 400);
      }

      const fund = await storage.getNewCorporateFundById(fundId);
      if (!fund) {
        return this.sendError(res, 'Corporate fund not found', 404);
      }

      this.sendSuccess(res, fund, 'Corporate fund retrieved successfully');
    })
  ];

  // Create new corporate fund
  createCorporateFund = [
    this.requireAuth(),
    this.validateBody(insertCorporateFundSchema),
    this.asyncHandler(async (req: Request, res: Response) => {
      const user = (req as any).user;
      const fundData = req.body;

      if (!user) {
        return this.sendError(res, 'User not found', 404);
      }

      const fund = await storage.createNewCorporateFund({
        ...fundData,
        creatorId: user.id,
      });

      this.sendSuccess(res, fund, 'Corporate fund created successfully', 201);
    })
  ];

  // Update corporate fund
  updateCorporateFund = [
    this.requireAuth(),
    this.validateBody(insertCorporateFundSchema.partial()),
    this.asyncHandler(async (req: Request, res: Response) => {
      const user = (req as any).user;
      const { id } = req.params;
      const fundId = parseInt(id);
      const updateData = req.body;

      if (isNaN(fundId)) {
        return this.sendError(res, 'Invalid fund ID', 400);
      }

      const fund = await storage.getNewCorporateFundById(fundId);
      if (!fund) {
        return this.sendError(res, 'Corporate fund not found', 404);
      }

      // Only creator or admin can update
      if (fund.creatorId !== user.id && user.walletAddress !== process.env.ADMIN_WALLET_ADDRESS) {
        return this.sendError(res, 'Permission denied', 403);
      }

      const updatedFund = await storage.updateNewCorporateFund(fundId, updateData);
      this.sendSuccess(res, updatedFund, 'Corporate fund updated successfully');
    })
  ];

  // Get fund statistics
  getFundStatistics = [
    this.asyncHandler(async (req: Request, res: Response) => {
      const stats = await storage.getNewCorporateFundStatistics();
      this.sendSuccess(res, stats, 'Fund statistics retrieved successfully');
    })
  ];
}