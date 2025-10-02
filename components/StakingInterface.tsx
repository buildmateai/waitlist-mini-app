'use client';

import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESSES, MOCK_USDC_ABI, DEBATE_CONTRACT_V2_ABI } from '@/lib/blockchain';
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
  
  const { writeContract: approveUSDC, data: approveHash } = useWriteContract();
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
      const amount = parseUnits(stakeAmount, 6); // USDC has 6 decimals
      
      await approveUSDC({
        address: CONTRACT_ADDRESSES.MockUSDC as `0x${string}`,
        abi: MOCK_USDC_ABI,
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
      const amount = parseUnits(stakeAmount, 6);
      
      await stakeAndVote({
        address: CONTRACT_ADDRESSES.DebateContractV2 as `0x${string}`,
        abi: DEBATE_CONTRACT_V2_ABI,
        functionName: 'stakeAndVote',
        args: [BigInt(debateId), BigInt(selectedOption), amount],
      });
      
      onStakeSuccess();
    } catch (error) {
      console.error('Staking failed:', error);
    } finally {
      setIsStaking(false);
    }
  };

  const handleFaucet = async () => {
    try {
      await approveUSDC({
        address: CONTRACT_ADDRESSES.MockUSDC as `0x${string}`,
        abi: MOCK_USDC_ABI,
        functionName: 'faucet',
        args: [],
      });
    } catch (error) {
      console.error('Faucet failed:', error);
    }
  };

  return (
    <div className="staking-interface">
      <h3>💰 Stake USDC & Vote</h3>
      
      <div className="faucet-section">
        <p>Need USDC for testing? Get some from the faucet:</p>
        <button 
          onClick={handleFaucet}
          disabled={isApprovingTx}
          className="faucet-button"
        >
          {isApprovingTx ? 'Getting USDC...' : 'Get 1000 USDC'}
        </button>
      </div>

      <div className="staking-form">
        <div className="option-selection">
          <label>Choose your option:</label>
          <div className="options-grid">
            {options.map((option, index) => (
              <label key={index} className="option-radio">
                <input
                  type="radio"
                  name="option"
                  value={index}
                  checked={selectedOption === index}
                  onChange={(e) => setSelectedOption(Number(e.target.value))}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="amount-selection">
          <label htmlFor="stakeAmount">Stake Amount (USDC):</label>
          <input
            id="stakeAmount"
            type="number"
            min="10"
            step="1"
            value={stakeAmount}
            onChange={(e) => setStakeAmount(e.target.value)}
            placeholder="Minimum 10 USDC"
          />
        </div>

        <div className="staking-actions">
          <button
            onClick={handleApprove}
            disabled={isApproving || isApprovingTx || !stakeAmount}
            className="approve-button"
          >
            {isApproving || isApprovingTx ? 'Approving...' : 'Approve USDC'}
          </button>
          
          <button
            onClick={handleStakeAndVote}
            disabled={isStaking || isStakingTx || !approveHash}
            className="stake-button"
          >
            {isStaking || isStakingTx ? 'Staking...' : 'Stake & Vote'}
          </button>
        </div>
      </div>

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

        .faucet-section {
          background: rgba(0, 255, 0, 0.1);
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 20px;
          border: 1px solid rgba(0, 255, 0, 0.3);
        }

        .faucet-section p {
          margin: 0 0 10px 0;
          color: #90EE90;
        }

        .faucet-button {
          background: linear-gradient(135deg, #00ff00, #00cc00);
          color: #000;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .faucet-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 255, 0, 0.3);
        }

        .faucet-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .staking-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .option-selection label {
          display: block;
          margin-bottom: 10px;
          color: #fff;
          font-weight: bold;
        }

        .options-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 10px;
        }

        .option-radio {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          border: 2px solid transparent;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .option-radio:hover {
          background: rgba(255, 255, 255, 0.15);
        }

        .option-radio input[type="radio"] {
          margin: 0;
        }

        .option-radio input[type="radio"]:checked + span {
          color: #00ff88;
          font-weight: bold;
        }

        .option-radio:has(input[type="radio"]:checked) {
          border-color: #00ff88;
          background: rgba(0, 255, 136, 0.1);
        }

        .amount-selection {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .amount-selection label {
          color: #fff;
          font-weight: bold;
        }

        .amount-selection input {
          padding: 12px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
          font-size: 16px;
        }

        .amount-selection input::placeholder {
          color: rgba(255, 255, 255, 0.6);
        }

        .staking-actions {
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
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

        @media (max-width: 768px) {
          .staking-actions {
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
