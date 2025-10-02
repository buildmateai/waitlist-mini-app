'use client';

import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESSES, DEBATE_CONTRACT_V2_ABI } from '@/lib/blockchain';
import { formatUnits } from 'viem';

interface RewardClaimProps {
  debateId: number;
  isWinner: boolean;
  userStake: bigint;
  totalWinningStakes: bigint;
  rewardPool: bigint;
}

export function RewardClaim({ 
  debateId, 
  isWinner, 
  userStake, 
  totalWinningStakes, 
  rewardPool 
}: RewardClaimProps) {
  const [isClaiming, setIsClaiming] = useState(false);
  const { address } = useAccount();
  
  const { writeContract: claimReward, data: claimHash } = useWriteContract();
  
  const { isLoading: isClaimingTx } = useWaitForTransactionReceipt({
    hash: claimHash,
  });

  const calculateReward = () => {
    if (!isWinner || totalWinningStakes === BigInt(0)) return BigInt(0);
    return (rewardPool * userStake) / totalWinningStakes;
  };

  const handleClaimReward = async () => {
    if (!address || !isWinner) return;
    
    setIsClaiming(true);
    try {
      await claimReward({
        address: CONTRACT_ADDRESSES.DebateContractV2 as `0x${string}`,
        abi: DEBATE_CONTRACT_V2_ABI,
        functionName: 'claimReward',
        args: [BigInt(debateId)],
      });
    } catch (error) {
      console.error('Claim failed:', error);
    } finally {
      setIsClaiming(false);
    }
  };

  const rewardAmount = calculateReward();

  if (!isWinner) {
    return (
      <div className="reward-claim">
        <div className="not-winner">
          <p>❌ You didn&apos;t win this debate</p>
          <p>Better luck next time!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="reward-claim">
      <div className="winner-reward">
        <h4>🏆 Congratulations! You Won!</h4>
        <div className="reward-details">
          <p>Your stake: <strong>{formatUnits(userStake, 6)} USDC</strong></p>
          <p>Your reward: <strong>{formatUnits(rewardAmount, 6)} USDC</strong></p>
          <p>Reward multiplier: <strong>{(Number(rewardAmount) / Number(userStake)).toFixed(2)}x</strong></p>
        </div>
        
        <button
          onClick={handleClaimReward}
          disabled={isClaiming || isClaimingTx}
          className="claim-button"
        >
          {isClaiming || isClaimingTx ? 'Claiming...' : 'Claim Reward'}
        </button>
        
        {claimHash && (
          <div className="transaction-info">
            <p>Transaction submitted!</p>
            <a 
              href={`https://sepolia.basescan.org/tx/${claimHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="tx-link"
            >
              View on BaseScan
            </a>
          </div>
        )}
      </div>

      <style jsx>{`
        .reward-claim {
          background: rgba(255, 215, 0, 0.1);
          border-radius: 12px;
          padding: 20px;
          margin: 20px 0;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 215, 0, 0.3);
        }

        .not-winner {
          text-align: center;
          color: #ff6b6b;
        }

        .not-winner p {
          margin: 10px 0;
          font-size: 1.1rem;
        }

        .winner-reward {
          text-align: center;
        }

        .winner-reward h4 {
          margin: 0 0 20px 0;
          color: #ffd700;
          font-size: 1.5rem;
        }

        .reward-details {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 15px;
          margin: 20px 0;
          text-align: left;
        }

        .reward-details p {
          margin: 8px 0;
          color: #fff;
        }

        .reward-details strong {
          color: #ffd700;
        }

        .claim-button {
          background: linear-gradient(135deg, #ffd700, #ffed4e);
          color: #000;
          border: none;
          padding: 15px 30px;
          border-radius: 8px;
          font-weight: bold;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          margin: 20px 0;
        }

        .claim-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
        }

        .claim-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .transaction-info {
          margin-top: 15px;
          padding: 10px;
          background: rgba(0, 255, 0, 0.1);
          border-radius: 8px;
          border: 1px solid rgba(0, 255, 0, 0.3);
        }

        .transaction-info p {
          margin: 5px 0;
          color: #90EE90;
        }

        .tx-link {
          color: #00ff88;
          text-decoration: none;
          font-weight: bold;
        }

        .tx-link:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
