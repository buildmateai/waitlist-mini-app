export interface Debate {
  id: string;
  title: string;
  description: string;
  createdBy: string; // Farcaster username or address
  createdAt: number; // timestamp
  endsAt: number; // timestamp
  status: 'active' | 'ended' | 'cancelled';
  votes: {
    yes: number;
    no: number;
    voters: string[]; // Farcaster usernames/addresses who voted
  };
  totalStaked?: number; // For future USDC integration
  category?: string;
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
