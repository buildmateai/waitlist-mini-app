'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useBalance, useReadContract } from 'wagmi';
import { CONTRACT_ADDRESSES, DEBATE_TOKEN_ABI, MOCK_USDC_ABI } from '@/lib/blockchain';
import { formatUnits } from 'viem';

export function WalletConnection() {
  const { address, isConnected, chainId } = useAccount();
  
  // ETH Balance
  const { data: ethBalance } = useBalance({
    address,
  });

  // DEBATE Token Balance
  const { data: debateTokenBalance } = useReadContract({
    address: CONTRACT_ADDRESSES.DebateToken as `0x${string}`,
    abi: DEBATE_TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  // MockUSDC Balance
  const { data: usdcBalance } = useReadContract({
    address: CONTRACT_ADDRESSES.MockUSDC as `0x${string}`,
    abi: MOCK_USDC_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  // DEBATE Token Symbol
  const { data: debateTokenSymbol } = useReadContract({
    address: CONTRACT_ADDRESSES.DebateToken as `0x${string}`,
    abi: DEBATE_TOKEN_ABI,
    functionName: 'symbol',
  });

  // MockUSDC Symbol
  const { data: usdcSymbol } = useReadContract({
    address: CONTRACT_ADDRESSES.MockUSDC as `0x${string}`,
    abi: MOCK_USDC_ABI,
    functionName: 'symbol',
  });

  return (
    <div className="wallet-connection">
      <ConnectButton />
      
      {isConnected && (
        <div className="wallet-info">
          <p>Connected: {address}</p>
          <p>Network: {chainId === 11155111 ? 'Ethereum Sepolia' : `Chain ${chainId}`}</p>
          
          {ethBalance && (
            <p>
              ETH Balance: {formatUnits(ethBalance.value, ethBalance.decimals)} {ethBalance.symbol}
            </p>
          )}
          
          {(debateTokenBalance as any) && (debateTokenSymbol as any) && (
            <p>
              {String(debateTokenSymbol)} Balance: {formatUnits(debateTokenBalance as bigint, 18)} {String(debateTokenSymbol)}
            </p>
          )}
          
          {(usdcBalance as any) && (usdcSymbol as any) && (
            <p>
              {String(usdcSymbol)} Balance: {formatUnits(usdcBalance as bigint, 6)} {String(usdcSymbol)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
