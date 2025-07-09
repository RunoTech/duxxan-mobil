import { ethers } from 'ethers';
import { walletManager } from './wallet';
import { DUXXAN_CONTRACT_ABI } from './contractABI';

const USDT_ABI = [
  'function transfer(address to, uint256 amount) external returns (bool)',
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function balanceOf(address owner) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)'
];

export class BlockchainService {
  private static instance: BlockchainService;
  
  // Contract addresses - BSC Mainnet deployed
  private DUXXAN_CONTRACT = '0x7e1B19CE44AcCF69360A23cAdCBeA551B215Cade';
  private RAFFLE_CONTRACT = this.DUXXAN_CONTRACT; // Unified contract
  private DONATION_CONTRACT = this.DUXXAN_CONTRACT; // Unified contract
  private USDT_CONTRACT = import.meta.env.MODE === 'development' 
    ? '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd' // BSC Testnet USDT
    : '0x55d398326f99059fF775485246999027B3197955'; // BSC Mainnet USDT

  static getInstance(): BlockchainService {
    if (!BlockchainService.instance) {
      BlockchainService.instance = new BlockchainService();
    }
    return BlockchainService.instance;
  }

  private getConnection() {
    const connection = walletManager.getConnection();
    if (!connection) {
      throw new Error('Wallet not connected');
    }
    return connection;
  }

  // USDT operations
  async approveUSDT(spender: string, amount: string): Promise<string> {
    const { signer } = this.getConnection();
    const usdtContract = new ethers.Contract(this.USDT_CONTRACT, USDT_ABI, signer);
    
    const amountWei = ethers.parseUnits(amount, 6); // USDT has 6 decimals
    const tx = await usdtContract.approve(spender, amountWei);
    await tx.wait();
    
    return tx.hash;
  }

  async transferUSDT(to: string, amount: string): Promise<string> {
    const { signer } = this.getConnection();
    const usdtContract = new ethers.Contract(this.USDT_CONTRACT, USDT_ABI, signer);
    
    const amountWei = ethers.parseUnits(amount, 6);
    const tx = await usdtContract.transfer(to, amountWei);
    await tx.wait();
    
    return tx.hash;
  }

  async getUSDTAllowance(owner: string, spender: string): Promise<string> {
    const { provider } = this.getConnection();
    const usdtContract = new ethers.Contract(this.USDT_CONTRACT, USDT_ABI, provider);
    
    const allowance = await usdtContract.allowance(owner, spender);
    return ethers.formatUnits(allowance, 6);
  }

  // Raffle operations
  async createRaffle(
    prizeAmount: string,
    walletAddress: string
  ): Promise<{ success: boolean; transactionHash?: string; error?: string }> {
    try {
      const { signer } = this.getConnection();
      const duxxanContract = new ethers.Contract(this.DUXXAN_CONTRACT, DUXXAN_CONTRACT_ABI, signer);
      
      // For PHYSICAL_ITEM raffles, only pay creation fee (25 USDT)
      // For USDT_ONLY raffles, need creation fee + prize amount (restricted to authorized wallets)
      const creationFee = '25';
      await this.approveUSDT(this.DUXXAN_CONTRACT, creationFee);
      
      // Create a simple physical item raffle with minimal parameters
      // This allows any user to create raffles without restrictions
      const tx = await duxxanContract.createRaffle(
        "User Created Raffle", // title (will be updated in database)
        "Created via platform", // description (will be updated in database) 
        ethers.parseUnits(prizeAmount, 18), // prize amount
        ethers.parseUnits("1", 18), // ticket price (will be updated in database)
        100, // max tickets (will be updated in database)
        30 * 24 * 60 * 60, // 30 days duration
        1 // PrizeType.PHYSICAL_ITEM (no USDT restriction)
      );
      
      await tx.wait();
      
      return {
        success: true,
        transactionHash: tx.hash
      };
    } catch (error: any) {
      console.error('Blockchain transaction error:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        data: error.data,
        reason: error.reason,
        stack: error.stack
      });
      
      let errorMessage = 'Blockchain transaction failed';
      
      if (error.code === 4001) {
        errorMessage = 'İşlem kullanıcı tarafından reddedildi';
      } else if (error.code === -32603) {
        errorMessage = 'Smart contract hatası - Kontrat kurallarını kontrol edin';
      } else if (error.message?.includes('insufficient funds')) {
        errorMessage = 'Yetersiz bakiye - USDT veya BNB bakiyenizi kontrol edin';
      } else if (error.message?.includes('allowance')) {
        errorMessage = 'USDT onay hatası - Tekrar deneyin';
      } else if (error.message?.includes('network')) {
        errorMessage = 'Ağ bağlantı hatası - BSC ağında olduğunuzdan emin olun';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  async createRaffleOnContract(
    title: string,
    description: string,
    prizeAmount: string,
    ticketPrice: string,
    maxTickets: number,
    duration: number,
    prizeType: number = 0 // 0 = USDT_ONLY, 1 = PHYSICAL_ITEM
  ): Promise<string> {
    const { signer } = this.getConnection();
    const duxxanContract = new ethers.Contract(this.DUXXAN_CONTRACT, DUXXAN_CONTRACT_ABI, signer);
    
    // First approve USDT for the creation fee (25 USDT)
    await this.approveUSDT(this.DUXXAN_CONTRACT, '25');
    
    // For USDT prizes, also approve the prize amount
    if (prizeType === 0) {
      await this.approveUSDT(this.DUXXAN_CONTRACT, prizeAmount);
    }
    
    const prizeAmountWei = ethers.parseUnits(prizeAmount, 6);
    const ticketPriceWei = ethers.parseUnits(ticketPrice, 6);
    
    const tx = await duxxanContract.createRaffle(
      title,
      description,
      prizeAmountWei,
      ticketPriceWei,
      maxTickets,
      duration,
      prizeType
    );
    await tx.wait();
    
    return tx.hash;
  }

  async buyTickets(raffleId: number, quantity: number, ticketPrice: string): Promise<string> {
    const { signer } = this.getConnection();
    const duxxanContract = new ethers.Contract(this.DUXXAN_CONTRACT, DUXXAN_CONTRACT_ABI, signer);
    
    const totalAmount = (parseFloat(ticketPrice) * quantity).toString();
    await this.approveUSDT(this.DUXXAN_CONTRACT, totalAmount);
    
    const tx = await duxxanContract.buyTickets(raffleId, quantity);
    await tx.wait();
    
    return tx.hash;
  }

  // Donation operations
  async createDonation(
    title: string,
    description: string,
    goalAmount: string,
    duration: number,
    isUnlimited: boolean = false
  ): Promise<string> {
    const { signer } = this.getConnection();
    const duxxanContract = new ethers.Contract(this.DUXXAN_CONTRACT, DUXXAN_CONTRACT_ABI, signer);
    
    // First approve USDT for the creation fee (25 USDT)
    await this.approveUSDT(this.DUXXAN_CONTRACT, '25');
    
    const goalAmountWei = ethers.parseUnits(goalAmount, 6);
    const tx = await duxxanContract.createDonation(title, description, goalAmountWei, duration, isUnlimited);
    await tx.wait();
    
    return tx.hash;
  }

  async makeDonation(donationId: number, amount: string): Promise<string> {
    const { signer } = this.getConnection();
    const duxxanContract = new ethers.Contract(this.DUXXAN_CONTRACT, DUXXAN_CONTRACT_ABI, signer);
    
    await this.approveUSDT(this.DUXXAN_CONTRACT, amount);
    
    const tx = await duxxanContract.makeDonation(donationId, ethers.parseUnits(amount, 6));
    await tx.wait();
    
    return tx.hash;
  }

  // Event listeners for real-time updates
  subscribeToEvents(callback: (event: any) => void) {
    const { provider } = this.getConnection();
    const duxxanContract = new ethers.Contract(this.DUXXAN_CONTRACT, DUXXAN_CONTRACT_ABI, provider);
    
    // Raffle events
    duxxanContract.on('RaffleCreated', (raffleId, creator, prizeAmount, prizeType, event) => {
      callback({ type: 'RaffleCreated', raffleId, creator, prizeAmount, prizeType, event });
    });
    
    duxxanContract.on('TicketPurchased', (raffleId, buyer, quantity, event) => {
      callback({ type: 'TicketPurchased', raffleId, buyer, quantity, event });
    });
    
    duxxanContract.on('RaffleEnded', (raffleId, winner, prizeAmount, event) => {
      callback({ type: 'RaffleEnded', raffleId, winner, prizeAmount, event });
    });
    
    duxxanContract.on('PayoutReleased', (raffleId, winner, amount, event) => {
      callback({ type: 'PayoutReleased', raffleId, winner, amount, event });
    });
    
    // Donation events
    duxxanContract.on('DonationCreated', (donationId, creator, goalAmount, event) => {
      callback({ type: 'DonationCreated', donationId, creator, goalAmount, event });
    });
    
    duxxanContract.on('DonationMade', (donationId, donor, amount, event) => {
      callback({ type: 'DonationMade', donationId, donor, amount, event });
    });
  }

  // Admin functions
  async endRaffle(raffleId: number): Promise<string> {
    const { signer } = this.getConnection();
    const duxxanContract = new ethers.Contract(this.DUXXAN_CONTRACT, DUXXAN_CONTRACT_ABI, signer);
    
    const tx = await duxxanContract.endRaffle(raffleId);
    await tx.wait();
    
    return tx.hash;
  }

  async approveRaffleResult(raffleId: number, approve: boolean): Promise<string> {
    const { signer } = this.getConnection();
    const duxxanContract = new ethers.Contract(this.DUXXAN_CONTRACT, DUXXAN_CONTRACT_ABI, signer);
    
    const tx = await duxxanContract.approveRaffleResult(raffleId, approve);
    await tx.wait();
    
    return tx.hash;
  }
}

export const blockchainService = BlockchainService.getInstance();
