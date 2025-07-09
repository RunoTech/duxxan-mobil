// Contract fee constants from deployed DuxxanPlatform contract
export const CONTRACT_FEES = {
  // Creation fees (in USDT)
  RAFFLE_CREATION_FEE: 25,
  DONATION_CREATION_FEE: 25,
  
  // Commission rates (percentage)
  RAFFLE_COMMISSION_RATE: 10,
  DONATION_COMMISSION_RATE: 2,
  
  // Commission distribution (percentage)
  PLATFORM_SHARE: 50,
  CREATOR_SHARE: 50,
  
  // Prize types
  PRIZE_TYPE: {
    USDT_ONLY: 0,
    PHYSICAL_ITEM: 1
  }
} as const;

// Helper functions
export const calculateRaffleCommission = (totalAmount: number) => {
  const commission = (totalAmount * CONTRACT_FEES.RAFFLE_COMMISSION_RATE) / 100;
  const platformShare = (commission * CONTRACT_FEES.PLATFORM_SHARE) / 100;
  const creatorShare = (commission * CONTRACT_FEES.CREATOR_SHARE) / 100;
  
  return {
    totalCommission: commission,
    platformShare,
    creatorShare
  };
};

export const calculateDonationCommission = (amount: number) => {
  const commission = (amount * CONTRACT_FEES.DONATION_COMMISSION_RATE) / 100;
  const platformShare = commission; // 100% to platform for donations
  const creatorShare = 0; // 0% to creator for donations
  
  return {
    totalCommission: commission,
    platformShare,
    creatorShare
  };
};