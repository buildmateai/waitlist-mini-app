"use client";
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAccount, useReadContract } from "wagmi";
import { Debate, ChatMessage } from "../../../lib/types";
import { CONTRACT_ADDRESSES, DEBATE_CONTRACT_V2_ABI } from "../../../lib/blockchain";
import { StakingInterface } from "../../../components/StakingInterface";
import { WalletConnection } from "../../../components/WalletConnection";
import styles from "./page.module.css";

export default function DebateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const [debate, setDebate] = useState<Debate | null>(null);
  const [blockchainDebate, setBlockchainDebate] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasVoted, setHasVoted] = useState(false);
  const [userVote, setUserVote] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
    total: number;
  } | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const debateId = params.id as string;
  const userId = address || 'user123'; // Use wallet address if connected

  // Read blockchain debate data
  const { data: blockchainData, refetch: refetchBlockchain } = useReadContract({
    address: CONTRACT_ADDRESSES.DebateContractV2 as `0x${string}`,
    abi: DEBATE_CONTRACT_V2_ABI,
    functionName: 'getDebate',
    args: [BigInt(debateId)],
    query: {
      enabled: !!CONTRACT_ADDRESSES.DebateContractV2 && !!debateId,
    },
  });

  // Check if user has voted on blockchain
  const { data: hasVotedBlockchain } = useReadContract({
    address: CONTRACT_ADDRESSES.DebateContractV2 as `0x${string}`,
    abi: DEBATE_CONTRACT_V2_ABI,
    functionName: 'hasUserVoted',
    args: [BigInt(debateId), address as `0x${string}`],
    query: {
      enabled: !!CONTRACT_ADDRESSES.DebateContractV2 && !!debateId && !!address,
    },
  });

  // Get user's vote data from blockchain
  const { data: userVoteData } = useReadContract({
    address: CONTRACT_ADDRESSES.DebateContractV2 as `0x${string}`,
    abi: DEBATE_CONTRACT_V2_ABI,
    functionName: 'getUserVote',
    args: [BigInt(debateId), address as `0x${string}`],
    query: {
      enabled: !!CONTRACT_ADDRESSES.DebateContractV2 && !!debateId && !!address,
    },
  });

  useEffect(() => {
    fetchDebate();
    fetchChatMessages();
    
    // Update blockchain data when it changes
    if (blockchainData) {
      setBlockchainDebate(blockchainData);
      setHasVoted(Boolean(hasVotedBlockchain));
      
      if (userVoteData && Array.isArray(userVoteData) && blockchainData && Array.isArray(blockchainData) && blockchainData.length > 3) {
        const [, optionIndex] = userVoteData;
        const options = blockchainData[3]; // options is at index 3 in the returned array
        if (Array.isArray(options)) {
          setUserVote(options[Number(optionIndex)]);
        }
      }
    }
  }, [debateId, blockchainData, hasVotedBlockchain, userVoteData]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const handleVote = async (option: string) => {
    if (hasVoted || !debate || debate.status !== 'active') return;

    try {
      const response = await fetch(`/api/debates/${debateId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          voterId: userId,
          option: option
        }),
      });

      if (response.ok) {
        const updatedDebate = await response.json();
        setDebate(updatedDebate);
        setHasVoted(true);
        setUserVote(option);
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

  const fetchChatMessages = async () => {
    if (!debateId) return;
    
    try {
      const response = await fetch(`/api/debates/${debateId}/chat`);
      if (response.ok) {
        const messages = await response.json();
        setChatMessages(messages);
      }
    } catch (error) {
      console.error('Error fetching chat messages:', error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !debateId || isSendingMessage) return;

    setIsSendingMessage(true);
    try {
      const response = await fetch(`/api/debates/${debateId}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          author: 'user123', // TODO: Get from Farcaster context
          message: newMessage.trim()
        }),
      });

      if (response.ok) {
        const updatedMessages = await response.json();
        setChatMessages(updatedMessages);
        setNewMessage("");
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleReaction = async (messageId: string, reactionType: 'upvote' | 'downvote') => {
    try {
      const response = await fetch(`/api/debates/${debateId}/messages/${messageId}/reactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'user123', // TODO: Get from Farcaster context
          reactionType
        }),
      });

      if (response.ok) {
        const updatedMessages = await response.json();
        setChatMessages(updatedMessages);
      }
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const handleStakeSuccess = () => {
    // Refresh blockchain data after successful staking
    refetchBlockchain();
    setHasVoted(true);
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

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

  const getTotalVotes = (debate: Debate) => {
    const option1Votes = debate.votes[debate.votingOptions.option1] as number || 0;
    const option2Votes = debate.votes[debate.votingOptions.option2] as number || 0;
    return option1Votes + option2Votes;
  };
  
  const totalVotes = getTotalVotes(debate);
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
          
          {/* Wallet Connection */}
          <div className={styles.walletSection}>
            <WalletConnection />
          </div>
          
          {isEnded ? (
            <div className={styles.votingEnded}>
              <p>Voting has ended for this debate.</p>
            </div>
          ) : hasVoted ? (
            <div className={styles.voted}>
              <p>✅ You have already voted!</p>
              {userVote && (
                <p>Your vote: <strong>{String(userVote as any)}</strong></p>
              )}
              {(userVoteData as any) && Array.isArray(userVoteData) && userVoteData.length > 0 && (
                <p>Your stake: <strong>{Number((userVoteData as any[])[0]) / 1e18} DEBATE</strong></p>
              )}
            </div>
          ) : (
            <div className={styles.voteOptions}>
              {/* Traditional voting buttons */}
              <div className={styles.voteButtons}>
                <button
                  className={`${styles.voteButton} ${styles.option1Button}`}
                  onClick={() => handleVote(debate.votingOptions.option1)}
                >
                  {debate.votingOptions.option1}
                </button>
                <button
                  className={`${styles.voteButton} ${styles.option2Button}`}
                  onClick={() => handleVote(debate.votingOptions.option2)}
                >
                  {debate.votingOptions.option2}
                </button>
              </div>
              
              {/* Blockchain staking interface */}
              {isConnected && CONTRACT_ADDRESSES.DebateContractV2 && (
                <div className={styles.blockchainVoting}>
                  <h4>💰 Stake USDC & Vote on Blockchain</h4>
                  <StakingInterface 
                    debateId={Number(debateId)}
                    options={[debate.votingOptions.option1, debate.votingOptions.option2]}
                    onStakeSuccess={handleStakeSuccess}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        <div className={styles.resultsSection}>
          <h3>Current Results</h3>
          
          {/* Blockchain Results */}
          {blockchainDebate && (
            <div className={styles.blockchainResults}>
              <h4>💰 Blockchain Stakes</h4>
              <div className={styles.blockchainStats}>
                <p>Total Staked: <strong>{Number(blockchainDebate.totalStaked) / 1e6} USDC</strong></p>
                <p>Platform Fee: <strong>{Number(blockchainDebate.totalStaked) * 0.05 / 1e6} USDC</strong></p>
                <p>Reward Pool: <strong>{(Number(blockchainDebate.totalStaked) * 0.95) / 1e6} USDC</strong></p>
              </div>
              
              <div className={styles.results}>
                {blockchainDebate.options.map((option: string, index: number) => (
                  <div key={index} className={styles.resultItem}>
                    <div className={styles.resultHeader}>
                      <span className={styles.resultLabel}>{option}</span>
                      <span className={styles.resultCount}>
                        {Number(blockchainDebate.stakes[index]) / 1e6} USDC
                      </span>
                    </div>
                    <div className={styles.progressBar}>
                      <div 
                        className={`${styles.progressFill} ${index === 0 ? styles.option1Progress : styles.option2Progress}`}
                        style={{ 
                          width: `${blockchainDebate.totalStaked > 0 
                            ? (Number(blockchainDebate.stakes[index]) / Number(blockchainDebate.totalStaked)) * 100 
                            : 0}%` 
                        }}
                      ></div>
                    </div>
                    <div className={styles.percentage}>
                      {blockchainDebate.totalStaked > 0 
                        ? ((Number(blockchainDebate.stakes[index]) / Number(blockchainDebate.totalStaked)) * 100).toFixed(1)
                        : 0}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Traditional Results */}
          <div className={styles.traditionalResults}>
            <h4>📊 Traditional Votes</h4>
            <div className={styles.results}>
            <div className={styles.resultItem}>
              <div className={styles.resultHeader}>
                <span className={styles.resultLabel}>{debate.votingOptions.option1}</span>
                <span className={styles.resultCount}>{debate.votes[debate.votingOptions.option1] as number || 0}</span>
              </div>
              <div className={styles.progressBar}>
                <div 
                  className={`${styles.progressFill} ${styles.option1Progress}`}
                  style={{ width: `${getVotePercentage(debate.votes[debate.votingOptions.option1] as number || 0, totalVotes)}%` }}
                ></div>
              </div>
              <div className={styles.percentage}>
                {getVotePercentage(debate.votes[debate.votingOptions.option1] as number || 0, totalVotes)}%
              </div>
            </div>

            <div className={styles.resultItem}>
              <div className={styles.resultHeader}>
                <span className={styles.resultLabel}>{debate.votingOptions.option2}</span>
                <span className={styles.resultCount}>{debate.votes[debate.votingOptions.option2] as number || 0}</span>
              </div>
              <div className={styles.progressBar}>
                <div 
                  className={`${styles.progressFill} ${styles.option2Progress}`}
                  style={{ width: `${getVotePercentage(debate.votes[debate.votingOptions.option2] as number || 0, totalVotes)}%` }}
                ></div>
              </div>
              <div className={styles.percentage}>
                {getVotePercentage(debate.votes[debate.votingOptions.option2] as number || 0, totalVotes)}%
              </div>
            </div>
            </div>

            <div className={styles.totalVotes}>
              Total votes: <strong>{totalVotes}</strong>
            </div>
          </div>
        </div>

        {/* Chat Section */}
        <div className={styles.chatSection}>
          <h3>💬 Discussion</h3>
          <div className={styles.chatContainer}>
            <div className={styles.chatMessages}>
              {chatMessages.map((message) => (
                <div key={message.id} className={styles.chatMessage}>
                  <div className={styles.messageHeader}>
                    <span className={styles.messageAuthor}>@{message.author}</span>
                    <span className={styles.messageTime}>
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className={styles.messageContent}>{message.message}</div>
                  <div className={styles.messageReactions}>
                    <button 
                      className={styles.reactionButton}
                      onClick={() => handleReaction(message.id, 'upvote')}
                      title="Upvote"
                    >
                      👍 {message.reactions.upvotes}
                    </button>
                    <button 
                      className={styles.reactionButton}
                      onClick={() => handleReaction(message.id, 'downvote')}
                      title="Downvote"
                    >
                      👎 {message.reactions.downvotes}
                    </button>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            
            <form onSubmit={sendMessage} className={styles.chatForm}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Share your thoughts..."
                className={styles.chatInput}
                disabled={isSendingMessage}
              />
              <button 
                type="submit" 
                className={styles.chatSendButton}
                disabled={!newMessage.trim() || isSendingMessage}
              >
                {isSendingMessage ? 'Sending...' : 'Send'}
              </button>
            </form>
          </div>
        </div>

        {isEnded && (
          <div className={styles.winnerSection}>
            <h3>🏆 Winner</h3>
            <div className={styles.winner}>
              {(() => {
                const option1Votes = debate.votes[debate.votingOptions.option1] as number || 0;
                const option2Votes = debate.votes[debate.votingOptions.option2] as number || 0;
                
                if (option1Votes > option2Votes) {
                  return (
                    <div className={styles.winnerResult}>
                      <div className={styles.winnerEmoji}>🏆</div>
                      <div className={styles.winnerText}>{debate.votingOptions.option1} wins!</div>
                      <div className={styles.winnerSubtext}>
                        {option1Votes} vs {option2Votes} votes
                      </div>
                    </div>
                  );
                } else if (option2Votes > option1Votes) {
                  return (
                    <div className={styles.winnerResult}>
                      <div className={styles.winnerEmoji}>🏆</div>
                      <div className={styles.winnerText}>{debate.votingOptions.option2} wins!</div>
                      <div className={styles.winnerSubtext}>
                        {option2Votes} vs {option1Votes} votes
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <div className={styles.winnerResult}>
                      <div className={styles.winnerEmoji}>🤝</div>
                      <div className={styles.winnerText}>It&apos;s a tie!</div>
                      <div className={styles.winnerSubtext}>
                        {option1Votes} vs {option2Votes} votes
                      </div>
                    </div>
                  );
                }
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
