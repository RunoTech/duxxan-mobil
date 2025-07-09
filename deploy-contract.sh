#!/bin/bash

# DUXXAN Smart Contract Deployment Script for BSC
echo "🚀 Starting DUXXAN Smart Contract Deployment..."

# Check if required environment variables are set
if [ -z "$PRIVATE_KEY" ]; then
    echo "❌ Error: PRIVATE_KEY environment variable is not set"
    echo "Please set your wallet private key: export PRIVATE_KEY=your_private_key"
    exit 1
fi

if [ -z "$COMMISSION_WALLET" ]; then
    echo "❌ Error: COMMISSION_WALLET environment variable is not set"
    echo "Please set your commission wallet address: export COMMISSION_WALLET=your_address"
    exit 1
fi

echo "✅ Environment variables validated"

# Navigate to contracts directory
cd contracts

# Install dependencies
echo "📦 Installing contract dependencies..."
npm install

# Compile contracts
echo "🔨 Compiling smart contracts..."
npx hardhat compile

if [ $? -ne 0 ]; then
    echo "❌ Contract compilation failed!"
    exit 1
fi

echo "✅ Contracts compiled successfully"

# Deploy to BSC Testnet first (recommended for testing)
echo "🧪 Deploying to BSC Testnet..."
npx hardhat run scripts/deploy.js --network bscTestnet

if [ $? -ne 0 ]; then
    echo "❌ Testnet deployment failed!"
    exit 1
fi

echo "✅ Testnet deployment successful"

# Ask user if they want to deploy to mainnet
read -p "Do you want to deploy to BSC Mainnet? (y/N): " deploy_mainnet

if [[ $deploy_mainnet =~ ^[Yy]$ ]]; then
    echo "🌐 Deploying to BSC Mainnet..."
    npx hardhat run scripts/deploy.js --network bsc
    
    if [ $? -ne 0 ]; then
        echo "❌ Mainnet deployment failed!"
        exit 1
    fi
    
    echo "✅ Mainnet deployment successful"
    echo "🔔 Don't forget to verify your contract on BSCScan!"
else
    echo "⏭️ Skipping mainnet deployment"
fi

echo "🎉 Deployment process completed!"
echo "📝 Next steps:"
echo "1. Copy the contract address from the deployment output"
echo "2. Set VITE_CONTRACT_ADDRESS in your .env file"
echo "3. Verify the contract on BSCScan (if deployed to mainnet)"
echo "4. Test the contract integration with your frontend"

cd ..