'use client';

import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { CONTRACT_ADDRESSES, DEBATE_TOKEN_ABI, DEBATE_CONTRACT_V2_ABI } from '@/lib/blockchain';
import { parseUnits, formatUnits } from 'viem';

interface StakingInterfaceProps {
  debateId: number;
  options: string[];
  onStakeSuccess: () => void;
}

export function StakingInterface({ debateId, options, onStakeSuccess }: StakingInterfaceProps) {
  const [selectedOption, setSelectedOption] = useState<number>(0);
  const [stakeAmount, setStakeAmount] = useState<string>('10');
  const [isApproving, setIsApproving] = useState(false);
  const [isStaking, setIsStaking] = useState(false);
  
  const { address } = useAccount();
  
  // Read min stake amount from contract
  const { data: minStakeAmount } = useReadContract({
    address: CONTRACT_ADDRESSES.DebateContractV2 as `0x${string}`,
    abi: DEBATE_CONTRACT_V2_ABI,
    functionName: 'minStakeAmount',
    query: {
      enabled: !!CONTRACT_ADDRESSES.DebateContractV2,
    },
  });
  
  const { writeContract: approveDebateToken, data: approveHash } = useWriteContract();
  const { writeContract: stakeAndVote, data: stakeHash } = useWriteContract();
  
  const { isLoading: isApprovingTx } = useWaitForTransactionReceipt({
    hash: approveHash,
  });
  
  const { isLoading: isStakingTx } = useWaitForTransactionReceipt({
    hash: stakeHash,
  });

  const handleApprove = async () => {
    if (!address) return;
    
    setIsApproving(true);
    try {
      const amount = parseUnits(stakeAmount, 18); // DEBATE has 18 decimals
      
      await approveDebateToken({
        address: CONTRACT_ADDRESSES.DebateToken as `0x${string}`,
        abi: DEBATE_TOKEN_ABI,
        functionName: 'approve',
        args: [CONTRACT_ADDRESSES.DebateContractV2 as `0x${string}`, amount],
      });
    } catch (error) {
      console.error('Approval failed:', error);
    } finally {
      setIsApproving(false);
    }
  };

  const handleStakeAndVote = async () => {
    if (!address) return;
    
    setIsStaking(true);
    try {
      await stakeAndVote({
        address: CONTRACT_ADDRESSES.DebateContractV2 as `0x${string}`,
        abi: DEBATE_CONTRACT_V2_ABI,
        functionName: 'stakeAndVote',
        args: [
          BigInt(debateId),
          BigInt(selectedOption),
          parseUnits(stakeAmount, 18)
        ],
      });
      
      // Call success callback after transaction
      setTimeout(() => {
        onStakeSuccess();
      }, 2000);
    } catch (error) {
      console.error('Stake and vote failed:', error);
    } finally {
      setIsStaking(false);
    }
  };

  const minStake = minStakeAmount ? formatUnits(minStakeAmount as bigint, 18) : '10';
  const maxStake = '1000';

  return (
    <div className="staking-interface">
      <h3>🎯 Stake DEBATE Tokens and Vote</h3>
      
      <div className="stake-info">
        <p>💰 <strong>Min Stake:</strong> {minStake} DEBATE</p>
        <p>💡 <strong>Tip:</strong> Higher stakes = more influence on the outcome</p>
      </div>
      
      <div className="stake-input">
        <label>Stake Amount (DEBATE):</label>
        <input
          type="number"
          placeholder={`Min: ${minStake}`}
          value={stakeAmount}
          onChange={(e) => setStakeAmount(e.target.value)}
          min={minStake}
          max={maxStake}
        />
        <div className="stake-slider">
          <input
            type="range"
            min={minStake}
            max={maxStake}
            step="10"
            value={stakeAmount}
            onChange={(e) => setStakeAmount(e.target.value)}
          />
          <div className="stake-labels">
            <span>{minStake}</span>
            <span>{maxStake}</span>
          </div>
        </div>
      </div>
      
      <div className="vote-options">
        <label>Choose your option:</label>
        <div className="option-buttons">
          {options.map((option, index) => (
            <button
              key={index}
              className={`option-button ${selectedOption === index ? 'selected' : ''}`}
              onClick={() => setSelectedOption(index)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
      
      <div className="action-buttons">
        <button 
          onClick={handleApprove}
          disabled={isApproving || isApprovingTx || !stakeAmount || Number(stakeAmount) < Number(minStake)}
          className="approve-button"
        >
          {isApproving || isApprovingTx ? 'Approving...' : `Approve ${stakeAmount} DEBATE`}
        </button>
        
        <button 
          onClick={handleStakeAndVote}
          disabled={isStaking || isStakingTx || !approveHash || !stakeAmount || Number(stakeAmount) < Number(minStake)}
          className="stake-button"
        >
          {isStaking || isStakingTx ? 'Staking...' : `Stake ${stakeAmount} DEBATE and Vote`}
        </button>
      </div>
      
      {approveHash && (
        <div className="tx-info">
          <p>✅ Approval transaction sent!</p>
          <a href={`https://sepolia.etherscan.io/tx/${approveHash}`} target="_blank" rel="noopener noreferrer">
            View Approval on Etherscan: {approveHash.slice(0, 10)}...
          </a>
        </div>
      )}
      
      {stakeHash && (
        <div className="tx-info">
          <p>✅ Vote transaction sent!</p>
          <a href={`https://sepolia.etherscan.io/tx/${stakeHash}`} target="_blank" rel="noopener noreferrer">
            View Vote on Etherscan: {stakeHash.slice(0, 10)}...
          </a>
        </div>
      )}

      <style jsx>{`
        .staking-interface {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 20px;
          margin: 20px 0;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .staking-interface h3 {
          margin: 0 0 20px 0;
          color: #fff;
          font-size: 1.5rem;
        }

        .stake-info {
          background: rgba(255, 193, 7, 0.1);
          border: 1px solid rgba(255, 193, 7, 0.3);
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 20px;
        }

        .stake-info p {
          margin: 0.5rem 0;
          color: #ffc107;
          font-size: 0.9rem;
        }

        .stake-input {
          margin-bottom: 20px;
        }

        .stake-input label {
          color: #a7e9af;
          font-weight: 600;
          margin-bottom: 0.5rem;
          display: block;
        }

        .stake-input input[type="number"] {
          width: 100%;
          padding: 12px;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: rgba(0, 0, 0, 0.3);
          color: white;
          margin-bottom: 0.5rem;
          font-size: 16px;
        }

        .stake-slider {
          margin-top: 0.5rem;
        }

        .stake-slider input[type="range"] {
          width: 100%;
          height: 6px;
          border-radius: 3px;
          background: rgba(255, 255, 255, 0.2);
          outline: none;
          -webkit-appearance: none;
        }

        .stake-slider input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #667eea;
          cursor: pointer;
        }

        .stake-slider input[type="range"]::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #667eea;
          cursor: pointer;
          border: none;
        }

        .stake-labels {
          display: flex;
          justify-content: space-between;
          margin-top: 0.5rem;
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.6);
        }

        .vote-options {
          margin-bottom: 20px;
        }

        .vote-options label {
          color: #a7e9af;
          font-weight: 600;
          margin-bottom: 0.5rem;
          display: block;
        }

        .option-buttons {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .option-button {
          flex: 1;
          padding: 12px 16px;
          border-radius: 8px;
          border: 2px solid rgba(255, 255, 255, 0.2);
          background: rgba(0, 0, 0, 0.3);
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.9rem;
        }

        .option-button:hover {
          border-color: rgba(255, 255, 255, 0.4);
          background: rgba(255, 255, 255, 0.1);
        }

        .option-button.selected {
          border-color: #667eea;
          background: rgba(102, 126, 234, 0.2);
          color: #a7e9af;
        }

        .action-buttons {
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
          margin-bottom: 20px;
        }

        .approve-button, .stake-button {
          flex: 1;
          min-width: 150px;
          padding: 15px 25px;
          border: none;
          border-radius: 8px;
          font-weight: bold;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .approve-button {
          background: linear-gradient(135deg, #ff6b6b, #ee5a52);
          color: #fff;
        }

        .stake-button {
          background: linear-gradient(135deg, #4ecdc4, #44a08d);
          color: #fff;
        }

        .approve-button:hover:not(:disabled),
        .stake-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        .approve-button:disabled,
        .stake-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .tx-info {
          background: rgba(33, 150, 243, 0.1);
          border: 1px solid rgba(33, 150, 243, 0.3);
          border-radius: 8px;
          padding: 15px;
          margin-top: 15px;
        }

        .tx-info p {
          margin: 0.5rem 0;
          color: #2196F3;
          font-weight: 600;
        }

        .tx-info a {
          color: #2196F3;
          text-decoration: none;
          font-size: 0.9rem;
        }

        .tx-info a:hover {
          text-decoration: underline;
        }

        @media (max-width: 768px) {
          .action-buttons {
            flex-direction: column;
          }
          
          .approve-button, .stake-button {
            min-width: auto;
          }
        }
      `}</style>
    </div>
  );
}