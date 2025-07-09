const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying DuxxanPlatform contract to BSC...");

  // Get deployer
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.utils.formatEther(balance), "BNB");

  // BSC Mainnet USDT address
  const USDT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955";
  
  // Commission wallet from environment
  const COMMISSION_WALLET = process.env.COMMISSION_WALLET;
  
  if (!COMMISSION_WALLET) {
    throw new Error("COMMISSION_WALLET environment variable required");
  }

  console.log("USDT Token Address:", USDT_ADDRESS);
  console.log("Commission Wallet:", COMMISSION_WALLET);

  // Deploy contract
  const DuxxanPlatform = await ethers.getContractFactory("DuxxanPlatform");
  console.log("Deploying contract...");
  
  const duxxanPlatform = await DuxxanPlatform.deploy(USDT_ADDRESS, COMMISSION_WALLET);
  await duxxanPlatform.deployed();

  console.log("DuxxanPlatform deployed to:", duxxanPlatform.address);
  
  // Verify contract configuration
  console.log("\n=== Contract Configuration ===");
  console.log("Raffle Creation Fee:", ethers.utils.formatEther(await duxxanPlatform.RAFFLE_CREATION_FEE()), "USDT");
  console.log("Donation Creation Fee:", ethers.utils.formatEther(await duxxanPlatform.DONATION_CREATION_FEE()), "USDT");
  console.log("Raffle Commission Rate:", (await duxxanPlatform.RAFFLE_COMMISSION_RATE()).toString() + "%");
  console.log("Donation Commission Rate:", (await duxxanPlatform.DONATION_COMMISSION_RATE()).toString() + "%");
  console.log("Platform Share:", (await duxxanPlatform.PLATFORM_SHARE()).toString() + "%");
  console.log("Creator Share:", (await duxxanPlatform.CREATOR_SHARE()).toString() + "%");
  
  // Save deployment info
  const deploymentInfo = {
    network: "bsc-mainnet",
    contractAddress: duxxanPlatform.address,
    usdtAddress: USDT_ADDRESS,
    commissionWallet: COMMISSION_WALLET,
    deployWallet: deployer.address,
    deploymentTime: new Date().toISOString(),
    transactionHash: duxxanPlatform.deployTransaction.hash,
    blockNumber: duxxanPlatform.deployTransaction.blockNumber
  };

  console.log("\n=== Deployment Success ===");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  // Verification command for BSCScan
  console.log("\n=== BSCScan Verification ===");
  console.log(`npx hardhat verify --network bsc ${duxxanPlatform.address} "${USDT_ADDRESS}" "${COMMISSION_WALLET}"`);
  
  console.log("\n=== Contract Features ===");
  console.log("✅ Multi-signature approval system");
  console.log("✅ Physical prize management (6-day claim)");
  console.log("✅ Admin manual winner selection");
  console.log("✅ USDT raffle restrictions");
  console.log("✅ 6-layer BSC randomness generation");
  console.log("✅ Instant donation transfers");
  console.log("✅ Emergency controls");
  
  return duxxanPlatform.address;
}

main()
  .then((address) => {
    console.log(`\n🎉 DUXXAN Platform successfully deployed to BSC mainnet: ${address}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });