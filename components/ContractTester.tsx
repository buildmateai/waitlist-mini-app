'use client';

import { useState } from 'react';
import { useAccount, useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESSES, DEBATE_TOKEN_ABI, MOCK_USDC_ABI, DEBATE_CONTRACT_V2_ABI } from '@/lib/blockchain';
import { formatUnits, parseUnits } from 'viem';

export function ContractTester() {
  const { address, isConnected } = useAccount();
  const [debateTitle, setDebateTitle] = useState('');
  const [debateDescription, setDebateDescription] = useState('');
  const [debateOptions, setDebateOptions] = useState(['Option 1', 'Option 2']);
  const [stakeAmount, setStakeAmount] = useState('100');
  const [selectedOption, setSelectedOption] = useState(0);

  // Contract interactions
  const { writeContract: writeDebateToken, data: debateTokenTxHash } = useWriteContract();
  const { writeContract: writeMockUSDC, data: mockUSDCTxHash } = useWriteContract();
  const { writeContract: writeDebateContract, data: debateContractTxHash } = useWriteContract();

  // Transaction receipts
  const { isLoading: debateTokenLoading } = useWaitForTransactionReceipt({
    hash: debateTokenTxHash,
  });
  const { isLoading: mockUSDCLoading } = useWaitForTransactionReceipt({
    hash: mockUSDCTxHash,
  });
  const { isLoading: debateContractLoading } = useWaitForTransactionReceipt({
    hash: debateContractTxHash,
  });

  // Read contract data
  const { data: totalDebates } = useReadContract({
    address: CONTRACT_ADDRESSES.DebateContractV2 as `0x${string}`,
    abi: DEBATE_CONTRACT_V2_ABI,
    functionName: 'getTotalDebates',
    query: {
      enabled: !!CONTRACT_ADDRESSES.DebateContractV2,
    },
  });

  const { data: minStakeAmount } = useReadContract({
    address: CONTRACT_ADDRESSES.DebateContractV2 as `0x${string}`,
    abi: DEBATE_CONTRACT_V2_ABI,
    functionName: 'minStakeAmount',
    query: {
      enabled: !!CONTRACT_ADDRESSES.DebateContractV2,
    },
  });

  const { data: creationFee } = useReadContract({
    address: CONTRACT_ADDRESSES.DebateContractV2 as `0x${string}`,
    abi: DEBATE_CONTRACT_V2_ABI,
    functionName: 'debateCreationFee',
    query: {
      enabled: !!CONTRACT_ADDRESSES.DebateContractV2,
    },
  });

  // Functions
  const handleFaucetUSDC = async () => {
    try {
      await writeMockUSDC({
        address: CONTRACT_ADDRESSES.MockUSDC as `0x${string}`,
        abi: MOCK_USDC_ABI,
        functionName: 'faucet',
      });
    } catch (error) {
      console.error('Faucet error:', error);
    }
  };

  const handleMintDebateTokens = async () => {
    try {
      await writeDebateToken({
        address: CONTRACT_ADDRESSES.DebateToken as `0x${string}`,
        abi: DEBATE_TOKEN_ABI,
        functionName: 'mint',
        args: [address!, parseUnits('1000', 18)], // Mint 1000 DEBATE tokens
      });
    } catch (error) {
      console.error('Mint error:', error);
    }
  };

  const handleCreateDebate = async () => {
    if (!debateTitle || !debateDescription) return;
    
    try {
      await writeDebateContract({
        address: CONTRACT_ADDRESSES.DebateContractV2 as `0x${string}`,
        abi: DEBATE_CONTRACT_V2_ABI,
        functionName: 'createDebate',
        args: [
          debateTitle,
          debateDescription,
          debateOptions,
          3600 // 1 hour duration
        ],
      });
    } catch (error) {
      console.error('Create debate error:', error);
    }
  };

  const handleStakeAndVote = async (debateId: number) => {
    try {
      await writeDebateContract({
        address: CONTRACT_ADDRESSES.DebateContractV2 as `0x${string}`,
        abi: DEBATE_CONTRACT_V2_ABI,
        functionName: 'stakeAndVote',
        args: [
          BigInt(debateId),
          BigInt(selectedOption),
          parseUnits(stakeAmount, 18)
        ],
      });
    } catch (error) {
      console.error('Stake and vote error:', error);
    }
  };

  if (!isConnected) {
    return (
      <div className="contract-tester">
        <h2>Contract Tester</h2>
        <p>Please connect your wallet to test contracts</p>
      </div>
    );
  }

  return (
    <div className="contract-tester">
      <h2>Contract Tester</h2>
      
      {/* Contract Info */}
      <div className="contract-info">
        <h3>Contract Information</h3>
        <p>Total Debates: {totalDebates?.toString() || '0'}</p>
        <p>Min Stake Amount: {minStakeAmount ? formatUnits(minStakeAmount as bigint, 18) : '0'} DEBATE</p>
        <p>Creation Fee: {creationFee ? formatUnits(creationFee as bigint, 18) : '0'} DEBATE</p>
      </div>

      {/* Token Actions */}
      <div className="token-actions">
        <h3>Token Actions</h3>
        <button 
          onClick={handleFaucetUSDC}
          disabled={mockUSDCLoading}
        >
          {mockUSDCLoading ? 'Loading...' : 'Get MockUSDC (Faucet)'}
        </button>
        
        <button 
          onClick={handleMintDebateTokens}
          disabled={debateTokenLoading}
        >
          {debateTokenLoading ? 'Loading...' : 'Mint 1000 DEBATE Tokens'}
        </button>
      </div>

      {/* Create Debate */}
      <div className="create-debate">
        <h3>Create New Debate</h3>
        <div className="cost-info">
          <p>💰 <strong>Creation Cost:</strong> {creationFee ? formatUnits(creationFee as bigint, 18) : '50'} DEBATE tokens</p>
          <p>⏱️ <strong>Duration:</strong> 1 hour</p>
        </div>
        
        <input
          type="text"
          placeholder="Debate Title (e.g., Is AI good for humanity?)"
          value={debateTitle}
          onChange={(e) => setDebateTitle(e.target.value)}
        />
        <textarea
          placeholder="Debate Description (provide context and details...)"
          value={debateDescription}
          onChange={(e) => setDebateDescription(e.target.value)}
        />
        <div className="options-section">
          <label>Voting Options:</label>
          {debateOptions.map((option, index) => (
            <input
              key={index}
              type="text"
              placeholder={`Option ${index + 1} (e.g., ${index === 0 ? 'Yes, AI is beneficial' : 'No, AI is dangerous'})`}
              value={option}
              onChange={(e) => {
                const newOptions = [...debateOptions];
                newOptions[index] = e.target.value;
                setDebateOptions(newOptions);
              }}
            />
          ))}
        </div>
        <button 
          onClick={handleCreateDebate}
          disabled={debateContractLoading || !debateTitle || !debateDescription || !debateOptions[0] || !debateOptions[1]}
          className="create-button"
        >
          {debateContractLoading ? 'Creating Debate...' : `Create Debate (${creationFee ? formatUnits(creationFee as bigint, 18) : '50'} DEBATE)`}
        </button>
        {debateContractTxHash && (
          <div className="tx-info">
            <p>✅ Transaction sent!</p>
            <a href={`https://sepolia.etherscan.io/tx/${debateContractTxHash}`} target="_blank" rel="noopener noreferrer">
              View on Etherscan: {debateContractTxHash.slice(0, 10)}...
            </a>
          </div>
        )}
      </div>

      {/* Stake and Vote */}
      <div className="stake-vote">
        <h3>Stake and Vote in Existing Debate</h3>
        <div className="stake-info">
          <p>🎯 <strong>Min Stake:</strong> {minStakeAmount ? formatUnits(minStakeAmount as bigint, 18) : '10'} DEBATE</p>
          <p>💡 <strong>Tip:</strong> Higher stakes = more influence on the outcome</p>
        </div>
        
        <div className="stake-input">
          <label>Stake Amount (DEBATE):</label>
          <input
            type="number"
            placeholder={`Min: ${minStakeAmount ? formatUnits(minStakeAmount as bigint, 18) : '10'}`}
            value={stakeAmount}
            onChange={(e) => setStakeAmount(e.target.value)}
            min={minStakeAmount ? formatUnits(minStakeAmount as bigint, 18) : '10'}
          />
          <div className="stake-slider">
            <input
              type="range"
              min={minStakeAmount ? formatUnits(minStakeAmount as bigint, 18) : '10'}
              max="1000"
              step="10"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
            />
            <div className="stake-labels">
              <span>{minStakeAmount ? formatUnits(minStakeAmount as bigint, 18) : '10'}</span>
              <span>1000</span>
            </div>
          </div>
        </div>
        
        <div className="vote-options">
          <label>Choose your option:</label>
          <div className="option-buttons">
            {debateOptions.map((option, index) => (
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
        
        <button 
          onClick={() => handleStakeAndVote(1)}
          disabled={debateContractLoading || !stakeAmount || Number(stakeAmount) < Number(minStakeAmount ? formatUnits(minStakeAmount as bigint, 18) : '10')}
          className="vote-button"
        >
          {debateContractLoading ? 'Voting...' : `Stake ${stakeAmount} DEBATE and Vote`}
        </button>
      </div>

      {/* Transaction Status */}
      {(debateTokenTxHash || mockUSDCTxHash || debateContractTxHash) && (
        <div className="transaction-status">
          <h3>Transaction Status</h3>
          {debateTokenTxHash && (
            <p>DebateToken TX: {debateTokenTxHash}</p>
          )}
          {mockUSDCTxHash && (
            <p>MockUSDC TX: {mockUSDCTxHash}</p>
          )}
          {debateContractTxHash && (
            <p>DebateContract TX: {debateContractTxHash}</p>
          )}
        </div>
      )}
    </div>
  );
}
