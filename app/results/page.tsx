"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Debate } from "../../lib/types";
import styles from "./page.module.css";

export default function ResultsPage() {
  const router = useRouter();
  const [debates, setDebates] = useState<Debate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'ended' | 'active'>('ended');

  useEffect(() => {
    fetchAllDebates();
  }, []);

  const fetchAllDebates = async () => {
    try {
      const response = await fetch('/api/debates?all=true');
      if (response.ok) {
        const data = await response.json();
        setDebates(data);
      }
    } catch (error) {
      console.error('Error fetching debates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getFilteredDebates = () => {
    const now = Date.now();
    return debates.filter(debate => {
      switch (filter) {
        case 'ended':
          return debate.status === 'ended' || debate.endsAt <= now;
        case 'active':
          return debate.status === 'active' && debate.endsAt > now;
        default:
          return true;
      }
    });
  };

  const getWinner = (debate: Debate) => {
    if (debate.votes.yes > debate.votes.no) return 'yes';
    if (debate.votes.no > debate.votes.yes) return 'no';
    return 'tie';
  };

  const getVotePercentage = (votes: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((votes / total) * 100);
  };

  const getTotalVotes = (debate: Debate) => {
    return debate.votes.yes + debate.votes.no;
  };

  const getMostPopularDebates = () => {
    return [...debates]
      .sort((a, b) => getTotalVotes(b) - getTotalVotes(a))
      .slice(0, 5);
  };

  const getTotalStats = () => {
    const endedDebates = debates.filter(d => d.status === 'ended' || d.endsAt <= Date.now());
    const totalVotes = endedDebates.reduce((sum, d) => sum + getTotalVotes(d), 0);
    const totalDebates = endedDebates.length;
    const totalParticipants = endedDebates.reduce((sum, d) => sum + d.votes.voters.length, 0);

    return { totalDebates, totalVotes, totalParticipants };
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.loading}>Loading results...</div>
        </div>
      </div>
    );
  }

  const filteredDebates = getFilteredDebates();
  const mostPopular = getMostPopularDebates();
  const stats = getTotalStats();

  return (
    <div className={styles.container}>
      <button 
        className={styles.backButton}
        onClick={() => router.push('/')}
      >
        ← Back to Debates
      </button>

      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.title}>📊 Debate Results</h1>
          <p className={styles.subtitle}>Statistics and history of all debates</p>
        </div>

        {/* Stats Overview */}
        <div className={styles.statsOverview}>
          <h2>Overall Statistics</h2>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{stats.totalDebates}</div>
              <div className={styles.statLabel}>Total Debates</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{stats.totalVotes}</div>
              <div className={styles.statLabel}>Total Votes</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{stats.totalParticipants}</div>
              <div className={styles.statLabel}>Participants</div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className={styles.filterTabs}>
          <button
            className={`${styles.filterTab} ${filter === 'all' ? styles.active : ''}`}
            onClick={() => setFilter('all')}
          >
            All Debates
          </button>
          <button
            className={`${styles.filterTab} ${filter === 'ended' ? styles.active : ''}`}
            onClick={() => setFilter('ended')}
          >
            Ended Debates
          </button>
          <button
            className={`${styles.filterTab} ${filter === 'active' ? styles.active : ''}`}
            onClick={() => setFilter('active')}
          >
            Active Debates
          </button>
        </div>

        {/* Most Popular Debates */}
        {filter === 'ended' && mostPopular.length > 0 && (
          <div className={styles.popularSection}>
            <h2>🔥 Most Popular Debates</h2>
            <div className={styles.popularGrid}>
              {mostPopular.map((debate) => {
                const winner = getWinner(debate);
                const totalVotes = getTotalVotes(debate);
                return (
                  <div key={debate.id} className={styles.popularCard}>
                    <h3 className={styles.popularTitle}>{debate.title}</h3>
                    <div className={styles.popularStats}>
                      <div className={styles.popularVotes}>
                        {totalVotes} votes
                      </div>
                      <div className={`${styles.popularWinner} ${styles[`winner${winner.charAt(0).toUpperCase() + winner.slice(1)}`]}`}>
                        {winner === 'yes' ? '👍 YES' : winner === 'no' ? '👎 NO' : '🤝 TIE'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Debates List */}
        <div className={styles.debatesSection}>
          <h2>
            {filter === 'all' ? 'All Debates' : 
             filter === 'ended' ? 'Ended Debates' : 'Active Debates'}
            ({filteredDebates.length})
          </h2>
          
          {filteredDebates.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No debates found for this filter.</p>
            </div>
          ) : (
            <div className={styles.debatesList}>
              {filteredDebates.map((debate) => {
                const winner = getWinner(debate);
                const totalVotes = getTotalVotes(debate);
                const isEnded = debate.status === 'ended' || debate.endsAt <= Date.now();
                
                return (
                  <div key={debate.id} className={styles.debateResultCard}>
                    <div className={styles.debateHeader}>
                      <h3 className={styles.debateTitle}>{debate.title}</h3>
                      <div className={styles.debateStatus}>
                        {isEnded ? (
                          <span className={styles.statusEnded}>Ended</span>
                        ) : (
                          <span className={styles.statusActive}>Active</span>
                        )}
                      </div>
                    </div>
                    
                    <p className={styles.debateDescription}>{debate.description}</p>
                    
                    <div className={styles.debateMeta}>
                      <div className={styles.debateAuthor}>
                        by @{debate.createdBy}
                      </div>
                      <div className={styles.debateDate}>
                        {new Date(debate.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    {totalVotes > 0 ? (
                      <div className={styles.debateResults}>
                        <div className={styles.resultRow}>
                          <div className={styles.resultLabel}>
                            <span className={styles.yesEmoji}>👍</span> YES
                          </div>
                          <div className={styles.resultBar}>
                            <div 
                              className={`${styles.resultProgress} ${styles.yesProgress}`}
                              style={{ width: `${getVotePercentage(debate.votes.yes, totalVotes)}%` }}
                            ></div>
                          </div>
                          <div className={styles.resultStats}>
                            {debate.votes.yes} ({getVotePercentage(debate.votes.yes, totalVotes)}%)
                          </div>
                        </div>
                        
                        <div className={styles.resultRow}>
                          <div className={styles.resultLabel}>
                            <span className={styles.noEmoji}>👎</span> NO
                          </div>
                          <div className={styles.resultBar}>
                            <div 
                              className={`${styles.resultProgress} ${styles.noProgress}`}
                              style={{ width: `${getVotePercentage(debate.votes.no, totalVotes)}%` }}
                            ></div>
                          </div>
                          <div className={styles.resultStats}>
                            {debate.votes.no} ({getVotePercentage(debate.votes.no, totalVotes)}%)
                          </div>
                        </div>

                        {isEnded && (
                          <div className={styles.debateWinner}>
                            <span className={styles.winnerLabel}>Winner:</span>
                            <span className={`${styles.winnerResult} ${styles[`winner${winner.charAt(0).toUpperCase() + winner.slice(1)}`]}`}>
                              {winner === 'yes' ? '👍 YES' : winner === 'no' ? '👎 NO' : '🤝 TIE'}
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className={styles.noVotes}>
                        No votes yet
                      </div>
                    )}

                    <button
                      className={styles.viewButton}
                      onClick={() => router.push(`/debate/${debate.id}`)}
                    >
                      {isEnded ? 'View Results' : 'Join Debate'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
