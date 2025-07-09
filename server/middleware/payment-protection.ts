import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage.js';

/**
 * CRITICAL SECURITY: Payment Protection Middleware
 * Prevents interaction with raffles that have no verified payment
 */

export const validateRafflePayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const raffleId = parseInt(req.params.id || req.body.raffleId);
    
    if (isNaN(raffleId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid raffle ID'
      });
    }

    // Get raffle with payment verification
    const raffle = await storage.getRaffleById(raffleId);
    
    if (!raffle) {
      return res.status(404).json({
        success: false,
        message: 'Raffle not found'
      });
    }

    // CRITICAL CHECK: Raffle must have verified payment
    if (!raffle.transactionHash) {
      console.warn(`🚨 BLOCKED: Attempt to interact with unpaid raffle ${raffleId}`);
      
      return res.status(403).json({
        success: false,
        message: 'This raffle was created without proper payment verification and cannot be used.',
        error_code: 'UNPAID_RAFFLE',
        raffle_id: raffleId
      });
    }

    // Additional check: Verify transaction format
    if (!raffle.transactionHash.match(/^0x[a-fA-F0-9]{64}$/)) {
      console.warn(`🚨 BLOCKED: Invalid transaction hash format for raffle ${raffleId}`);
      
      return res.status(403).json({
        success: false,
        message: 'Raffle has invalid payment verification.',
        error_code: 'INVALID_PAYMENT_HASH'
      });
    }

    // Store verified raffle in request for next middleware
    (req as any).verifiedRaffle = raffle;
    next();

  } catch (error) {
    console.error('Payment validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed'
    });
  }
};

/**
 * Enhanced raffle listing that marks unpaid raffles
 */
export const enhanceRaffleList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get original response data
    const originalSend = res.json;
    
    res.json = function(data: any) {
      // If this is a raffle list response, enhance it
      if (data && Array.isArray(data.data || data)) {
        const raffles = data.data || data;
        
        const enhancedRaffles = raffles.map((raffle: any) => ({
          ...raffle,
          isPaymentVerified: !!raffle.transactionHash,
          paymentStatus: raffle.transactionHash ? 'verified' : 'unverified',
          // Hide unpaid raffles from public view
          ...(raffle.transactionHash ? {} : {
            title: '[UNVERIFIED RAFFLE - HIDDEN]',
            description: 'This raffle cannot be displayed due to payment verification issues.',
            isActive: false
          })
        }));

        if (data.data) {
          data.data = enhancedRaffles;
        } else {
          data = enhancedRaffles;
        }
      }
      
      return originalSend.call(this, data);
    };

    next();
  } catch (error) {
    console.error('Raffle enhancement error:', error);
    next();
  }
};

/**
 * Audit trail for unpaid raffle attempts
 */
export const logUnpaidRaffleAttempt = (action: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const originalSend = res.json;
    
    res.json = function(data: any) {
      // Log if this was an attempt to use unpaid raffle
      if (data && data.error_code === 'UNPAID_RAFFLE') {
        console.warn(`🚨 SECURITY ALERT: ${action} attempted on unpaid raffle`, {
          raffleId: data.raffle_id,
          userIP: req.ip,
          userAgent: req.get('user-agent'),
          timestamp: new Date().toISOString(),
          action: action
        });
      }
      
      return originalSend.call(this, data);
    };

    next();
  };
};