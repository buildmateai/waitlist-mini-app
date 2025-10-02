const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Starting contract deployment...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

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

  // Save contract addresses
  const contractAddresses = {
    DebateToken: debateTokenAddress,
    MockUSDC: mockUSDCAddress,
    DebateContractV2: debateContractV2Address,
    network: "sepolia",
    deployer: deployer.address,
    deploymentTime: new Date().toISOString(),
  };

  console.log("\n📋 Contract Addresses:");
  console.log(JSON.stringify(contractAddresses, null, 2));

  // Write to file for frontend use
  const fs = require('fs');
  fs.writeFileSync(
    './contract-addresses-v2.json',
    JSON.stringify(contractAddresses, null, 2)
  );
  console.log("\n💾 Contract addresses saved to contract-addresses-v2.json");

  console.log("\n🎉 Deployment completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
