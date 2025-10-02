# 🚀 Blockchain Integration - Deployment Guide

## 📋 Prerequisites

1. **Node.js** (v18 or higher)
2. **npm** or **yarn**
3. **Base Sepolia ETH** for gas fees
4. **Private key** for deployment
5. **BaseScan API key** for contract verification

## 🔧 Setup Instructions

### 1. Install Dependencies

```bash
cd waitlist-mini-app
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```bash
# Copy the example file
cp env.example .env
```

Edit `.env` with your values:

```env
# Base Sepolia Testnet
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
BASE_RPC_URL=https://mainnet.base.org

# Private key for deployment (NEVER commit this to git!)
PRIVATE_KEY=your_private_key_here

# BaseScan API Key for contract verification
BASESCAN_API_KEY=your_basescan_api_key_here

# WalletConnect Project ID (get from https://cloud.walletconnect.com/)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

### 3. Get Base Sepolia ETH

1. Go to [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet)
2. Connect your wallet
3. Request test ETH

### 4. Deploy Contracts

```bash
# Compile contracts
npm run compile

# Deploy to Base Sepolia
npm run deploy
```

This will:
- Deploy MockUSDC contract
- Deploy DebateContract
- Verify contracts on BaseScan
- Save contract addresses to `contract-addresses.json`

### 5. Update Frontend Configuration

After deployment, update your `.env` file with the deployed contract addresses:

```env
NEXT_PUBLIC_MOCK_USDC_ADDRESS=0x...
NEXT_PUBLIC_DEBATE_CONTRACT_ADDRESS=0x...
```

### 6. Test Contracts

```bash
# Run contract tests
npm run test
```

### 7. Start Development Server

```bash
npm run dev
```

## 🧪 Testing the Integration

### 1. Connect Wallet
- Open the app in your browser
- Click "Connect Wallet" 
- Connect your Base Sepolia wallet

### 2. Get Test USDC
- In any debate page, click "Get 1000 USDC" button
- This calls the faucet function on MockUSDC contract

### 3. Create a Debate
- Go to the main page
- Create a new debate with custom options
- Set duration (1 hour to 1 week)

### 4. Stake and Vote
- Navigate to the debate page
- Choose your option
- Enter stake amount (minimum 10 USDC)
- Click "Approve USDC" then "Stake & Vote"

### 5. Monitor Results
- View real-time blockchain stakes
- See traditional votes alongside blockchain data
- Watch the timer countdown

### 6. End Debate and Claim Rewards
- Wait for timer to expire or manually end debate
- Winners can claim their proportional rewards
- Platform takes 5% fee

## 🔍 Contract Functions

### MockUSDC Contract
- `faucet()` - Get 1000 USDC for testing
- `approve(spender, amount)` - Approve spending
- `transfer(to, amount)` - Transfer tokens
- `balanceOf(account)` - Check balance

### DebateContract Contract
- `createDebate(title, description, options, duration)` - Create new debate
- `stakeAndVote(debateId, optionIndex, amount)` - Stake USDC and vote
- `endDebate(debateId)` - End debate and determine winner
- `claimReward(debateId)` - Claim rewards for winners
- `getDebate(debateId)` - Get debate information
- `hasUserVoted(debateId, user)` - Check if user voted

## 📊 Contract Events

### DebateCreated
```solidity
event DebateCreated(uint256 indexed debateId, address indexed creator, string title, uint256 duration);
```

### StakePlaced
```solidity
event StakePlaced(uint256 indexed debateId, address indexed voter, uint256 optionIndex, uint256 amount);
```

### DebateEnded
```solidity
event DebateEnded(uint256 indexed debateId, uint256 winningOption, uint256 totalStaked);
```

### RewardsDistributed
```solidity
event RewardsDistributed(uint256 indexed debateId, address indexed winner, uint256 amount);
```

## 🛠 Troubleshooting

### Common Issues

1. **"Insufficient funds" error**
   - Make sure you have Base Sepolia ETH for gas
   - Get ETH from the faucet

2. **"Transfer failed" error**
   - Check USDC balance
   - Use faucet to get more USDC
   - Ensure approval amount is sufficient

3. **Contract not found**
   - Verify contract addresses in `.env`
   - Make sure contracts are deployed
   - Check network is Base Sepolia

4. **Wallet connection issues**
   - Clear browser cache
   - Try different wallet
   - Check WalletConnect project ID

### Gas Optimization

- Use `--gas-limit` flag for deployment if needed
- Consider batching transactions
- Monitor gas prices on Base Sepolia

## 🔐 Security Notes

- **NEVER** commit private keys to git
- Use environment variables for sensitive data
- Test thoroughly on testnet before mainnet
- Consider multi-sig for production deployment

## 📈 Next Steps

1. **Mainnet Deployment**
   - Deploy to Base mainnet
   - Use real USDC contract
   - Implement additional security measures

2. **Advanced Features**
   - Multi-option voting (3+ options)
   - Time-weighted voting
   - Governance features
   - NFT badges for winners

3. **Analytics**
   - Track debate performance
   - User engagement metrics
   - Platform revenue analytics

## 🎉 Success!

Your Debate App now has full blockchain integration with:
- ✅ USDC staking and voting
- ✅ Automatic reward distribution
- ✅ Real-time blockchain data
- ✅ Wallet connection
- ✅ Contract verification
- ✅ Comprehensive testing

The platform is ready for users to stake their opinions and win rewards!
