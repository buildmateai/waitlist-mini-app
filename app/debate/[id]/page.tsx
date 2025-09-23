"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Debate } from "../../../lib/types";
import styles from "./page.module.css";

export default function DebateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [debate, setDebate] = useState<Debate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasVoted, setHasVoted] = useState(false);
  const [userVote, setUserVote] = useState<'yes' | 'no' | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
    total: number;
  } | null>(null);

  const debateId = params.id as string;
  const userId = 'user123'; // TODO: Get from Farcaster context

  useEffect(() => {
    fetchDebate();
  }, [debateId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (debate && debate.status === 'active') {
      const interval = setInterval(() => {
        updateTimer();
      }, 1000);
      
      updateTimer(); // Initial call
      
      return () => clearInterval(interval);
    }
  }, [debate]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchDebate = async () => {
    try {
      const response = await fetch(`/api/debates/${debateId}`);
      if (response.ok) {
        const data = await response.json();
        setDebate(data);
        
        // Check if user has already voted
        if (data.votes.voters.includes(userId)) {
          setHasVoted(true);
          // Determine which way they voted by checking vote counts
          // This is a simple approach - in real app, store individual votes
        }
      } else {
        console.error('Failed to fetch debate');
        router.push('/');
      }
    } catch (error) {
      console.error('Error fetching debate:', error);
      router.push('/');
    } finally {
      setIsLoading(false);
    }
  };

  const updateTimer = () => {
    if (!debate) return;
    
    const now = Date.now();
    const remaining = debate.endsAt - now;
    
    if (remaining <= 0) {
      setTimeRemaining({
        hours: 0,
        minutes: 0,
        seconds: 0,
        total: 0
      });
      // Debate has ended
      setDebate({ ...debate, status: 'ended' });
    } else {
      const hours = Math.floor(remaining / (1000 * 60 * 60));
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
      
      setTimeRemaining({
        hours,
        minutes,
        seconds,
        total: remaining
      });
    }
  };

  const handleVote = async (vote: 'yes' | 'no') => {
    if (hasVoted || !debate || debate.status !== 'active') return;

    try {
      const response = await fetch(`/api/debates/${debateId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          voterId: userId,
          vote: vote
        }),
      });

      if (response.ok) {
        const updatedDebate = await response.json();
        setDebate(updatedDebate);
        setHasVoted(true);
        setUserVote(vote);
      } else {
        console.error('Failed to vote');
      }
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const getVotePercentage = (votes: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((votes / total) * 100);
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.loading}>Loading debate...</div>
        </div>
      </div>
    );
  }

  if (!debate) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.error}>Debate not found</div>
        </div>
      </div>
    );
  }

  const totalVotes = debate.votes.yes + debate.votes.no;
  const isEnded = debate.status === 'ended' || (timeRemaining?.total || 0) <= 0;

  return (
    <div className={styles.container}>
      <button 
        className={styles.backButton}
        onClick={() => router.push('/')}
      >
        ← Back to Debates
      </button>

      <div className={styles.content}>
        <div className={styles.debateHeader}>
          <h1 className={styles.debateTitle}>{debate.title}</h1>
          
          <div className={styles.debateMeta}>
            <div className={styles.author}>
              Created by @{debate.createdBy}
            </div>
            <div className={styles.createdAt}>
              {new Date(debate.createdAt).toLocaleString()}
            </div>
          </div>
        </div>

        <div className={styles.debateDescription}>
          <h3>Description</h3>
          <p>{debate.description}</p>
        </div>

        <div className={styles.timerSection}>
          <h3>Time Remaining</h3>
          {isEnded ? (
            <div className={styles.timerEnded}>⏰ Debate Ended</div>
          ) : timeRemaining ? (
            <div className={styles.timer}>
              <div className={styles.timerUnit}>
                <span className={styles.timerValue}>{timeRemaining.hours}</span>
                <span className={styles.timerLabel}>hours</span>
              </div>
              <div className={styles.timerUnit}>
                <span className={styles.timerValue}>{timeRemaining.minutes}</span>
                <span className={styles.timerLabel}>min</span>
              </div>
              <div className={styles.timerUnit}>
                <span className={styles.timerValue}>{timeRemaining.seconds}</span>
                <span className={styles.timerLabel}>sec</span>
              </div>
            </div>
          ) : (
            <div className={styles.loading}>Loading timer...</div>
          )}
        </div>

        <div className={styles.votingSection}>
          <h3>Cast Your Vote</h3>
          
          {isEnded ? (
            <div className={styles.votingEnded}>
              <p>Voting has ended for this debate.</p>
            </div>
          ) : hasVoted ? (
            <div className={styles.voted}>
              <p>✅ You have already voted!</p>
              {userVote && (
                <p>Your vote: <strong>{userVote === 'yes' ? 'YES' : 'NO'}</strong></p>
              )}
            </div>
          ) : (
            <div className={styles.voteButtons}>
              <button
                className={`${styles.voteButton} ${styles.yesButton}`}
                onClick={() => handleVote('yes')}
              >
                👍 YES
              </button>
              <button
                className={`${styles.voteButton} ${styles.noButton}`}
                onClick={() => handleVote('no')}
              >
                👎 NO
              </button>
            </div>
          )}
        </div>

        <div className={styles.resultsSection}>
          <h3>Current Results</h3>
          
          <div className={styles.results}>
            <div className={styles.resultItem}>
              <div className={styles.resultHeader}>
                <span className={styles.resultLabel}>👍 YES</span>
                <span className={styles.resultCount}>{debate.votes.yes}</span>
              </div>
              <div className={styles.progressBar}>
                <div 
                  className={`${styles.progressFill} ${styles.yesProgress}`}
                  style={{ width: `${getVotePercentage(debate.votes.yes, totalVotes)}%` }}
                ></div>
              </div>
              <div className={styles.percentage}>
                {getVotePercentage(debate.votes.yes, totalVotes)}%
              </div>
            </div>

            <div className={styles.resultItem}>
              <div className={styles.resultHeader}>
                <span className={styles.resultLabel}>👎 NO</span>
                <span className={styles.resultCount}>{debate.votes.no}</span>
              </div>
              <div className={styles.progressBar}>
                <div 
                  className={`${styles.progressFill} ${styles.noProgress}`}
                  style={{ width: `${getVotePercentage(debate.votes.no, totalVotes)}%` }}
                ></div>
              </div>
              <div className={styles.percentage}>
                {getVotePercentage(debate.votes.no, totalVotes)}%
              </div>
            </div>
          </div>

          <div className={styles.totalVotes}>
            Total votes: <strong>{totalVotes}</strong>
          </div>
        </div>

        {isEnded && (
          <div className={styles.winnerSection}>
            <h3>🏆 Winner</h3>
            <div className={styles.winner}>
              {debate.votes.yes > debate.votes.no ? (
                <div className={styles.winnerResult}>
                  <div className={styles.winnerEmoji}>👍</div>
                  <div className={styles.winnerText}>YES wins!</div>
                  <div className={styles.winnerSubtext}>
                    {debate.votes.yes} vs {debate.votes.no} votes
                  </div>
                </div>
              ) : debate.votes.no > debate.votes.yes ? (
                <div className={styles.winnerResult}>
                  <div className={styles.winnerEmoji}>👎</div>
                  <div className={styles.winnerText}>NO wins!</div>
                  <div className={styles.winnerSubtext}>
                    {debate.votes.no} vs {debate.votes.yes} votes
                  </div>
                </div>
              ) : (
                <div className={styles.winnerResult}>
                  <div className={styles.winnerEmoji}>🤝</div>
                  <div className={styles.winnerText}>It&apos;s a tie!</div>
                  <div className={styles.winnerSubtext}>
                    {debate.votes.yes} vs {debate.votes.no} votes
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
