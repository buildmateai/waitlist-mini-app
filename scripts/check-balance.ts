const { ethers } = require("hardhat");

async function main() {
  try {
    const [deployer] = await ethers.getSigners();
    console.log("Deployer address:", deployer.address);
    
    const balance = await deployer.provider.getBalance(deployer.address);
    console.log("Balance:", ethers.formatEther(balance), "ETH");
    
    if (balance < ethers.parseEther("0.01")) {
      console.log("❌ Insufficient ETH for deployment. Need at least 0.01 ETH");
      console.log("Get ETH from: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet");
    } else {
      console.log("✅ Sufficient ETH for deployment");
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
