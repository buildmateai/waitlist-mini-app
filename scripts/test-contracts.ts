import { ethers } from "hardhat";

async function main() {
  console.log("🧪 Running contract tests...");

  // Get contract addresses from deployment
  const contractAddresses = require('../contract-addresses.json');
  const mockUSDCAddress = contractAddresses.MockUSDC;
  const debateContractAddress = contractAddresses.DebateContract;

  console.log("Using contracts:");
  console.log("MockUSDC:", mockUSDCAddress);
  console.log("DebateContract:", debateContractAddress);

  // Get signers
  const [deployer, user1, user2] = await ethers.getSigners();
  console.log("\n👥 Test accounts:");
  console.log("Deployer:", deployer.address);
  console.log("User1:", user1.address);
  console.log("User2:", user2.address);

  // Get contract instances
  const MockUSDC = await ethers.getContractFactory("MockUSDC");
  const DebateContract = await ethers.getContractFactory("DebateContract");
  
  const mockUSDC = MockUSDC.attach(mockUSDCAddress);
  const debateContract = DebateContract.attach(debateContractAddress);

  console.log("\n💰 Testing USDC faucet...");
  
  // Test faucet for users
  const faucetAmount = ethers.parseUnits("1000", 6); // 1000 USDC
  
  console.log("Getting USDC for User1...");
  await mockUSDC.connect(user1).faucet();
  const user1Balance = await mockUSDC.balanceOf(user1.address);
  console.log("User1 USDC balance:", ethers.formatUnits(user1Balance, 6));

  console.log("Getting USDC for User2...");
  await mockUSDC.connect(user2).faucet();
  const user2Balance = await mockUSDC.balanceOf(user2.address);
  console.log("User2 USDC balance:", ethers.formatUnits(user2Balance, 6));

  console.log("\n🏛️ Testing debate creation...");
  
  // Create a test debate
  const debateOptions = ["Bitcoin", "Ethereum"];
  const debateDuration = 3600; // 1 hour
  
  const tx = await debateContract.connect(user1).createDebate(
    "Bitcoin vs Ethereum",
    "Which cryptocurrency will perform better?",
    debateOptions,
    debateDuration
  );
  
  const receipt = await tx.wait();
  console.log("✅ Debate created! Transaction hash:", receipt?.hash);

  // Get the debate ID from events
  const debateCreatedEvent = receipt?.logs.find(log => {
    try {
      const parsed = debateContract.interface.parseLog(log);
      return parsed?.name === "DebateCreated";
    } catch {
      return false;
    }
  });

  if (debateCreatedEvent) {
    const parsed = debateContract.interface.parseLog(debateCreatedEvent);
    const debateId = parsed?.args[0];
    console.log("📊 Debate ID:", debateId.toString());

    console.log("\n🗳️ Testing voting...");
    
    // User1 votes for Bitcoin (option 0)
    const stakeAmount = ethers.parseUnits("50", 6); // 50 USDC
    console.log("User1 voting for Bitcoin with 50 USDC...");
    
    // Approve USDC spending
    await mockUSDC.connect(user1).approve(debateContractAddress, stakeAmount);
    
    // Vote
    await debateContract.connect(user1).stakeAndVote(debateId, 0, stakeAmount);
    console.log("✅ User1 voted for Bitcoin");

    // User2 votes for Ethereum (option 1)
    console.log("User2 voting for Ethereum with 30 USDC...");
    const stakeAmount2 = ethers.parseUnits("30", 6); // 30 USDC
    
    // Approve USDC spending
    await mockUSDC.connect(user2).approve(debateContractAddress, stakeAmount2);
    
    // Vote
    await debateContract.connect(user2).stakeAndVote(debateId, 1, stakeAmount2);
    console.log("✅ User2 voted for Ethereum");

    // Check debate state
    console.log("\n📈 Checking debate state...");
    const debate = await debateContract.getDebate(debateId);
    console.log("Debate title:", debate.title);
    console.log("Total staked:", ethers.formatUnits(debate.totalStaked, 6), "USDC");
    console.log("Bitcoin stakes:", ethers.formatUnits(debate.stakes[0], 6), "USDC");
    console.log("Ethereum stakes:", ethers.formatUnits(debate.stakes[1], 6), "USDC");
    console.log("Debate ended:", debate.ended);

    // Fast forward time to end the debate
    console.log("\n⏰ Fast forwarding time to end debate...");
    await ethers.provider.send("evm_increaseTime", [debateDuration + 1]);
    await ethers.provider.send("evm_mine", []);

    // End the debate
    console.log("Ending debate...");
    await debateContract.endDebate(debateId);
    console.log("✅ Debate ended!");

    // Check final state
    const finalDebate = await debateContract.getDebate(debateId);
    console.log("\n🏆 Final results:");
    console.log("Winning option:", finalDebate.winningOption);
    console.log("Winner:", debateOptions[finalDebate.winningOption]);
    console.log("Total staked:", ethers.formatUnits(finalDebate.totalStaked, 6), "USDC");

    // Claim rewards
    console.log("\n💰 Testing reward claiming...");
    const winner = finalDebate.winningOption === 0 ? user1 : user2;
    console.log("Winner claiming rewards...");
    
    const balanceBefore = await mockUSDC.balanceOf(winner.address);
    await debateContract.connect(winner).claimReward(debateId);
    const balanceAfter = await mockUSDC.balanceOf(winner.address);
    
    const rewardAmount = balanceAfter - balanceBefore;
    console.log("✅ Reward claimed:", ethers.formatUnits(rewardAmount, 6), "USDC");
  }

  console.log("\n🎉 All tests completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
