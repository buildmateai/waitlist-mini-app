const { ethers } = require("hardhat");
require('dotenv').config();

async function main() {
  console.log("🚀 Starting contract deployment on Ethereum Sepolia...");

  // Get the deployer account
  const signers = await ethers.getSigners();
  console.log("Signers found:", signers.length);
  
  if (signers.length === 0) {
    console.log("No signers found. Using wallet directly...");
    const provider = ethers.provider;
    const privateKey = process.env.PRIVATE_KEY.startsWith('0x') ? process.env.PRIVATE_KEY : '0x' + process.env.PRIVATE_KEY;
    const wallet = new ethers.Wallet(privateKey, provider);
    console.log("Deploying contracts with account:", wallet.address);
    
    // Deploy DebateToken first
    console.log("\n🪙 Deploying DebateToken...");
    const DebateToken = await ethers.getContractFactory("DebateToken", wallet);
    const debateToken = await DebateToken.deploy();
    await debateToken.waitForDeployment();
    
    const debateTokenAddress = await debateToken.getAddress();
    console.log("✅ DebateToken deployed to:", debateTokenAddress);

    // Deploy improved MockUSDC
    console.log("\n💰 Deploying improved MockUSDC...");
    const MockUSDC = await ethers.getContractFactory("MockUSDC", wallet);
    const mockUSDC = await MockUSDC.deploy();
    await mockUSDC.waitForDeployment();
    
    const mockUSDCAddress = await mockUSDC.getAddress();
    console.log("✅ MockUSDC deployed to:", mockUSDCAddress);

    // Deploy DebateContractV2
    console.log("\n🏛️ Deploying DebateContractV2...");
    const DebateContractV2 = await ethers.getContractFactory("DebateContractV2", wallet);
    const debateContractV2 = await DebateContractV2.deploy(debateTokenAddress);
    await debateContractV2.waitForDeployment();
    
    const debateContractV2Address = await debateContractV2.getAddress();
    console.log("✅ DebateContractV2 deployed to:", debateContractV2Address);

    console.log("\n📋 Contract Addresses:");
    console.log("DebateToken:", debateTokenAddress);
    console.log("MockUSDC:", mockUSDCAddress);
    console.log("DebateContractV2:", debateContractV2Address);
    console.log("Deployer:", wallet.address);

    console.log("\n🎉 Deployment completed successfully!");
  } else {
    const deployer = signers[0];
    console.log("Deploying contracts with account:", deployer.address);
    
    // Deploy DebateToken first
    console.log("\n🪙 Deploying DebateToken...");
    const DebateToken = await ethers.getContractFactory("DebateToken");
    const debateToken = await DebateToken.deploy();
    await debateToken.waitForDeployment();
    
    const debateTokenAddress = await debateToken.getAddress();
    console.log("✅ DebateToken deployed to:", debateTokenAddress);

    // Deploy improved MockUSDC
    console.log("\n💰 Deploying improved MockUSDC...");
    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    const mockUSDC = await MockUSDC.deploy();
    await mockUSDC.waitForDeployment();
    
    const mockUSDCAddress = await mockUSDC.getAddress();
    console.log("✅ MockUSDC deployed to:", mockUSDCAddress);

    // Deploy DebateContractV2
    console.log("\n🏛️ Deploying DebateContractV2...");
    const DebateContractV2 = await ethers.getContractFactory("DebateContractV2");
    const debateContractV2 = await DebateContractV2.deploy(debateTokenAddress);
    await debateContractV2.waitForDeployment();
    
    const debateContractV2Address = await debateContractV2.getAddress();
    console.log("✅ DebateContractV2 deployed to:", debateContractV2Address);

    console.log("\n📋 Contract Addresses:");
    console.log("DebateToken:", debateTokenAddress);
    console.log("MockUSDC:", mockUSDCAddress);
    console.log("DebateContractV2:", debateContractV2Address);
    console.log("Deployer:", deployer.address);

    console.log("\n🎉 Deployment completed successfully!");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });