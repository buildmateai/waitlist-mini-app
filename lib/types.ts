export interface Debate {
  id: string;
  title: string;
  description: string;
  createdBy: string; // Farcaster username or address
  createdAt: number; // timestamp
  endsAt: number; // timestamp
  status: 'active' | 'ended' | 'cancelled';
  votingOptions: {
    option1: string;
    option2: string;
  };
  votes: {
    voters: string[]; // Farcaster usernames/addresses who voted
    [key: string]: number | string[]; // Dynamic voting options
  };
  chat: ChatMessage[]; // Chat messages for this debate
  totalStaked?: number; // For future USDC integration
  category?: string;
}

export interface ChatMessage {
  id: string;
  debateId: string;
  author: string; // Farcaster username
  message: string;
  timestamp: number;
  avatar?: string;
  reactions: {
    upvotes: number;
    downvotes: number;
    users: string[]; // List of user IDs who reacted
  };
}

export interface User {
  fid: number; // Farcaster ID
  username: string;
  displayName?: string;
  avatar?: string;
  totalDebates: number;
  totalVotes: number;
  winRate?: number;
}
