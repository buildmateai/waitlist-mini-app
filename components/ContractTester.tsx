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
  });

  const { data: minStakeAmount } = useReadContract({
    address: CONTRACT_ADDRESSES.DebateContractV2 as `0x${string}`,
    abi: DEBATE_CONTRACT_V2_ABI,
    functionName: 'minStakeAmount',
  });

  const { data: creationFee } = useReadContract({
    address: CONTRACT_ADDRESSES.DebateContractV2 as `0x${string}`,
    abi: DEBATE_CONTRACT_V2_ABI,
    functionName: 'debateCreationFee',
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
        <h3>Create Debate</h3>
        <input
          type="text"
          placeholder="Debate Title"
          value={debateTitle}
          onChange={(e) => setDebateTitle(e.target.value)}
        />
        <textarea
          placeholder="Debate Description"
          value={debateDescription}
          onChange={(e) => setDebateDescription(e.target.value)}
        />
        <div>
          <label>Options:</label>
          {debateOptions.map((option, index) => (
            <input
              key={index}
              type="text"
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
          disabled={debateContractLoading || !debateTitle || !debateDescription}
        >
          {debateContractLoading ? 'Creating...' : 'Create Debate'}
        </button>
      </div>

      {/* Stake and Vote */}
      <div className="stake-vote">
        <h3>Stake and Vote</h3>
        <input
          type="number"
          placeholder="Stake Amount (DEBATE)"
          value={stakeAmount}
          onChange={(e) => setStakeAmount(e.target.value)}
        />
        <select 
          value={selectedOption} 
          onChange={(e) => setSelectedOption(Number(e.target.value))}
        >
          {debateOptions.map((option, index) => (
            <option key={index} value={index}>
              {option}
            </option>
          ))}
        </select>
        <button 
          onClick={() => handleStakeAndVote(1)}
          disabled={debateContractLoading || !stakeAmount}
        >
          {debateContractLoading ? 'Voting...' : 'Stake and Vote'}
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
