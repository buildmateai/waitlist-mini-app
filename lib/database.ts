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
    console.log('Database: Looking for debate with ID:', id);
    console.log('Database: Available debates:', debates.map(d => d.id));
    const found = debates.find(debate => debate.id === id);
    console.log('Database: Found debate:', found ? 'Yes' : 'No');
    return found || null;
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
      console.log('Database: Adding debate to array:', debate.id);
      debates.push(debate);
      console.log('Database: Total debates now:', debates.length);
      console.log('Database: All debate IDs:', debates.map(d => d.id));
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
        timestamp: Date.now(),
        reactions: {
          upvotes: 0,
          downvotes: 0,
          users: []
        }
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

  // Reaction functionality
  static addReactionToMessage(debateId: string, messageId: string, userId: string, reactionType: 'upvote' | 'downvote'): boolean {
    try {
      const debate = debates.find(d => d.id === debateId);
      if (!debate) return false;

      const messageIndex = debate.chat.findIndex(msg => msg.id === messageId);
      if (messageIndex === -1) return false;

      const message = debate.chat[messageIndex];

      // Check if user already reacted
      if (message.reactions.users.includes(userId)) {
        // Remove existing reaction
        const userReactionIndex = message.reactions.users.indexOf(userId);
        message.reactions.users.splice(userReactionIndex, 1);
        
        // Decrease the previous reaction count
        if (reactionType === 'upvote') {
          message.reactions.upvotes = Math.max(0, message.reactions.upvotes - 1);
        } else {
          message.reactions.downvotes = Math.max(0, message.reactions.downvotes - 1);
        }
        
        return true;
      }

      // Add new reaction
      message.reactions.users.push(userId);
      if (reactionType === 'upvote') {
        message.reactions.upvotes++;
      } else {
        message.reactions.downvotes++;
      }

      return true;
    } catch (error) {
      console.error('Error adding reaction to message:', error);
      return false;
    }
  }

  static getUserReaction(debateId: string, messageId: string, userId: string): 'upvote' | 'downvote' | null {
    try {
      const debate = debates.find(d => d.id === debateId);
      if (!debate) return null;

      const message = debate.chat.find(msg => msg.id === messageId);
      if (!message) return null;

      if (!message.reactions.users.includes(userId)) {
        return null;
      }

      // Simple logic: if user reacted, we'll determine type based on current counts
      // In a real app, you'd store the reaction type per user
      return null; // For now, we'll just track if user reacted
    } catch (error) {
      console.error('Error getting user reaction:', error);
      return null;
    }
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
