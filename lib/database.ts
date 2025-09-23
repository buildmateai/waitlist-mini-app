import { Debate, User, ChatMessage } from './types';

// In-memory storage for Vercel deployment
// In production, you would use a real database like PostgreSQL, MongoDB, etc.
const debates: Debate[] = [];
const users: User[] = [];

export class Database {
  // Debates
  static getDebates(): Debate[] {
    return debates;
  }

  static getDebate(id: string): Debate | null {
    return debates.find(debate => debate.id === id) || null;
  }

  static getActiveDebates(): Debate[] {
    // First update statuses to ensure accuracy
    this.updateDebateStatuses();
    
    const now = Date.now();
    return debates.filter(debate => 
      debate.status === 'active' && debate.endsAt > now
    );
  }

  static createDebate(debate: Debate): boolean {
    try {
      debates.push(debate);
      return true;
    } catch (error) {
      console.error('Error creating debate:', error);
      return false;
    }
  }

  static updateDebate(id: string, updates: Partial<Debate>): boolean {
    try {
      const index = debates.findIndex(debate => debate.id === id);
      if (index === -1) return false;
      
      debates[index] = { ...debates[index], ...updates };
      return true;
    } catch (error) {
      console.error('Error updating debate:', error);
      return false;
    }
  }

  static voteDebate(debateId: string, voterId: string, option: string): boolean {
    try {
      const debateIndex = debates.findIndex(debate => debate.id === debateId);
      if (debateIndex === -1) return false;

      const debate = debates[debateIndex];
      
      // Check if debate is still active using helper function
      if (!this.isDebateActive(debate)) {
        return false;
      }
      
      // Check if user already voted
      if (debate.votes.voters.includes(voterId)) return false;

      // Check if option exists
      if (!debate.votes.hasOwnProperty(option)) {
        debate.votes[option] = 0;
      }

      // Add vote
      debate.votes.voters.push(voterId);
      (debate.votes[option] as number)++;

      return true;
    } catch (error) {
      console.error('Error voting on debate:', error);
      return false;
    }
  }

  // Check if user has an active debate
  static hasUserActiveDebate(userId: string): boolean {
    // First update statuses to ensure accuracy
    this.updateDebateStatuses();
    
    return debates.some(debate => 
      debate.createdBy === userId && 
      this.isDebateActive(debate)
    );
  }

  // Chat functionality
  static addChatMessage(debateId: string, author: string, message: string): boolean {
    try {
      const debateIndex = debates.findIndex(debate => debate.id === debateId);
      if (debateIndex === -1) return false;

      const debate = debates[debateIndex];
      const chatMessage: ChatMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        debateId,
        author,
        message,
        timestamp: Date.now()
      };

      debate.chat.push(chatMessage);
      return true;
    } catch (error) {
      console.error('Error adding chat message:', error);
      return false;
    }
  }

  static getChatMessages(debateId: string): ChatMessage[] {
    const debate = debates.find(d => d.id === debateId);
    return debate ? debate.chat : [];
  }

  // Helper function to check if a debate is active
  static isDebateActive(debate: Debate): boolean {
    const now = Date.now();
    return debate.status === 'active' && debate.endsAt > now;
  }

  // Update debate status (call this periodically to mark ended debates)
  static updateDebateStatuses(): void {
    const now = Date.now();
    debates.forEach(debate => {
      if (debate.status === 'active' && debate.endsAt <= now) {
        debate.status = 'ended';
      }
    });
  }

  // Users
  static getUsers(): User[] {
    return users;
  }

  static getUser(fid: number): User | null {
    return users.find(user => user.fid === fid) || null;
  }

  static createOrUpdateUser(user: User): boolean {
    try {
      const existingIndex = users.findIndex(u => u.fid === user.fid);
      
      if (existingIndex === -1) {
        users.push(user);
      } else {
        users[existingIndex] = { ...users[existingIndex], ...user };
      }
      
      return true;
    } catch (error) {
      console.error('Error creating/updating user:', error);
      return false;
    }
  }
}
