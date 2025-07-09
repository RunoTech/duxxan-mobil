import { body, param, query } from 'express-validator';
import { z } from 'zod';

// Zod schemas for type-safe validation
export const createRaffleSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(1000),
  prizeValue: z.string().min(1),
  ticketPrice: z.string().min(1),
  maxTickets: z.number().int().min(1),
  endDate: z.string().refine((date) => new Date(date) > new Date(), {
    message: 'End date must be in the future'
  }),
  categoryId: z.number().int().min(1),
  allowedCountries: z.string().optional(),
  excludedCountries: z.string().optional(),
  termsAndConditions: z.string().min(10).max(5000)
});

export const createDonationSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(2000),
  targetAmount: z.string().min(1),
  organizationType: z.enum(['individual', 'organization']),
  organizationName: z.string().optional(),
  organizationDocument: z.string().optional(),
  allowedCountries: z.string().optional(),
  excludedCountries: z.string().optional(),
  isUrgent: z.boolean().default(false),
  categoryId: z.number().int().min(1).optional()
});

export const purchaseTicketSchema = z.object({
  raffleId: z.number().int().min(1),
  quantity: z.number().int().min(1).max(100),
  totalAmount: z.string().min(1),
  transactionHash: z.string().optional()
});

export const contributionSchema = z.object({
  donationId: z.number().int().min(1),
  amount: z.string().regex(/^\d+(\.\d{1,6})?$/, 'Invalid amount format').refine(val => parseFloat(val) >= 10, "Minimum donation amount is 10 USDT"),
  isAnonymous: z.boolean().default(false),
  message: z.string().max(500).optional(),
  transactionHash: z.string().optional()
});

export const chatMessageSchema = z.object({
  raffleId: z.number().int().min(1),
  receiverId: z.number().int().min(1),
  content: z.string().min(1).max(500),
  messageType: z.enum(['text', 'image', 'system']).default('text')
});

export const userRatingSchema = z.object({
  ratedUserId: z.number().int().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional()
});

// Express validator middleware
export const walletValidation = [
  body('walletAddress')
    .matches(/^0x[a-fA-F0-9]{40}$/)
    .withMessage('Invalid wallet address format')
];

export const amountValidation = [
  body('amount')
    .isNumeric()
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number')
];

export const textValidation = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters')
];

export const raffleValidation = [
  body('title').trim().isLength({ min: 3, max: 100 }),
  body('description').trim().isLength({ min: 10, max: 1000 }),
  body('prizeValue').isNumeric().isFloat({ min: 0.01 }),
  body('ticketPrice').isNumeric().isFloat({ min: 0.01 }),
  body('maxTickets').isInt({ min: 1 }),
  body('endDate').isISO8601().toDate(),
  body('categoryId').isInt({ min: 1 })
];

export const donationValidation = [
  body('title').trim().isLength({ min: 3, max: 100 }),
  body('description').trim().isLength({ min: 10, max: 2000 }),
  body('targetAmount').isNumeric().isFloat({ min: 0.01 }),
  body('organizationType').isIn(['individual', 'organization'])
];

export const ticketPurchaseValidation = [
  body('raffleId').isInt({ min: 1 }),
  body('quantity').isInt({ min: 1, max: 100 }),
  body('totalAmount').isNumeric().isFloat({ min: 0.01 })
];

export const contributionValidation = [
  body('donationId').isInt({ min: 1 }),
  body('amount').isNumeric().isFloat({ min: 0.01 }),
  body('isAnonymous').optional().isBoolean()
];

export const userUpdateValidation = [
  body('username').optional().trim().isLength({ min: 3, max: 50 }),
  body('email').optional().isEmail(),
  body('name').optional().trim().isLength({ min: 2, max: 100 }),
  body('bio').optional().trim().isLength({ max: 500 })
];

export const paginationValidation = [
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('offset').optional().isInt({ min: 0 })
];

export const idValidation = [
  param('id').isInt({ min: 1 }).withMessage('Invalid ID parameter')
];

// Validation middleware factory
export const createValidationMiddleware = (validations: any[]) => {
  return validations;
};