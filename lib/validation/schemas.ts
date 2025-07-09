import { z } from 'zod';

// User validation schemas
export const createUserSchema = z.object({
  walletAddress: z.string().length(42).regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address'),
  username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  name: z.string().min(1).max(100).optional(),
  profession: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
  email: z.string().email().optional(),
  phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/).optional(),
  organizationType: z.enum(['individual', 'foundation', 'association']).default('individual'),
  organizationName: z.string().max(200).optional(),
  website: z.string().url().optional(),
});

export const updateUserSchema = createUserSchema.partial();

// Raffle validation schemas
export const createRaffleSchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().min(10).max(2000),
  prizeValue: z.string().regex(/^\d+(\.\d{1,6})?$/, 'Invalid price format'),
  ticketPrice: z.string().regex(/^\d+(\.\d{1,6})?$/, 'Invalid price format'),
  maxTickets: z.number().int().min(1).max(100000),
  endDate: z.string().datetime(),
  categoryId: z.number().int().positive(),
  countryRestriction: z.enum(['all', 'selected', 'exclude']).default('all'),
  allowedCountries: z.array(z.string().length(2)).optional(),
  excludedCountries: z.array(z.string().length(2)).optional(),
});

export const updateRaffleSchema = createRaffleSchema.partial();

// Donation validation schemas
export const createDonationSchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().min(20).max(2000),
  goalAmount: z.string().regex(/^\d+(\.\d{1,6})?$/, 'Invalid amount format'),
  category: z.string().min(1).max(50),
  organizationType: z.enum(['foundation', 'association', 'individual']),
  isUnlimited: z.boolean().default(false),
  endDate: z.string().datetime().optional(),
  country: z.string().length(2).optional(),
});

export const updateDonationSchema = createDonationSchema.partial();

// Ticket purchase validation
export const purchaseTicketSchema = z.object({
  quantity: z.number().int().min(1).max(100),
  transactionHash: z.string().length(66).regex(/^0x[a-fA-F0-9]{64}$/),
});

// Donation contribution validation
export const contributionSchema = z.object({
  amount: z.string().regex(/^\d+(\.\d{1,6})?$/, 'Invalid amount format').refine(val => parseFloat(val) >= 10, "Minimum donation amount is 10 USDT"),
  transactionHash: z.string().length(66).regex(/^0x[a-fA-F0-9]{64}$/),
});

// Chat message validation
export const chatMessageSchema = z.object({
  message: z.string().min(1).max(1000).trim(),
});

// User rating validation
export const userRatingSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().max(500).optional(),
});

// Device registration validation
export const deviceSchema = z.object({
  deviceType: z.enum(['mobile', 'desktop', 'tablet']),
  deviceName: z.string().max(100),
  userAgent: z.string().max(500),
  ipAddress: z.string().ip(),
});

// Photo upload validation
export const photoUploadSchema = z.object({
  photoType: z.enum(['profile', 'verification', 'document']),
  photoUrl: z.string().url(),
  description: z.string().max(200).optional(),
});

// Search and filter schemas
export const searchSchema = z.object({
  query: z.string().min(1).max(100).optional(),
  category: z.string().optional(),
  minPrice: z.string().regex(/^\d+(\.\d{1,6})?$/).optional(),
  maxPrice: z.string().regex(/^\d+(\.\d{1,6})?$/).optional(),
  country: z.string().length(2).optional(),
  organizationType: z.enum(['individual', 'foundation', 'association']).optional(),
  sortBy: z.enum(['newest', 'oldest', 'price-low', 'price-high', 'ending-soon']).default('newest'),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(20),
});

// Pagination schema
export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).optional(),
});

// Common validation helpers
export const validateId = z.number().int().positive();
export const validateWalletAddress = z.string().length(42).regex(/^0x[a-fA-F0-9]{40}$/);
export const validateTransactionHash = z.string().length(66).regex(/^0x[a-fA-F0-9]{64}$/);
export const validateAmount = z.string().regex(/^\d+(\.\d{1,6})?$/);
export const validateUsername = z.string().min(3).max(50).regex(/^[a-zA-Z0-9_]+$/);

// Form validation error formatter
export const formatValidationErrors = (error: z.ZodError) => {
  return error.errors.map(err => ({
    field: err.path.join('.'),
    message: err.message,
    code: err.code
  }));
};

// Validation middleware creator
export const createValidationMiddleware = (schema: z.ZodSchema) => {
  return (req: any, res: any, next: any) => {
    try {
      const validatedData = schema.parse(req.body);
      req.validatedData = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: formatValidationErrors(error)
        });
      }
      next(error);
    }
  };
};

// Client-side validation helpers
export const validateClientData = <T>(schema: z.ZodSchema<T>, data: unknown): { success: boolean; data?: T; errors?: string[] } => {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      };
    }
    return { success: false, errors: ['Unknown validation error'] };
  }
};