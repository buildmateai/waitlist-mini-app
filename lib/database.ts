import { Debate, User } from './types';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const DEBATES_FILE = path.join(DATA_DIR, 'debates.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize files if they don't exist
if (!fs.existsSync(DEBATES_FILE)) {
  fs.writeFileSync(DEBATES_FILE, JSON.stringify([]));
}
if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(USERS_FILE, JSON.stringify([]));
}

export class Database {
  // Debates
  static getDebates(): Debate[] {
    try {
      const data = fs.readFileSync(DEBATES_FILE, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading debates:', error);
      return [];
    }
  }

  static getDebate(id: string): Debate | null {
    const debates = this.getDebates();
    return debates.find(debate => debate.id === id) || null;
  }

  static getActiveDebates(): Debate[] {
    const debates = this.getDebates();
    const now = Date.now();
    return debates.filter(debate => 
      debate.status === 'active' && debate.endsAt > now
    );
  }

  static createDebate(debate: Debate): boolean {
    try {
      const debates = this.getDebates();
      debates.push(debate);
      fs.writeFileSync(DEBATES_FILE, JSON.stringify(debates, null, 2));
      return true;
    } catch (error) {
      console.error('Error creating debate:', error);
      return false;
    }
  }

  static updateDebate(id: string, updates: Partial<Debate>): boolean {
    try {
      const debates = this.getDebates();
      const index = debates.findIndex(debate => debate.id === id);
      if (index === -1) return false;
      
      debates[index] = { ...debates[index], ...updates };
      fs.writeFileSync(DEBATES_FILE, JSON.stringify(debates, null, 2));
      return true;
    } catch (error) {
      console.error('Error updating debate:', error);
      return false;
    }
  }

  static voteDebate(debateId: string, voterId: string, vote: 'yes' | 'no'): boolean {
    try {
      const debates = this.getDebates();
      const debateIndex = debates.findIndex(debate => debate.id === debateId);
      if (debateIndex === -1) return false;

      const debate = debates[debateIndex];
      
      // Check if debate is still active
      if (debate.status !== 'active' || debate.endsAt <= Date.now()) {
        return false;
      }
      
      // Check if user already voted
      if (debate.votes.voters.includes(voterId)) return false;

      // Add vote
      debate.votes.voters.push(voterId);
      if (vote === 'yes') {
        debate.votes.yes++;
      } else {
        debate.votes.no++;
      }

      fs.writeFileSync(DEBATES_FILE, JSON.stringify(debates, null, 2));
      return true;
    } catch (error) {
      console.error('Error voting on debate:', error);
      return false;
    }
  }

  // Users
  static getUsers(): User[] {
    try {
      const data = fs.readFileSync(USERS_FILE, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading users:', error);
      return [];
    }
  }

  static getUser(fid: number): User | null {
    const users = this.getUsers();
    return users.find(user => user.fid === fid) || null;
  }

  static createOrUpdateUser(user: User): boolean {
    try {
      const users = this.getUsers();
      const existingIndex = users.findIndex(u => u.fid === user.fid);
      
      if (existingIndex === -1) {
        users.push(user);
      } else {
        users[existingIndex] = { ...users[existingIndex], ...user };
      }
      
      fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
      return true;
    } catch (error) {
      console.error('Error creating/updating user:', error);
      return false;
    }
  }
}
