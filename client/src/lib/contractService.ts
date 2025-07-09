import { BrowserProvider, Contract, formatUnits, parseUnits, JsonRpcSigner } from 'ethers';
import { DUXXAN_CONTRACT_ABI } from './contractABI';

export class ContractService {
  private contract: Contract | null = null;
  private provider: BrowserProvider | null = null;
  private signer: JsonRpcSigner | null = null;

  // BSC Contract Addresses
  private readonly CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '';
  private readonly USDT_ADDRESS = '0x55d398326f99059fF775485246999027B3197955'; // BSC Mainnet USDT

  async initialize() {
    if (!window.ethereum) {
      throw new Error('MetaMask not found');
    }

    this.provider = new BrowserProvider(window.ethereum);
    await this.provider.send("eth_requestAccounts", []);
    this.signer = await this.provider.getSigner();
    
    if (!this.CONTRACT_ADDRESS) {
      throw new Error('Contract address not configured');
    }

    this.contract = new Contract(
      this.CONTRACT_ADDRESS,
      DUXXAN_CONTRACT_ABI,
      this.signer
    );

    // Ensure we're on BSC network
    await this.ensureBSCNetwork();
  }

  private async ensureBSCNetwork() {
    if (!this.provider) throw new Error('Provider not initialized');

    const network = await this.provider.getNetwork();
    const BSC_CHAIN_ID = 56; // BSC Mainnet

    if (Number(network.chainId) !== BSC_CHAIN_ID) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${BSC_CHAIN_ID.toString(16)}` }],
        });
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          // Network not added to MetaMask
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: `0x${BSC_CHAIN_ID.toString(16)}`,
              chainName: 'Binance Smart Chain',
              nativeCurrency: {
                name: 'BNB',
                symbol: 'BNB',
                decimals: 18,
              },
              rpcUrls: ['https://bsc-dataseed.binance.org/'],
              blockExplorerUrls: ['https://bscscan.com/'],
            }],
          });
        } else {
          throw switchError;
        }
      }
    }
  }

  async approveUSDT(amount: string) {
    if (!this.signer) throw new Error('Signer not initialized');
    
    const usdtContract = new Contract(
      this.USDT_ADDRESS,
      [
        'function approve(address spender, uint256 amount) external returns (bool)',
        'function allowance(address owner, address spender) external view returns (uint256)',
      ],
      this.signer
    );

    const amountWei = parseUnits(amount, 18);
    const tx = await usdtContract.approve(this.CONTRACT_ADDRESS, amountWei);
    await tx.wait();
    return tx.hash;
  }

  async createRaffle(
    title: string,
    description: string,
    prizeAmount: string,
    ticketPrice: string,
    maxTickets: number,
    duration: number
  ) {
    if (!this.contract) throw new Error('Contract not initialized');

    const prizeAmountWei = parseUnits(prizeAmount, 18);
    const ticketPriceWei = parseUnits(ticketPrice, 18);
    const durationSeconds = duration * 24 * 60 * 60; // Convert days to seconds

    // First approve USDT for prize amount + creation fee
    const totalAmount = parseUnits((parseFloat(prizeAmount) + 25).toString(), 18);
    await this.approveUSDT(formatUnits(totalAmount, 18));

    const tx = await this.contract.createRaffle(
      title,
      description,
      prizeAmountWei,
      ticketPriceWei,
      maxTickets,
      durationSeconds
    );

    const receipt = await tx.wait();
    const event = receipt.events?.find((e: any) => e.event === 'RaffleCreated');
    
    return {
      transactionHash: tx.hash,
      raffleId: event?.args?.raffleId?.toNumber(),
      gasUsed: receipt.gasUsed.toString(),
    };
  }

  async buyTickets(raffleId: number, quantity: number) {
    if (!this.contract) throw new Error('Contract not initialized');

    const raffle = await this.contract.getRaffle(raffleId);
    const totalCost = raffle.ticketPrice.mul(quantity);

    // Approve USDT for ticket purchase
    await this.approveUSDT(formatUnits(totalCost, 18));

    const tx = await this.contract.buyTickets(raffleId, quantity);
    const receipt = await tx.wait();

    return {
      transactionHash: tx.hash,
      totalCost: formatUnits(totalCost, 18),
      gasUsed: receipt.gasUsed.toString(),
    };
  }

  async createDonation(
    title: string,
    description: string,
    goalAmount: string,
    duration: number,
    orgType: number
  ) {
    if (!this.contract) throw new Error('Contract not initialized');

    const goalAmountWei = parseUnits(goalAmount, 18);
    const durationSeconds = duration > 0 ? duration * 24 * 60 * 60 : 0;

    // Approve USDT for creation fee
    await this.approveUSDT('25');

    const tx = await this.contract.createDonation(
      title,
      description,
      goalAmountWei,
      durationSeconds,
      orgType
    );

    const receipt = await tx.wait();
    const event = receipt.events?.find((e: any) => e.event === 'DonationCreated');

    return {
      transactionHash: tx.hash,
      donationId: event?.args?.donationId?.toNumber(),
      gasUsed: receipt.gasUsed.toString(),
    };
  }

  async donate(donationId: number, amount: string) {
    if (!this.contract) throw new Error('Contract not initialized');

    const amountWei = parseUnits(amount, 18);

    // Approve USDT for donation
    await this.approveUSDT(amount);

    const tx = await this.contract.donate(donationId, amountWei);
    const receipt = await tx.wait();

    return {
      transactionHash: tx.hash,
      amount,
      gasUsed: receipt.gasUsed.toString(),
    };
  }

  async getRaffle(raffleId: number) {
    if (!this.contract) throw new Error('Contract not initialized');
    
    const raffle = await this.contract.getRaffle(raffleId);
    return {
      id: raffle.id.toNumber(),
      creator: raffle.creator,
      title: raffle.title,
      description: raffle.description,
      prizeAmount: formatUnits(raffle.prizeAmount, 18),
      ticketPrice: formatUnits(raffle.ticketPrice, 18),
      maxTickets: raffle.maxTickets.toNumber(),
      ticketsSold: raffle.ticketsSold.toNumber(),
      endTime: new Date(raffle.endTime.toNumber() * 1000),
      isActive: raffle.isActive,
      isCompleted: raffle.isCompleted,
      winner: raffle.winner,
      totalAmount: formatUnits(raffle.totalAmount, 18),
    };
  }

  async getDonation(donationId: number) {
    if (!this.contract) throw new Error('Contract not initialized');
    
    const donation = await this.contract.getDonation(donationId);
    return {
      id: donation.id.toNumber(),
      creator: donation.creator,
      title: donation.title,
      description: donation.description,
      goalAmount: formatUnits(donation.goalAmount, 18),
      currentAmount: formatUnits(donation.currentAmount, 18),
      endTime: donation.endTime.toNumber() > 0 ? new Date(donation.endTime.toNumber() * 1000) : null,
      isActive: donation.isActive,
      isUnlimited: donation.isUnlimited,
      orgType: donation.orgType,
    };
  }

  async getUserTickets(raffleId: number, userAddress: string) {
    if (!this.contract) throw new Error('Contract not initialized');
    
    const tickets = await this.contract.getUserTickets(raffleId, userAddress);
    return tickets.toNumber();
  }

  async getUserDonations(donationId: number, userAddress: string) {
    if (!this.contract) throw new Error('Contract not initialized');
    
    const amount = await this.contract.getUserDonations(donationId, userAddress);
    return formatUnits(amount, 18);
  }

  async getActiveRafflesCount() {
    if (!this.contract) throw new Error('Contract not initialized');
    
    const count = await this.contract.getActiveRafflesCount();
    return count.toNumber();
  }

  async getActiveDonationsCount() {
    if (!this.contract) throw new Error('Contract not initialized');
    
    const count = await this.contract.getActiveDonationsCount();
    return count.toNumber();
  }

  async endRaffle(raffleId: number) {
    if (!this.contract) throw new Error('Contract not initialized');
    
    const tx = await this.contract.endRaffle(raffleId);
    const receipt = await tx.wait();

    return {
      transactionHash: tx.hash,
      gasUsed: receipt.gasUsed.toString(),
    };
  }
}

export const contractService = new ContractService();