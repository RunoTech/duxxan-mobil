import { Request, Response } from 'express';
import { z } from 'zod';
import { BaseController } from './BaseController';
import { insertCorporateFundSchema, insertFundAllocationSchema } from '@shared/schema';
import { storage } from '../storage';

export class CorporateFundController extends BaseController {
  
  // Get all corporate funds
  getCorporateFunds = [
    this.asyncHandler(async (req: Request, res: Response) => {
      const funds = await storage.getCorporateFunds();
      this.sendSuccess(res, funds, 'Corporate funds retrieved successfully');
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

      const fund = await storage.getCorporateFundById(fundId);
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

      // Only admin can create corporate funds
      if (user.walletAddress !== process.env.ADMIN_WALLET_ADDRESS) {
        return this.sendError(res, 'Admin access required', 403);
      }

      const fund = await storage.createCorporateFund({
        ...fundData,
        managerId: user.id,
        availableAmount: fundData.totalCapital, // Initially all capital is available
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

      // Only admin can update corporate funds
      if (user.walletAddress !== process.env.ADMIN_WALLET_ADDRESS) {
        return this.sendError(res, 'Admin access required', 403);
      }

      const fund = await storage.updateCorporateFund(fundId, updateData);
      if (!fund) {
        return this.sendError(res, 'Corporate fund not found', 404);
      }

      this.sendSuccess(res, fund, 'Corporate fund updated successfully');
    })
  ];

  // Get fund allocations for a specific fund
  getFundAllocations = [
    this.asyncHandler(async (req: Request, res: Response) => {
      const { id } = req.params;
      const fundId = parseInt(id);

      if (isNaN(fundId)) {
        return this.sendError(res, 'Invalid fund ID', 400);
      }

      const allocations = await storage.getFundAllocations(fundId);
      this.sendSuccess(res, allocations, 'Fund allocations retrieved successfully');
    })
  ];

  // Create fund allocation
  createFundAllocation = [
    this.requireAuth(),
    this.validateBody(insertFundAllocationSchema),
    this.asyncHandler(async (req: Request, res: Response) => {
      const user = (req as any).user;
      const allocationData = req.body;

      // Only admin can create fund allocations
      if (user.walletAddress !== process.env.ADMIN_WALLET_ADDRESS) {
        return this.sendError(res, 'Admin access required', 403);
      }

      // Check if fund exists and has sufficient available amount
      const fund = await storage.getCorporateFundById(allocationData.fundId);
      if (!fund) {
        return this.sendError(res, 'Corporate fund not found', 404);
      }

      if (!fund.isActive) {
        return this.sendError(res, 'Corporate fund is not active', 400);
      }

      const allocatedAmount = parseFloat(allocationData.allocatedAmount);
      const availableAmount = parseFloat(fund.availableAmount);

      if (allocatedAmount > availableAmount) {
        return this.sendError(res, 'Insufficient fund balance', 400);
      }

      // Check allocation limits
      const minimumAllocation = parseFloat(fund.minimumAllocation);
      const maximumAllocation = parseFloat(fund.maximumAllocation);

      if (allocatedAmount < minimumAllocation) {
        return this.sendError(res, `Minimum allocation is ${minimumAllocation} USDT`, 400);
      }

      if (allocatedAmount > maximumAllocation) {
        return this.sendError(res, `Maximum allocation is ${maximumAllocation} USDT`, 400);
      }

      // Check if donation exists
      const donation = await storage.getDonationById(allocationData.donationId);
      if (!donation) {
        return this.sendError(res, 'Donation campaign not found', 404);
      }

      if (!donation.isActive) {
        return this.sendError(res, 'Donation campaign is not active', 400);
      }

      const allocation = await storage.createFundAllocation(allocationData);

      this.sendSuccess(res, allocation, 'Fund allocation created successfully', 201);
    })
  ];

  // Approve fund allocation
  approveFundAllocation = [
    this.requireAuth(),
    this.asyncHandler(async (req: Request, res: Response) => {
      const user = (req as any).user;
      const { id } = req.params;
      const allocationId = parseInt(id);

      if (isNaN(allocationId)) {
        return this.sendError(res, 'Invalid allocation ID', 400);
      }

      // Only admin can approve fund allocations
      if (user.walletAddress !== process.env.ADMIN_WALLET_ADDRESS) {
        return this.sendError(res, 'Admin access required', 403);
      }

      const allocation = await storage.approveFundAllocation(allocationId, user.id);
      if (!allocation) {
        return this.sendError(res, 'Fund allocation not found or already processed', 404);
      }

      this.sendSuccess(res, allocation, 'Fund allocation approved successfully');
    })
  ];

  // Reject fund allocation
  rejectFundAllocation = [
    this.requireAuth(),
    this.validateBody(z.object({
      rejectionReason: z.string().min(10, 'Rejection reason must be at least 10 characters'),
    })),
    this.asyncHandler(async (req: Request, res: Response) => {
      const user = (req as any).user;
      const { id } = req.params;
      const { rejectionReason } = req.body;
      const allocationId = parseInt(id);

      if (isNaN(allocationId)) {
        return this.sendError(res, 'Invalid allocation ID', 400);
      }

      // Only admin can reject fund allocations
      if (user.walletAddress !== process.env.ADMIN_WALLET_ADDRESS) {
        return this.sendError(res, 'Admin access required', 403);
      }

      const allocation = await storage.rejectFundAllocation(allocationId, user.id, rejectionReason);
      if (!allocation) {
        return this.sendError(res, 'Fund allocation not found or already processed', 404);
      }

      this.sendSuccess(res, allocation, 'Fund allocation rejected successfully');
    })
  ];

  // Disburse fund allocation (mark as paid)
  disburseFundAllocation = [
    this.requireAuth(),
    this.validateBody(z.object({
      transactionHash: z.string().min(66, 'Invalid transaction hash').max(66, 'Invalid transaction hash'),
    })),
    this.asyncHandler(async (req: Request, res: Response) => {
      const user = (req as any).user;
      const { id } = req.params;
      const { transactionHash } = req.body;
      const allocationId = parseInt(id);

      if (isNaN(allocationId)) {
        return this.sendError(res, 'Invalid allocation ID', 400);
      }

      // Only admin can disburse fund allocations
      if (user.walletAddress !== process.env.ADMIN_WALLET_ADDRESS) {
        return this.sendError(res, 'Admin access required', 403);
      }

      const allocation = await storage.disburseFundAllocation(allocationId, transactionHash);
      if (!allocation) {
        return this.sendError(res, 'Fund allocation not found or not approved', 404);
      }

      this.sendSuccess(res, allocation, 'Fund allocation disbursed successfully');
    })
  ];

  // Get fund statistics
  getFundStatistics = [
    this.asyncHandler(async (req: Request, res: Response) => {
      const stats = await storage.getCorporateFundStatistics();
      this.sendSuccess(res, stats, 'Fund statistics retrieved successfully');
    })
  ];
}