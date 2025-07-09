import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { DonationService } from '../services/DonationService';
import { insertDonationSchema, insertDonationContributionSchema } from '@shared/schema';
import { z } from 'zod';

export class DonationController extends BaseController {
  private donationService = new DonationService();

  // Get all donations with pagination and filtering
  getDonations = this.asyncHandler(async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    const filter = req.query.filter as string;

    const donations = await this.donationService.getDonations(limit, offset, filter);
    this.sendSuccess(res, donations, 'Donations retrieved successfully');
  });

  // Get active donations
  getActiveDonations = this.asyncHandler(async (req: Request, res: Response) => {
    const donations = await this.donationService.getActiveDonations();
    this.sendSuccess(res, donations, 'Active donations retrieved successfully');
  });

  // Get donation by ID
  getDonationById = this.asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const donationId = parseInt(id);

    if (isNaN(donationId)) {
      return this.sendError(res, 'Invalid donation ID', 400);
    }

    const donation = await this.donationService.getDonationById(donationId);
    if (!donation) {
      return this.sendError(res, 'Donation not found', 404);
    }

    this.sendSuccess(res, donation, 'Donation retrieved successfully');
  });

  // Create new donation
  createDonation = [
    this.requireAuth(),
    this.requireWallet(),
    this.validateBody(insertDonationSchema),
    this.asyncHandler(async (req: Request, res: Response) => {
      const user = req.user;
      const donationData = { ...req.body, creatorId: user.id };

      try {
        const donation = await this.donationService.createDonation(donationData);
        this.sendSuccess(res, donation, 'Donation created successfully', 201);
      } catch (error) {
        if (error instanceof Error) {
          return this.sendError(res, error.message, 400);
        }
        throw error;
      }
    })
  ];

  // Update donation
  updateDonation = [
    this.requireAuth(),
    this.requireWallet(),
    this.validateBody(insertDonationSchema.partial()),
    this.asyncHandler(async (req: Request, res: Response) => {
      const { id } = req.params;
      const donationId = parseInt(id);
      const user = req.user;

      if (isNaN(donationId)) {
        return this.sendError(res, 'Invalid donation ID', 400);
      }

      // Check if user owns the donation
      const existingDonation = await this.donationService.getDonationById(donationId);
      if (!existingDonation) {
        return this.sendError(res, 'Donation not found', 404);
      }

      if (existingDonation.creatorId !== user.id) {
        return this.sendError(res, 'Unauthorized to update this donation', 403);
      }

      const updatedDonation = await this.donationService.updateDonation(donationId, req.body);
      if (!updatedDonation) {
        return this.sendError(res, 'Failed to update donation', 400);
      }

      this.sendSuccess(res, updatedDonation, 'Donation updated successfully');
    })
  ];

  // Get donations by creator
  getDonationsByCreator = this.asyncHandler(async (req: Request, res: Response) => {
    const { creatorId } = req.params;
    const id = parseInt(creatorId);

    if (isNaN(id)) {
      return this.sendError(res, 'Invalid creator ID', 400);
    }

    const donations = await this.donationService.getDonationsByCreator(id);
    this.sendSuccess(res, donations, 'Creator donations retrieved successfully');
  });

  // Make donation contribution
  makeDonationContribution = [
    this.requireAuth(),
    this.requireWallet(),
    this.validateBody(z.object({
      donationId: z.number().min(1, 'Donation ID is required'),
      amount: z.string().min(1, 'Amount is required'),
      isAnonymous: z.boolean().default(false),
      message: z.string().max(500).optional(),
      transactionHash: z.string().optional()
    })),
    this.asyncHandler(async (req: Request, res: Response) => {
      const user = req.user;
      const { donationId, amount, isAnonymous, message, transactionHash } = req.body;

      // Check if donation exists and is active
      const donation = await this.donationService.getDonationById(donationId);
      if (!donation) {
        return this.sendError(res, 'Donation not found', 404);
      }

      if (!donation.isActive) {
        return this.sendError(res, 'Donation is not active', 400);
      }

      try {
        const contribution = await this.donationService.makeDonationContribution(
          user.id,
          donationId,
          amount,
          isAnonymous,
          message,
          transactionHash
        );

        this.sendSuccess(res, contribution, 'Donation contribution made successfully', 201);
      } catch (error) {
        if (error instanceof Error) {
          return this.sendError(res, error.message, 400);
        }
        throw error;
      }
    })
  ];

  // Get donation contributions
  getDonationContributions = this.asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const donationId = parseInt(id);

    if (isNaN(donationId)) {
      return this.sendError(res, 'Invalid donation ID', 400);
    }

    const contributions = await this.donationService.getDonationContributions(donationId);
    this.sendSuccess(res, contributions, 'Donation contributions retrieved successfully');
  });

  // Get donations by organization type
  getDonationsByOrganizationType = this.asyncHandler(async (req: Request, res: Response) => {
    const { orgType } = req.params;

    if (!['individual', 'organization'].includes(orgType)) {
      return this.sendError(res, 'Invalid organization type', 400);
    }

    const donations = await this.donationService.getDonationsByOrganizationType(orgType);
    this.sendSuccess(res, donations, 'Donations by organization type retrieved successfully');
  });

  // Get my donations (created by current user)
  getMyDonations = [
    this.requireAuth(),
    this.asyncHandler(async (req: Request, res: Response) => {
      const user = req.user;
      const donations = await this.donationService.getDonationsByCreator(user.id);
      this.sendSuccess(res, donations, 'Your donations retrieved successfully');
    })
  ];

  // Get donation statistics
  getDonationStats = this.asyncHandler(async (req: Request, res: Response) => {
    const stats = await this.donationService.getDonationStats();
    this.sendSuccess(res, stats, 'Donation statistics retrieved successfully');
  });

  // Process startup fee payment
  processStartupFeePayment = [
    this.requireAuth(),
    this.requireWallet(),
    this.validateBody(z.object({
      donationId: z.number().min(1, 'Donation ID is required'),
      transactionHash: z.string().min(1, 'Transaction hash is required')
    })),
    this.asyncHandler(async (req: Request, res: Response) => {
      const user = req.user;
      const { donationId, transactionHash } = req.body;

      // Check if user owns the donation
      const donation = await this.donationService.getDonationById(donationId);
      if (!donation) {
        return this.sendError(res, 'Donation not found', 404);
      }

      if (donation.creatorId !== user.id) {
        return this.sendError(res, 'Unauthorized to process payment for this donation', 403);
      }

      try {
        await this.donationService.processStartupFeePayment(donationId, transactionHash);
        this.sendSuccess(res, { processed: true }, 'Startup fee payment processed successfully');
      } catch (error) {
        if (error instanceof Error) {
          return this.sendError(res, error.message, 400);
        }
        throw error;
      }
    })
  ];
}