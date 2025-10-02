// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title DebateToken
 * @dev Native token for the Debate platform
 * Features: Staking rewards, governance, deflationary mechanics
 */
contract DebateToken is ERC20, ERC20Burnable, ERC20Pausable, Ownable, ReentrancyGuard {
    uint8 private constant _DECIMALS = 18;
    uint256 private constant _INITIAL_SUPPLY = 100_000_000 * 10**_DECIMALS; // 100M tokens
    
    // Tokenomics
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**_DECIMALS; // 1B max supply
    uint256 public constant STAKING_REWARD_RATE = 5; // 5% APY for staking
    uint256 public constant BURN_RATE = 2; // 2% burn on transfers
    
    // Staking system
    struct Stake {
        uint256 amount;
        uint256 timestamp;
        uint256 lockPeriod;
        bool isActive;
    }
    
    mapping(address => Stake[]) public userStakes;
    mapping(address => uint256) public totalStaked;
    uint256 public totalStakedSupply;
    
    // Events
    event TokensStaked(address indexed user, uint256 amount, uint256 lockPeriod);
    event TokensUnstaked(address indexed user, uint256 amount, uint256 reward);
    event TokensBurned(address indexed from, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 amount);
    
    constructor() ERC20("Debate Token", "DEBATE") Ownable(msg.sender) {
        _mint(msg.sender, _INITIAL_SUPPLY);
    }
    
    function decimals() public pure override returns (uint8) {
        return _DECIMALS;
    }
    
    /**
     * @dev Stake tokens for rewards
     * @param amount Amount to stake
     * @param lockPeriod Lock period in seconds (0 = no lock)
     */
    function stake(uint256 amount, uint256 lockPeriod) external nonReentrant whenNotPaused {
        require(amount > 0, "Amount must be greater than 0");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        
        // Transfer tokens to contract
        _transfer(msg.sender, address(this), amount);
        
        // Create stake
        userStakes[msg.sender].push(Stake({
            amount: amount,
            timestamp: block.timestamp,
            lockPeriod: lockPeriod,
            isActive: true
        }));
        
        totalStaked[msg.sender] += amount;
        totalStakedSupply += amount;
        
        emit TokensStaked(msg.sender, amount, lockPeriod);
    }
    
    /**
     * @dev Unstake tokens and claim rewards
     * @param stakeIndex Index of the stake to unstake
     */
    function unstake(uint256 stakeIndex) external nonReentrant {
        require(stakeIndex < userStakes[msg.sender].length, "Invalid stake index");
        
        Stake storage userStake = userStakes[msg.sender][stakeIndex];
        require(userStake.isActive, "Stake not active");
        require(
            block.timestamp >= userStake.timestamp + userStake.lockPeriod,
            "Stake still locked"
        );
        
        uint256 stakedAmount = userStake.amount;
        uint256 reward = calculateReward(userStake);
        uint256 totalAmount = stakedAmount + reward;
        
        // Mark stake as inactive
        userStake.isActive = false;
        
        // Update totals
        totalStaked[msg.sender] -= stakedAmount;
        totalStakedSupply -= stakedAmount;
        
        // Mint rewards if needed
        if (reward > 0 && totalSupply() + reward <= MAX_SUPPLY) {
            _mint(address(this), reward);
        }
        
        // Transfer tokens back
        _transfer(address(this), msg.sender, totalAmount);
        
        emit TokensUnstaked(msg.sender, stakedAmount, reward);
    }
    
    /**
     * @dev Calculate staking reward
     * @param stake Stake information
     * @return reward Calculated reward
     */
    function calculateReward(Stake memory stake) public view returns (uint256) {
        if (!stake.isActive) return 0;
        
        uint256 timeStaked = block.timestamp - stake.timestamp;
        uint256 annualReward = (stake.amount * STAKING_REWARD_RATE) / 100;
        uint256 reward = (annualReward * timeStaked) / 365 days;
        
        return reward;
    }
    
    /**
     * @dev Get total pending rewards for user
     * @param user User address
     * @return totalRewards Total pending rewards
     */
    function getPendingRewards(address user) external view returns (uint256 totalRewards) {
        Stake[] memory stakes = userStakes[user];
        
        for (uint256 i = 0; i < stakes.length; i++) {
            if (stakes[i].isActive) {
                totalRewards += calculateReward(stakes[i]);
            }
        }
    }
    
    /**
     * @dev Override transfer to include burn mechanism
     */
    function _update(address from, address to, uint256 value) internal override(ERC20, ERC20Pausable) {
        // Apply burn rate on transfers (except minting/burning)
        if (from != address(0) && to != address(0) && from != address(this) && to != address(this)) {
            uint256 burnAmount = (value * BURN_RATE) / 100;
            if (burnAmount > 0) {
                super._update(from, address(0), burnAmount);
                emit TokensBurned(from, burnAmount);
                value -= burnAmount;
            }
        }
        
        super._update(from, to, value);
    }
    
    /**
     * @dev Mint tokens for debate rewards (only owner)
     * @param to Address to mint to
     * @param amount Amount to mint
     */
    function mintDebateReward(address to, uint256 amount) external onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        _mint(to, amount);
    }
    
    /**
     * @dev Emergency pause (only owner)
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause (only owner)
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Get user's active stakes
     * @param user User address
     * @return stakes Array of active stakes
     */
    function getUserStakes(address user) external view returns (Stake[] memory stakes) {
        Stake[] memory allStakes = userStakes[user];
        uint256 activeCount = 0;
        
        // Count active stakes
        for (uint256 i = 0; i < allStakes.length; i++) {
            if (allStakes[i].isActive) {
                activeCount++;
            }
        }
        
        // Create array of active stakes
        stakes = new Stake[](activeCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < allStakes.length; i++) {
            if (allStakes[i].isActive) {
                stakes[index] = allStakes[i];
                index++;
            }
        }
    }
}
