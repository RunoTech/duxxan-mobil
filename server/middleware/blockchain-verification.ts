import { Request, Response, NextFunction } from 'express';
import { ethers } from 'ethers';

// DUXXAN Smart Contract Address on BSC Mainnet
const DUXXAN_CONTRACT = '0x7e1B19CE44AcCF69360A23cAdCBeA551B215Cade';
const BSC_RPC = 'https://bsc-dataseed.binance.org/';

interface VerificationCache {
  [txHash: string]: {
    verified: boolean;
    timestamp: number;
    amount: string;
  };
}

// Cache verified transactions for 1 hour
const verificationCache: VerificationCache = {};
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

// Clean cache every 30 minutes
setInterval(() => {
  const now = Date.now();
  Object.keys(verificationCache).forEach(txHash => {
    if (now - verificationCache[txHash].timestamp > CACHE_DURATION) {
      delete verificationCache[txHash];
    }
  });
}, 30 * 60 * 1000);

export class BlockchainVerifier {
  private provider: ethers.JsonRpcProvider;
  
  constructor() {
    this.provider = new ethers.JsonRpcProvider(BSC_RPC);
  }

  // Verify raffle creation payment (25 USDT)
  async verifyRaffleCreation(transactionHash: string, userWallet: string): Promise<boolean> {
    try {
      // Check cache first
      if (verificationCache[transactionHash]) {
        const cached = verificationCache[transactionHash];
        if (Date.now() - cached.timestamp < CACHE_DURATION) {
          return cached.verified;
        }
      }

      const tx = await this.provider.getTransaction(transactionHash);
      if (!tx) {
        console.error(`Transaction not found: ${transactionHash}`);
        return false;
      }

      // Verify transaction details
      const receipt = await this.provider.getTransactionReceipt(transactionHash);
      if (!receipt || receipt.status !== 1) {
        console.error(`Transaction failed or not confirmed: ${transactionHash}`);
        return false;
      }

      // Verify contract address
      if (tx.to?.toLowerCase() !== DUXXAN_CONTRACT.toLowerCase()) {
        console.error(`Invalid contract address. Expected: ${DUXXAN_CONTRACT}, Got: ${tx.to}`);
        return false;
      }

      // Verify sender wallet
      if (tx.from?.toLowerCase() !== userWallet.toLowerCase()) {
        console.error(`Wallet mismatch. Expected: ${userWallet}, Got: ${tx.from}`);
        return false;
      }

      // Verify amount (25 USDT minimum)
      const expectedAmount = ethers.parseUnits('25', 18);
      if (tx.value < expectedAmount) {
        console.error(`Insufficient amount. Expected: 25 USDT, Got: ${ethers.formatEther(tx.value)} BNB`);
        return false;
      }

      // Verify transaction is recent (within 24 hours)
      const block = await this.provider.getBlock(receipt.blockNumber);
      if (!block) {
        console.error(`Block not found: ${receipt.blockNumber}`);
        return false;
      }

      const txAge = Date.now() / 1000 - block.timestamp;
      if (txAge > 24 * 60 * 60) { // 24 hours
        console.error(`Transaction too old: ${txAge} seconds`);
        return false;
      }

      // Cache the result
      verificationCache[transactionHash] = {
        verified: true,
        timestamp: Date.now(),
        amount: ethers.formatEther(tx.value)
      };

      console.log(`✅ Verified raffle creation payment: ${transactionHash}`);
      return true;

    } catch (error) {
      console.error('Blockchain verification error:', error);
      return false;
    }
  }

  // Verify ticket purchase payment
  async verifyTicketPurchase(transactionHash: string, userWallet: string, expectedAmount: string): Promise<boolean> {
    try {
      const tx = await this.provider.getTransaction(transactionHash);
      if (!tx) return false;

      const receipt = await this.provider.getTransactionReceipt(transactionHash);
      if (!receipt || receipt.status !== 1) return false;

      // Verify contract and sender
      if (tx.to?.toLowerCase() !== DUXXAN_CONTRACT.toLowerCase()) return false;
      if (tx.from?.toLowerCase() !== userWallet.toLowerCase()) return false;

      // Verify amount
      const expected = ethers.parseUnits(expectedAmount, 18);
      if (tx.value < expected) return false;

      // Verify transaction is recent
      const block = await this.provider.getBlock(receipt.blockNumber);
      if (!block) return false;

      const txAge = Date.now() / 1000 - block.timestamp;
      if (txAge > 1 * 60 * 60) return false; // 1 hour for tickets

      console.log(`✅ Verified ticket purchase: ${transactionHash} for ${expectedAmount} USDT`);
      return true;

    } catch (error) {
      console.error('Ticket verification error:', error);
      return false;
    }
  }

  // Check if transaction hash was already used
  async isTransactionUsed(transactionHash: string): Promise<boolean> {
    // This should check your database for already used transaction hashes
    // Implementation depends on your storage system
    return false;
  }
}

export const blockchainVerifier = new BlockchainVerifier();

// Middleware for raffle creation verification
export const verifyRaffleCreationPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { transactionHash } = req.body;
    const walletAddress = req.headers['x-wallet-address'] as string;

    if (!transactionHash) {
      return res.status(400).json({
        success: false,
        message: 'Transaction hash required for raffle creation'
      });
    }

    if (!walletAddress) {
      return res.status(401).json({
        success: false,
        message: 'Wallet address required'
      });
    }

    // Check if transaction was already used
    const isUsed = await blockchainVerifier.isTransactionUsed(transactionHash);
    if (isUsed) {
      return res.status(400).json({
        success: false,
        message: 'Transaction hash already used'
      });
    }

    // Verify payment
    const verified = await blockchainVerifier.verifyRaffleCreation(transactionHash, walletAddress);
    if (!verified) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed. Please ensure you sent 25 USDT to the DUXXAN contract.'
      });
    }

    next();
  } catch (error) {
    console.error('Payment verification middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed'
    });
  }
};

// Middleware for ticket purchase verification
export const verifyTicketPurchasePayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { transactionHash, amount } = req.body;
    const walletAddress = req.headers['x-wallet-address'] as string;

    if (!transactionHash || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Transaction hash and amount required'
      });
    }

    const verified = await blockchainVerifier.verifyTicketPurchase(transactionHash, walletAddress, amount);
    if (!verified) {
      return res.status(400).json({
        success: false,
        message: 'Ticket payment verification failed'
      });
    }

    next();
  } catch (error) {
    console.error('Ticket verification middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Ticket payment verification failed'
    });
  }
};