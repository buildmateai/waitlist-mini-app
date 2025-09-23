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

### **Deployment**
- **Vercel**: Hosting and deployment platform
- **Base Mini App**: Integration with Farcaster ecosystem
- **GitHub**: Version control and CI/CD

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
│   └── types.ts                          # TypeScript interfaces
├── public/                               # Static assets
├── minikit.config.ts                     # Base Mini App config
├── next.config.ts                        # Next.js config
└── package.json                          # Dependencies
```

### **Data Flow**
1. **User creates debate** → POST /api/debates
2. **Database validates** → Check for existing active debates
3. **Debate stored** → In-memory array with unique ID
4. **Users join debate** → Navigate to /debate/[id]
5. **Real-time updates** → Timer, votes, chat via API calls
6. **Results displayed** → /results page with comprehensive data

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
```

## 🔮 Future Enhancements

### **Phase 2: Blockchain Integration**
- **USDC Staking**: Users stake USDC to participate in debates
- **Smart Contracts**: On-chain voting and reward distribution
- **Winner Rewards**: Automatic USDC distribution to winning side
- **NFT Badges**: Unique NFTs for debate winners

### **Phase 3: Advanced Features**
- **Chainlink Oracles**: Verify external claims (e.g., ETH price)
- **Multi-option Voting**: Support for 3+ voting options
- **Debate Categories**: Organize debates by topics
- **User Profiles**: Enhanced user profiles with debate history

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

### 🔄 **Ready for Enhancement**
- [ ] USDC staking integration
- [ ] Smart contract deployment
- [ ] Farcaster native authentication
- [ ] Real-time WebSocket connections
- [ ] Advanced analytics and trending
- [ ] NFT badge system

## 🤝 Contributing

This MVP provides a solid foundation for a decentralized debate platform. The modular architecture makes it easy to add new features while maintaining compatibility with existing functionality.

### **Key Development Areas**
1. **Blockchain Integration**: Add USDC staking and smart contracts
2. **Real-time Features**: Implement WebSocket for live updates
3. **User Experience**: Enhance UI/UX with advanced interactions
4. **Analytics**: Add comprehensive analytics and insights
5. **Social Features**: Integrate deeper with Farcaster ecosystem

---

**Built with ❤️ for the Base ecosystem**

*Last updated: January 2025*