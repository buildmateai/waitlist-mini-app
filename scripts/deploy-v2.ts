const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Starting improved contract deployment...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

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

  // Test basic functionality
  console.log("\n🧪 Testing basic functionality...");
  
  // Test DebateToken
  const tokenName = await debateToken.name();
  const tokenSymbol = await debateToken.symbol();
  const totalSupply = await debateToken.totalSupply();
  console.log(`DebateToken: ${tokenName} (${tokenSymbol}) - Total Supply: ${ethers.formatEther(totalSupply)}`);

  // Test MockUSDC faucet
  console.log("Testing MockUSDC faucet...");
  await mockUSDC.faucet();
  const balance = await mockUSDC.balanceOf(deployer.address);
  console.log(`MockUSDC balance after faucet: ${ethers.formatUnits(balance, 6)} USDC`);

  // Test DebateContractV2
  const minStake = await debateContractV2.minStakeAmount();
  const maxStake = await debateContractV2.maxStakeAmount();
  const creationFee = await debateContractV2.debateCreationFee();
  console.log(`DebateContractV2 - Min Stake: ${ethers.formatEther(minStake)} DEBATE`);
  console.log(`DebateContractV2 - Max Stake: ${ethers.formatEther(maxStake)} DEBATE`);
  console.log(`DebateContractV2 - Creation Fee: ${ethers.formatEther(creationFee)} DEBATE`);

  console.log("\n🎉 Improved deployment completed successfully!");
  console.log("\n📝 Next steps:");
  console.log("1. Update your .env file with the new contract addresses");
  console.log("2. Update your frontend configuration");
  console.log("3. Test the improved contracts");
  console.log("4. Consider migrating from V1 to V2");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
