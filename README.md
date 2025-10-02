# 🔥 Debate App - Decentralized Debate Platform MVP

A decentralized debate platform built on Base Mini App framework, allowing Farcaster users to create debates, vote on custom options, and engage in real-time discussions with reaction systems.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Deployment](#deployment)
- [Development Setup](#development-setup)
- [Future Enhancements](#future-enhancements)

## 🌟 Overview

Debate App is a Base Mini App that enables users to:
- Create debates with custom voting options (not just yes/no)
- Participate in real-time discussions via chat
- Vote on debate topics with live results
- React to chat messages with upvote/downvote system
- View comprehensive debate results and statistics

**Live Demo:** https://waitlist-mini-app-sage-five.vercel.app/

## ✨ Features

### 🎯 Core Functionality

#### 1. **Debate Creation System**
- **Custom Voting Options**: Instead of simple yes/no, users can create debates with custom options (e.g., "Dogs" vs "Cats", "Bitcoin" vs "Ethereum")
- **Flexible Duration**: Debates can last from 1 hour to 1 week
- **One Active Debate Limit**: Users can only have one active debate at a time
- **Real-time Timer**: Live countdown showing time remaining

#### 2. **Voting System**
- **Dynamic Voting**: Vote on custom options created by debate creators
- **One Vote Per User**: Users can only vote once per debate
- **Live Results**: Real-time vote counting with percentages
- **Automatic Status Updates**: Debates automatically become "ended" when timer expires

#### 3. **Real-time Chat System**
- **Discussion Thread**: Each debate has its own chat room
- **Message Reactions**: Upvote/downvote system for chat messages
- **One Reaction Per User**: Users can only react once per message (toggle system)
- **Auto-scroll**: Chat automatically scrolls to latest messages
- **Timestamps**: All messages show creation time

#### 4. **Results & Analytics**
- **Comprehensive Results Page**: View all debates (active, ended, tied)
- **Statistics Dashboard**: Most popular debates, total votes, participation rates
- **Winner Announcements**: Clear display of debate winners with vote counts
- **Filtering Options**: Filter debates by status and popularity

### 🎨 User Interface

#### **Modern Design**
- **Dark Theme**: Sleek dark interface with glassmorphism effects
- **Responsive Layout**: Works perfectly on mobile and desktop
- **Smooth Animations**: Hover effects, transitions, and micro-interactions
- **Gradient Elements**: Beautiful color gradients for buttons and progress bars

#### **Interactive Elements**
- **Progress Bars**: Visual representation of vote distribution
- **Reaction Buttons**: Animated 👍 👎 buttons with counters
- **Timer Display**: Large, prominent countdown timer
- **Modal Forms**: Clean creation forms with validation

## 🛠 Tech Stack

### **Frontend**
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **CSS Modules**: Scoped styling with modern features
- **React Hooks**: useState, useEffect, useRef for state management

### **Backend**
- **Next.js API Routes**: Serverless API endpoints
- **In-memory Database**: Simple array-based storage for MVP
- **RESTful API**: Clean API design with proper HTTP methods

### **Blockchain**
- **Hardhat**: Smart contract development framework
- **Solidity 0.8.20**: Smart contract language
- **OpenZeppelin**: Security-focused contract library
- **Wagmi**: React hooks for Ethereum
- **RainbowKit**: Wallet connection UI
- **Viem**: TypeScript Ethereum library

### **Deployment**
- **Vercel**: Hosting and deployment platform
- **Base Mini App**: Integration with Farcaster ecosystem
- **GitHub**: Version control and CI/CD
- **Ethereum Sepolia**: Testnet deployment for smart contracts

### **Base Mini App Integration**
- **MiniApp SDK**: Farcaster integration
- **Account Association**: Secure user authentication
- **Webhook Support**: Real-time updates (ready for future use)

## 🏗 Architecture

### **Project Structure**
```
waitlist-mini-app/
├── app/
│   ├── api/
│   │   ├── debates/
│   │   │   ├── route.ts                    # GET/POST debates
│   │   │   ├── [id]/
│   │   │   │   ├── route.ts               # GET/POST specific debate
│   │   │   │   ├── chat/
│   │   │   │   │   └── route.ts          # GET/POST chat messages
│   │   │   │   └── messages/[messageId]/
│   │   │   │       └── reactions/
│   │   │   │           └── route.ts      # POST message reactions
│   │   │   └── auth/
│   │   │       └── route.ts              # Authentication
│   ├── debate/[id]/
│   │   ├── page.tsx                      # Debate detail page
│   │   └── page.module.css               # Debate page styles
│   ├── results/
│   │   ├── page.tsx                      # Results dashboard
│   │   └── page.module.css               # Results styles
│   ├── success/
│   │   └── page.tsx                      # Success page
│   ├── layout.tsx                        # Root layout
│   ├── page.tsx                          # Home page
│   ├── page.module.css                   # Home page styles
│   └── globals.css                       # Global styles
├── lib/
│   ├── database.ts                       # Database operations
│   ├── types.ts                          # TypeScript interfaces
│   └── blockchain.ts                     # Blockchain configuration & ABIs
├── components/
│   ├── BlockchainProvider.tsx            # Wagmi + RainbowKit provider
│   ├── WalletConnection.tsx              # Wallet connection component
│   ├── ContractTester.tsx                # Interactive contract testing
│   ├── StakingInterface.tsx              # Staking and voting interface
│   └── RewardClaim.tsx                   # Reward claiming component
├── contracts/
│   ├── DebateToken.sol                   # Native DEBATE token
│   ├── MockUSDC.sol                      # Test USDC token
│   ├── DebateContractV2.sol             # Enhanced debate contract
│   └── DebateContract.sol                # Legacy contract
├── scripts/
│   ├── deploy.ts                         # Contract deployment script
│   ├── test-contracts.ts                 # Contract testing script
│   └── check-balance.ts                  # Balance checking utilities
├── typechain-types/                      # Generated TypeScript types
├── artifacts/                            # Compiled contract artifacts
├── public/                               # Static assets
├── minikit.config.ts                     # Base Mini App config
├── next.config.ts                        # Next.js config
├── hardhat.config.ts                     # Hardhat configuration
├── TESTING_GUIDE.md                      # Blockchain testing guide
└── package.json                          # Dependencies
```

### **Data Flow**
1. **User connects wallet** → RainbowKit + Wagmi integration
2. **User creates debate** → POST /api/debates + Smart contract call
3. **Database validates** → Check for existing active debates
4. **Debate stored** → In-memory array + Blockchain state
5. **Users join debate** → Navigate to /debate/[id]
6. **Real-time updates** → Timer, votes, chat via API calls + Blockchain events
7. **Results displayed** → /results page with comprehensive data
8. **Rewards distributed** → Automatic DEBATE token distribution to winners

## 🔌 API Endpoints

### **Debates**
```typescript
// Get all debates (active only by default)
GET /api/debates?all=true

// Create new debate
POST /api/debates
Body: {
  title: string,
  description: string,
  option1: string,
  option2: string,
  durationHours: number,
  createdBy: string
}

// Get specific debate
GET /api/debates/[id]

// Vote on debate
POST /api/debates/[id]
Body: {
  voterId: string,
  option: string
}
```

### **Chat**
```typescript
// Get chat messages
GET /api/debates/[id]/chat

// Send message
POST /api/debates/[id]/chat
Body: {
  author: string,
  message: string
}

// Add reaction to message
POST /api/debates/[id]/messages/[messageId]/reactions
Body: {
  userId: string,
  reactionType: 'upvote' | 'downvote'
}
```

## 💾 Database Schema

### **Debate Interface**
```typescript
interface Debate {
  id: string;                    // Unique identifier
  title: string;                 // Debate topic
  description: string;           // Detailed description
  createdBy: string;             // Creator's username/ID
  createdAt: number;             // Creation timestamp
  endsAt: number;                // End timestamp
  status: 'active' | 'ended' | 'cancelled';
  votingOptions: {
    option1: string;             // Custom option 1
    option2: string;             // Custom option 2
  };
  votes: {
    voters: string[];            // List of voter IDs
    [option1]: number;           // Vote count for option 1
    [option2]: number;           // Vote count for option 2
  };
  chat: ChatMessage[];           // Chat messages
  totalStaked?: number;          // Future USDC integration
  category?: string;             // Future categorization
}
```

### **Chat Message Interface**
```typescript
interface ChatMessage {
  id: string;                    // Unique message ID
  debateId: string;              // Parent debate ID
  author: string;                // Author's username
  message: string;               // Message content
  timestamp: number;             // Creation timestamp
  avatar?: string;               // Future avatar support
  reactions: {
    upvotes: number;             // Upvote count
    downvotes: number;           // Downvote count
    users: string[];             // Users who reacted
  };
}
```

### **Database Operations**
```typescript
class Database {
  // Debate operations
  static getDebates(): Debate[]
  static getDebate(id: string): Debate | null
  static getActiveDebates(): Debate[]
  static createDebate(debate: Debate): boolean
  static updateDebate(id: string, updates: Partial<Debate>): boolean
  static voteDebate(debateId: string, voterId: string, option: string): boolean
  static hasUserActiveDebate(userId: string): boolean
  
  // Chat operations
  static addChatMessage(debateId: string, author: string, message: string): boolean
  static getChatMessages(debateId: string): ChatMessage[]
  static addReactionToMessage(debateId: string, messageId: string, userId: string, reactionType: 'upvote' | 'downvote'): boolean
  
  // Utility functions
  static isDebateActive(debate: Debate): boolean
  static updateDebateStatuses(): void
}
```

## 🚀 Deployment

### **Base Mini App Configuration**

The app is configured as a Base Mini App in `minikit.config.ts`:

```typescript
export const minikitConfig = {
  accountAssociation: {
    header: "...",      // Farcaster account association
    payload: "...",     // Domain verification
    signature: "..."    // Cryptographic signature
  },
  miniapp: {
    version: "1",
    name: "Debate",
    subtitle: "Decentralized Debate Platform",
    description: "Join debates, stake your opinion, win rewards",
    primaryCategory: "social",
    tags: ["debate", "discussion", "voting", "social", "blockchain"],
    // ... additional configuration
  }
}
```

### **Vercel Deployment**

1. **Repository**: Connected to GitHub repository
2. **Auto-deployment**: Automatic deployment on push to main branch
3. **Environment**: Production environment with optimized builds
4. **Domain**: https://waitlist-mini-app-sage-five.vercel.app/

### **Base Integration Steps**

1. **Account Association**: Configured with Farcaster account
2. **Mini App Manifest**: Properly configured for Base ecosystem
3. **Authentication**: Ready for Farcaster user integration
4. **Webhooks**: Configured for real-time updates

## 🛠 Development Setup

### **Prerequisites**
- Node.js 18+ 
- npm or yarn
- Git

### **Installation**
```bash
# Clone repository
git clone https://github.com/buildmateai/waitlist-mini-app.git
cd waitlist-mini-app

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### **Environment Variables**
```bash
# Frontend Configuration
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-project-id

# Contract Addresses (Ethereum Sepolia)
NEXT_PUBLIC_DEBATE_TOKEN_ADDRESS=0x6B89494D4a96f4D16D294c4afa3583A076f51397
NEXT_PUBLIC_MOCK_USDC_ADDRESS=0x5Cbd5C4e3ab02254dF6B104A7C842e7C3e60eEF0
NEXT_PUBLIC_DEBATE_CONTRACT_V2_ADDRESS=0x4e43B6B6e6605B43b3287FDfdA0cA32dFf5eE001

# Network Configuration
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_NETWORK_NAME=Ethereum Sepolia

# Optional: Custom URL for production
NEXT_PUBLIC_URL=https://your-domain.vercel.app

# Vercel automatically provides:
VERCEL_URL=your-app.vercel.app
```

### **Development Commands**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks

# Blockchain Development
npm run compile      # Compile smart contracts
npm run deploy       # Deploy contracts to testnet
npm run test         # Run contract tests
```

## 🔮 Future Enhancements

### **Phase 2: Blockchain Integration** ✅ **COMPLETED**
- **✅ Native DEBATE Token**: Custom ERC-20 token with staking rewards (5% APY)
- **✅ Smart Contracts**: Deployed on Ethereum Sepolia testnet
- **✅ USDC Staking**: MockUSDC faucet for testing
- **✅ Winner Rewards**: Automatic DEBATE token distribution to winning side
- **✅ Contract Testing**: Interactive ContractTester component
- **✅ Wallet Integration**: RainbowKit + Wagmi for wallet connection

### **Phase 3: Advanced Features** 🚧 **IN PROGRESS**
- **Chainlink Oracles**: Verify external claims (e.g., ETH price)
- **Multi-option Voting**: Support for 3+ voting options
- **Debate Categories**: Organize debates by topics
- **User Profiles**: Enhanced user profiles with debate history
- **Frontend-Blockchain Integration**: Connect existing debate system with smart contracts
- **Real-time Blockchain Updates**: Sync frontend with blockchain events

### **Phase 4: Social Features**
- **Farcaster Integration**: Native Farcaster authentication
- **Cast Sharing**: Share debates via Farcaster casts
- **Following System**: Follow favorite debaters
- **Reputation System**: User reputation based on debate quality

### **Phase 5: Advanced Analytics**
- **Real-time Analytics**: Live debate statistics
- **Trending Debates**: Algorithm-based trending system
- **Debate Quality Metrics**: AI-powered debate quality scoring
- **Participation Rewards**: Gamification elements

## 📊 Current MVP Status

### ✅ **Completed Features**
- [x] Custom voting options (not just yes/no)
- [x] Real-time debate timer and status management
- [x] Chat system with message reactions
- [x] One active debate per user limit
- [x] Comprehensive results page with filtering
- [x] Responsive design with modern UI/UX
- [x] Base Mini App integration and deployment
- [x] Backward compatibility for existing data
- [x] **Blockchain Integration**: Smart contracts deployed on Ethereum Sepolia
- [x] **Native DEBATE Token**: ERC-20 token with staking and burn mechanics
- [x] **Wallet Connection**: RainbowKit + Wagmi integration
- [x] **Contract Testing**: Interactive testing interface
- [x] **MockUSDC Faucet**: Test token distribution system

### 🔄 **Ready for Enhancement**
- [ ] **Frontend-Blockchain Sync**: Connect existing debate system with smart contracts
- [ ] **Real-time Blockchain Events**: WebSocket integration for live updates
- [ ] **Production Deployment**: Deploy on Base mainnet
- [ ] **Farcaster native authentication**
- [ ] **Advanced analytics and trending**
- [ ] **NFT badge system**

## 🤝 Contributing

This MVP provides a solid foundation for a decentralized debate platform. The modular architecture makes it easy to add new features while maintaining compatibility with existing functionality.

### **Key Development Areas**
1. **✅ Blockchain Integration**: COMPLETED - Smart contracts deployed, DEBATE token created
2. **🚧 Frontend-Blockchain Sync**: Connect existing debate system with deployed contracts
3. **Real-time Features**: Implement WebSocket for live blockchain updates
4. **User Experience**: Enhance UI/UX with blockchain interactions
5. **Analytics**: Add comprehensive analytics and insights
6. **Social Features**: Integrate deeper with Farcaster ecosystem

---

## 🚀 **BLOCKCHAIN INTEGRATION UPDATE** - January 2, 2025

### **✅ What We Accomplished Today**

#### **1. Smart Contract Deployment**
- **DebateToken**: `0x6B89494D4a96f4D16D294c4afa3583A076f51397`
  - Native ERC-20 token with 100M initial supply, 1B max supply
  - 5% APY staking rewards with lock periods
  - 2% burn on transfers (deflationary mechanism)
  - Pausable and ownable for security

- **MockUSDC**: `0x5Cbd5C4e3ab02254dF6B104A7C842e7C3e60eEF0`
  - ERC-20 test token with faucet functionality
  - 1000 USDC per user with cooldown periods
  - Burn functionality for testing

- **DebateContractV2**: `0x4e43B6B6e6605B43b3287FDfdA0cA32dFf5eE001`
  - Enhanced debate contract with DEBATE token integration
  - 50 DEBATE creation fee, platform fees (5%)
  - Min/max stake limits, one active debate per user
  - Reward distribution to winners

#### **2. Frontend Integration**
- **Updated blockchain configuration** with Ethereum Sepolia support
- **Created ContractTester component** for interactive testing
- **Enhanced WalletConnection** to show DEBATE and MockUSDC balances
- **Fixed all TypeScript compilation errors**
- **Added comprehensive testing guide** (`TESTING_GUIDE.md`)

#### **3. Testing Infrastructure**
- **Interactive testing interface** with faucet, minting, and voting
- **Real-time balance display** for all tokens
- **Transaction status tracking** with hash display
- **Comprehensive error handling** and user feedback

### **🔗 Contract Links**
- [DebateToken on Etherscan](https://sepolia.etherscan.io/address/0x6B89494D4a96f4D16D294c4afa3583A076f51397)
- [MockUSDC on Etherscan](https://sepolia.etherscan.io/address/0x5Cbd5C4e3ab02254dF6B104A7C842e7C3e60eEF0)
- [DebateContractV2 on Etherscan](https://sepolia.etherscan.io/address/0x4e43B6B6e6605B43b3287FDfdA0cA32dFf5eE001)

### **🧪 How to Test**
1. **Connect wallet** to Ethereum Sepolia testnet
2. **Use ContractTester** to get test tokens (faucet + mint)
3. **Create debates** (50 DEBATE fee)
4. **Stake and vote** with DEBATE tokens
5. **Check results** on Etherscan

### **🚧 Next Steps (Priority Order)**

#### **Immediate (Next Session)**
1. **Frontend-Blockchain Sync**: Connect existing debate creation system with smart contracts
2. **Real-time Updates**: Implement WebSocket for blockchain event listening
3. **Debate Integration**: Replace mock voting with actual blockchain voting
4. **Reward System**: Implement automatic reward claiming

#### **Short Term (1-2 Sessions)**
1. **Production Deployment**: Deploy on Base mainnet with real USDC
2. **Farcaster Integration**: Native authentication and user profiles
3. **Advanced UI**: Enhanced blockchain interaction components
4. **Analytics Dashboard**: Blockchain metrics and statistics

#### **Medium Term (3-5 Sessions)**
1. **Multi-option Voting**: Support for 3+ voting options
2. **NFT Badges**: Unique NFTs for debate winners
3. **Governance System**: DEBATE token holder voting
4. **Advanced Staking**: Multiple staking pools and rewards

### **📁 Key Files Modified Today**
- `lib/blockchain.ts` - Updated with new contract addresses and ABI
- `components/ContractTester.tsx` - New testing interface
- `components/WalletConnection.tsx` - Enhanced with token balances
- `app/page.tsx` - Added blockchain integration
- `env.example` - Updated with contract addresses
- `TESTING_GUIDE.md` - Comprehensive testing instructions

### **🔧 Technical Notes**
- **Network**: Ethereum Sepolia (Chain ID: 11155111)
- **RPC**: https://ethereum-sepolia.publicnode.com
- **Explorer**: https://sepolia.etherscan.io
- **Deployer**: 0xBD02C1f3371f83ec72f3b58d86457Ed31D8f8923
- **Gas Optimization**: viaIR enabled for complex contracts

### **⚠️ Important Notes**
- **Testnet Only**: All contracts are on Ethereum Sepolia testnet
- **Mock Tokens**: MockUSDC is for testing only, not real USDC
- **Frontend Disconnect**: Current frontend still uses mock data, needs blockchain sync
- **Environment**: Need to set up `.env.local` with contract addresses for local testing

---

**Built with ❤️ for the Base ecosystem**

*Last updated: January 2, 2025*