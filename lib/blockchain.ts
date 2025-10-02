import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { baseSepolia, base, sepolia } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'Debate App',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'your-project-id',
  chains: [sepolia, baseSepolia, base],
  ssr: true,
});

// Contract addresses - Updated with deployed addresses on Ethereum Sepolia
export const CONTRACT_ADDRESSES = {
  // V2 Contracts (Ethereum Sepolia)
  DebateToken: '0x6B89494D4a96f4D16D294c4afa3583A076f51397',
  MockUSDC: '0x5Cbd5C4e3ab02254dF6B104A7C842e7C3e60eEF0',
  DebateContractV2: '0x4e43B6B6e6605B43b3287FDfdA0cA32dFf5eE001',
  
  // Legacy V1 Contracts (for backward compatibility)
  MockUSDC_V1: process.env.NEXT_PUBLIC_MOCK_USDC_ADDRESS || '',
  DebateContract_V1: process.env.NEXT_PUBLIC_DEBATE_CONTRACT_ADDRESS || '',
};

// Network configuration
export const NETWORK_CONFIG = {
  sepolia: {
    chainId: 11155111,
    name: 'Ethereum Sepolia',
    rpcUrl: 'https://ethereum-sepolia.publicnode.com',
    blockExplorer: 'https://sepolia.etherscan.io',
  },
  baseSepolia: {
    chainId: 84532,
    name: 'Base Sepolia',
    rpcUrl: 'https://sepolia.base.org',
    blockExplorer: 'https://sepolia.basescan.org',
  },
  base: {
    chainId: 8453,
    name: 'Base',
    rpcUrl: 'https://mainnet.base.org',
    blockExplorer: 'https://basescan.org',
  },
};

// Contract ABIs - V2 Contracts
export const DEBATE_TOKEN_ABI = [
  // Basic ERC20 functions
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  
  // Staking functions
  "function stake(uint256 amount, uint256 lockPeriod)",
  "function unstake(uint256 index)",
  "function calculateReward(tuple(uint256 amount, uint256 startTime, uint256 lockPeriod, uint256 rewardDebt) stake) view returns (uint256)",
  "function getStakes(address user) view returns (tuple(uint256 amount, uint256 startTime, uint256 lockPeriod, uint256 rewardDebt)[])",
  "function getTotalStakedAmount(address user) view returns (uint256)",
  
  // Admin functions
  "function mint(address to, uint256 amount)",
  "function pause()",
  "function unpause()",
  
  // Events
  "event Staked(address indexed user, uint256 amount, uint256 lockPeriod)",
  "event Unstaked(address indexed user, uint256 amount, uint256 rewards)",
  "event RewardsClaimed(address indexed user, uint256 rewards)",
  "event TokensBurned(address indexed from, uint256 amount)",
] as const;

export const DEBATE_CONTRACT_V2_ABI = [
  // Debate management
  "function createDebate(string title, string description, string[] options, uint256 duration) returns (uint256)",
  "function endDebate(uint256 debateId)",
  "function getDebate(uint256 debateId) view returns (uint256 id, address creator, string title, string description, string[] options, uint256[] stakes, uint256 totalStaked, uint256 startTime, uint256 endTime, bool ended, uint256 winningOption, uint256 platformFeeCollected)",
  
  // Voting and staking
  "function stakeAndVote(uint256 debateId, uint256 optionIndex, uint256 amount)",
  "function claimReward(uint256 debateId)",
  
  // User info
  "function hasUserVoted(uint256 debateId, address user) view returns (bool)",
  "function getUserVote(uint256 debateId, address user) view returns (uint256 stake, uint256 option)",
  "function hasUserClaimedReward(uint256 debateId, address user) view returns (bool)",
  
  // Contract info
  "function getTotalDebates() view returns (uint256)",
  "function getUserActiveDebate(address user) view returns (uint256)",
  "function minStakeAmount() view returns (uint256)",
  "function maxStakeAmount() view returns (uint256)",
  "function debateCreationFee() view returns (uint256)",
  "function platformFeePercent() view returns (uint256)",
  
  // Admin functions
  "function pause()",
  "function unpause()",
  "function setPlatformFeePercentage(uint256 _newPercentage)",
  "function setMinStakeAmount(uint256 _newMinStake)",
  "function setMaxStakeAmount(uint256 _newMaxStake)",
  "function setDebateCreationFee(uint256 _newFee)",
  "function withdrawFees()",
  
  // Events
  "event DebateCreated(uint256 indexed debateId, address indexed creator, string title, uint256 duration)",
  "event StakePlaced(uint256 indexed debateId, address indexed voter, uint256 optionIndex, uint256 amount)",
  "event DebateEnded(uint256 indexed debateId, uint256 winningOption, uint256 totalStaked)",
  "event RewardsDistributed(uint256 indexed debateId, address indexed winner, uint256 amount)",
  "event RewardClaimed(uint256 indexed debateId, address indexed winner, uint256 amount)",
] as const;

// Legacy ABI for backward compatibility
export const MOCK_USDC_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "approve",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "balanceOf",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [
      {
        "internalType": "uint8",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "faucet",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "name",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "transfer",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "transferFrom",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

export const DEBATE_CONTRACT_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_usdcToken",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "debateId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "creator",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "title",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "duration",
        "type": "uint256"
      }
    ],
    "name": "DebateCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "debateId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "voter",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "optionIndex",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "StakePlaced",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "debateId",
        "type": "uint256"
      }
    ],
    "name": "claimReward",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "title",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "description",
        "type": "string"
      },
      {
        "internalType": "string[]",
        "name": "options",
        "type": "string[]"
      },
      {
        "internalType": "uint256",
        "name": "duration",
        "type": "uint256"
      }
    ],
    "name": "createDebate",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "debateId",
        "type": "uint256"
      }
    ],
    "name": "endDebate",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "debateId",
        "type": "uint256"
      }
    ],
    "name": "getDebate",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "creator",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "title",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "description",
        "type": "string"
      },
      {
        "internalType": "string[]",
        "name": "options",
        "type": "string[]"
      },
      {
        "internalType": "uint256[]",
        "name": "stakes",
        "type": "uint256[]"
      },
      {
        "internalType": "uint256",
        "name": "totalStaked",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "startTime",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "endTime",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "ended",
        "type": "bool"
      },
      {
        "internalType": "uint256",
        "name": "winningOption",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "debateId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "getUserVote",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "stake",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "option",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "debateId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "hasUserVoted",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "minStakeAmount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "platformFeePercent",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "debateId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "optionIndex",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "stakeAndVote",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "usdcToken",
    "outputs": [
      {
        "internalType": "contract IERC20",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;
