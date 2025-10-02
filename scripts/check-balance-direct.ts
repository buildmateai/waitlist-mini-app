const { ethers } = require("hardhat");

async function main() {
  try {
    // Create wallet from private key
    const privateKey = "63489912e3e07766e80db7834e4ee378404a5b12feb8e259609ad947ea38d275";
    const wallet = new ethers.Wallet(privateKey);
    console.log("Wallet address:", wallet.address);
    
    // Connect to Base Sepolia
    const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");
    const connectedWallet = wallet.connect(provider);
    
    const balance = await connectedWallet.provider.getBalance(wallet.address);
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
