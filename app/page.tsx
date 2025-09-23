"use client";
import { useState, useEffect } from "react";
import { Debate } from "../lib/types";
import styles from "./page.module.css";

export default function Home() {
  const [debates, setDebates] = useState<Debate[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDebates();
  }, []);

  const fetchDebates = async () => {
    try {
      const response = await fetch('/api/debates');
      const data = await response.json();
      setDebates(data);
    } catch (error) {
      console.error('Error fetching debates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimeRemaining = (endsAt: number) => {
    const now = Date.now();
    const remaining = endsAt - now;
    
    if (remaining <= 0) return "Ended";
    
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.loading}>Loading debates...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.title}>🔥 DEBATE APP</h1>
          <p className={styles.subtitle}>Join debates, stake your opinion, win rewards</p>
          
          <div className={styles.headerActions}>
            <button 
              onClick={() => setShowCreateForm(true)}
              className={styles.createButton}
            >
              Create New Debate
            </button>
            <button 
              onClick={() => window.location.href = '/results'}
              className={styles.resultsButton}
            >
              📊 View Results
            </button>
          </div>
        </div>

        <div className={styles.debatesList}>
          <h2>Active Debates ({debates.length})</h2>
          
          {debates.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No active debates yet. Be the first to create one!</p>
            </div>
          ) : (
            <div className={styles.debatesGrid}>
              {debates.map((debate) => (
                <div key={debate.id} className={styles.debateCard}>
                  <div className={styles.debateHeader}>
                    <h3 className={styles.debateTitle}>{debate.title}</h3>
                    <div className={styles.debateTimer}>
                      ⏰ {formatTimeRemaining(debate.endsAt)}
                    </div>
                  </div>
                  
                  <p className={styles.debateDescription}>{debate.description}</p>
                  
                  <div className={styles.debateStats}>
                    <div className={styles.voteCount}>
                      <span className={styles.yesVotes}>👍 {debate.votes.yes}</span>
                      <span className={styles.noVotes}>👎 {debate.votes.no}</span>
                    </div>
                    <div className={styles.debateAuthor}>
                      by @{debate.createdBy}
                    </div>
                  </div>
                  
                  <button 
                    className={styles.joinButton}
                    onClick={() => {
                      // Navigate to debate detail page
                      window.location.href = `/debate/${debate.id}`;
                    }}
                  >
                    Join Debate
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {showCreateForm && (
          <CreateDebateForm 
            onClose={() => setShowCreateForm(false)}
            onSuccess={() => {
              setShowCreateForm(false);
              fetchDebates();
            }}
          />
        )}
      </div>
    </div>
  );
}

function CreateDebateForm({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [durationHours, setDurationHours] = useState(24);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/debates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          durationHours,
          createdBy: 'user123' // TODO: Get from Farcaster context
        }),
      });

      if (response.ok) {
        onSuccess();
      } else {
        console.error('Failed to create debate');
      }
    } catch (error) {
      console.error('Error creating debate:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3>Create New Debate</h3>
          <button onClick={onClose} className={styles.closeButton}>✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.createForm}>
          <div className={styles.formGroup}>
            <label>Debate Topic</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Are memecoins the future of DeFi?"
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide context and details for the debate..."
              rows={4}
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>Duration (hours)</label>
            <select
              value={durationHours}
              onChange={(e) => setDurationHours(Number(e.target.value))}
            >
              <option value={1}>1 hour</option>
              <option value={6}>6 hours</option>
              <option value={12}>12 hours</option>
              <option value={24}>24 hours</option>
              <option value={48}>48 hours</option>
              <option value={168}>1 week</option>
            </select>
          </div>
          
          <div className={styles.formActions}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>
              Cancel
            </button>
            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Debate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}