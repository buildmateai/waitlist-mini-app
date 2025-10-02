// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./DebateToken.sol";

/**
 * @title DebateContractV2
 * @dev Improved smart contract for decentralized debate platform with native DEBATE token
 * Features: Create debates, stake DEBATE tokens, vote, automatic reward distribution
 */
contract DebateContractV2 is Ownable, ReentrancyGuard, Pausable {
    // Events
    event DebateCreated(uint256 indexed debateId, address indexed creator, string title, uint256 duration);
    event StakePlaced(uint256 indexed debateId, address indexed voter, uint256 optionIndex, uint256 amount);
    event DebateEnded(uint256 indexed debateId, uint256 winningOption, uint256 totalStaked);
    event RewardsDistributed(uint256 indexed debateId, address indexed winner, uint256 amount);
    event RewardClaimed(uint256 indexed debateId, address indexed winner, uint256 amount);
    
    // Structs
    struct Debate {
        uint256 id;
        address creator;
        string title;
        string description;
        string[] options;
        uint256[] stakes;
        uint256 totalStaked;
        uint256 startTime;
        uint256 endTime;
        bool ended;
        uint256 winningOption;
        uint256 platformFeeCollected;
        mapping(address => bool) hasVoted;
        mapping(address => uint256) userStakes;
        mapping(address => uint256) userOption;
        mapping(address => bool) hasClaimedReward;
    }
    
    // State variables
    uint256 private _debateIds = 0;
    DebateToken public debateToken;
    uint256 public platformFeePercent = 5; // 5% platform fee
    uint256 public minStakeAmount = 100 * 10**18; // 100 DEBATE minimum
    uint256 public maxStakeAmount = 10000 * 10**18; // 10,000 DEBATE maximum
    uint256 public debateCreationFee = 50 * 10**18; // 50 DEBATE to create debate
    
    mapping(uint256 => Debate) public debates;
    mapping(address => uint256) public userActiveDebates; // Track active debates per user
    
    // Modifiers
    modifier debateExists(uint256 debateId) {
        require(debateId <= _debateIds && debateId > 0, "Debate does not exist");
        _;
    }
    
    modifier debateActive(uint256 debateId) {
        require(!debates[debateId].ended && block.timestamp < debates[debateId].endTime, "Debate not active");
        _;
    }
    
    modifier debateEnded(uint256 debateId) {
        require(debates[debateId].ended || block.timestamp >= debates[debateId].endTime, "Debate still active");
        _;
    }
    
    modifier onlyOneActiveDebate() {
        require(userActiveDebates[msg.sender] == 0, "User already has an active debate");
        _;
    }
    
    constructor(address _debateToken) Ownable(msg.sender) {
        debateToken = DebateToken(_debateToken);
    }
    
    /**
     * @dev Create a new debate
     * @param title Debate title
     * @param description Debate description
     * @param options Array of voting options
     * @param duration Duration in seconds
     */
    function createDebate(
        string memory title,
        string memory description,
        string[] memory options,
        uint256 duration
    ) external nonReentrant whenNotPaused onlyOneActiveDebate returns (uint256) {
        require(bytes(title).length > 0, "Title cannot be empty");
        require(bytes(description).length > 0, "Description cannot be empty");
        require(options.length >= 2 && options.length <= 10, "2-10 options required");
        require(duration >= 3600 && duration <= 604800, "Duration must be 1 hour to 1 week");
        
        // Charge creation fee
        require(debateToken.transferFrom(msg.sender, address(this), debateCreationFee), "Creation fee transfer failed");
        
        _debateIds++;
        uint256 debateId = _debateIds;
        
        Debate storage debate = debates[debateId];
        debate.id = debateId;
        debate.creator = msg.sender;
        debate.title = title;
        debate.description = description;
        debate.startTime = block.timestamp;
        debate.endTime = block.timestamp + duration;
        debate.ended = false;
        
        // Initialize options and stakes arrays
        for (uint256 i = 0; i < options.length; i++) {
            require(bytes(options[i]).length > 0, "Option cannot be empty");
            debate.options.push(options[i]);
            debate.stakes.push(0);
        }
        
        // Track user's active debate
        userActiveDebates[msg.sender] = debateId;
        
        emit DebateCreated(debateId, msg.sender, title, duration);
        return debateId;
    }
    
    /**
     * @dev Stake DEBATE tokens and vote on a debate option
     * @param debateId ID of the debate
     * @param optionIndex Index of the option to vote for
     * @param amount Amount of DEBATE tokens to stake
     */
    function stakeAndVote(
        uint256 debateId,
        uint256 optionIndex,
        uint256 amount
    ) external nonReentrant whenNotPaused debateExists(debateId) debateActive(debateId) {
        require(amount >= minStakeAmount && amount <= maxStakeAmount, "Invalid stake amount");
        require(optionIndex < debates[debateId].options.length, "Invalid option");
        require(!debates[debateId].hasVoted[msg.sender], "Already voted");
        
        // Transfer tokens from user to contract
        require(debateToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        
        // Update debate state
        debates[debateId].hasVoted[msg.sender] = true;
        debates[debateId].userStakes[msg.sender] = amount;
        debates[debateId].userOption[msg.sender] = optionIndex;
        debates[debateId].stakes[optionIndex] += amount;
        debates[debateId].totalStaked += amount;
        
        emit StakePlaced(debateId, msg.sender, optionIndex, amount);
    }
    
    /**
     * @dev End a debate and determine winner
     * @param debateId ID of the debate to end
     */
    function endDebate(uint256 debateId) external debateExists(debateId) {
        Debate storage debate = debates[debateId];
        require(block.timestamp >= debate.endTime, "Debate not yet ended");
        require(!debate.ended, "Debate already ended");
        require(msg.sender == debate.creator || msg.sender == owner(), "Only creator or owner can end");
        
        debate.ended = true;
        
        // Find winning option
        uint256 maxStakes = 0;
        uint256 winningOption = 0;
        
        for (uint256 i = 0; i < debate.stakes.length; i++) {
            if (debate.stakes[i] > maxStakes) {
                maxStakes = debate.stakes[i];
                winningOption = i;
            }
        }
        
        debate.winningOption = winningOption;
        
        // Calculate platform fee
        uint256 platformFee = (debate.totalStaked * platformFeePercent) / 100;
        debate.platformFeeCollected = platformFee;
        
        // Clear user's active debate
        userActiveDebates[debate.creator] = 0;
        
        emit DebateEnded(debateId, winningOption, debate.totalStaked);
    }
    
    /**
     * @dev Claim rewards for a specific debate
     * @param debateId ID of the debate
     */
    function claimReward(uint256 debateId) external nonReentrant debateExists(debateId) debateEnded(debateId) {
        Debate storage debate = debates[debateId];
        require(debate.hasVoted[msg.sender], "Did not participate");
        require(debate.userOption[msg.sender] == debate.winningOption, "Not a winner");
        require(!debate.hasClaimedReward[msg.sender], "Already claimed");
        
        uint256 userStake = debate.userStakes[msg.sender];
        uint256 totalWinningStakes = debate.stakes[debate.winningOption];
        uint256 platformFee = debate.platformFeeCollected;
        uint256 rewardPool = debate.totalStaked - platformFee;
        
        // Calculate user's reward
        uint256 userReward = (rewardPool * userStake) / totalWinningStakes;
        
        // Mark as claimed
        debate.hasClaimedReward[msg.sender] = true;
        
        // Transfer reward
        require(debateToken.transfer(msg.sender, userReward), "Reward transfer failed");
        
        emit RewardClaimed(debateId, msg.sender, userReward);
    }
    
    /**
     * @dev Get debate information
     * @param debateId ID of the debate
     */
    function getDebate(uint256 debateId) external view debateExists(debateId) returns (
        uint256 id,
        address creator,
        string memory title,
        string memory description,
        string[] memory options,
        uint256[] memory stakes,
        uint256 totalStaked,
        uint256 startTime,
        uint256 endTime,
        bool ended,
        uint256 winningOption,
        uint256 platformFeeCollected
    ) {
        Debate storage debate = debates[debateId];
        return (
            debate.id,
            debate.creator,
            debate.title,
            debate.description,
            debate.options,
            debate.stakes,
            debate.totalStaked,
            debate.startTime,
            debate.endTime,
            debate.ended,
            debate.winningOption,
            debate.platformFeeCollected
        );
    }
    
    /**
     * @dev Check if user has voted on a debate
     * @param debateId ID of the debate
     * @param user User address
     */
    function hasUserVoted(uint256 debateId, address user) external view debateExists(debateId) returns (bool) {
        return debates[debateId].hasVoted[user];
    }
    
    /**
     * @dev Get user's stake and option for a debate
     * @param debateId ID of the debate
     * @param user User address
     */
    function getUserVote(uint256 debateId, address user) external view debateExists(debateId) returns (
        uint256 stake,
        uint256 option,
        bool hasClaimed
    ) {
        Debate storage debate = debates[debateId];
        return (
            debate.userStakes[user],
            debate.userOption[user],
            debate.hasClaimedReward[user]
        );
    }
    
    /**
     * @dev Calculate user's potential reward
     * @param debateId ID of the debate
     * @param user User address
     */
    function calculateUserReward(uint256 debateId, address user) external view debateExists(debateId) returns (uint256) {
        Debate storage debate = debates[debateId];
        
        if (!debate.hasVoted[user] || debate.userOption[user] != debate.winningOption) {
            return 0;
        }
        
        uint256 userStake = debate.userStakes[user];
        uint256 totalWinningStakes = debate.stakes[debate.winningOption];
        uint256 platformFee = debate.platformFeeCollected;
        uint256 rewardPool = debate.totalStaked - platformFee;
        
        return (rewardPool * userStake) / totalWinningStakes;
    }
    
    /**
     * @dev Withdraw platform fees (owner only)
     */
    function withdrawFees() external onlyOwner {
        uint256 balance = debateToken.balanceOf(address(this));
        require(balance > 0, "No fees to withdraw");
        require(debateToken.transfer(owner(), balance), "Transfer failed");
    }
    
    /**
     * @dev Update platform fee percentage (owner only)
     * @param newFeePercent New fee percentage (0-20)
     */
    function updatePlatformFee(uint256 newFeePercent) external onlyOwner {
        require(newFeePercent <= 20, "Fee too high");
        platformFeePercent = newFeePercent;
    }
    
    /**
     * @dev Update minimum stake amount (owner only)
     * @param newMinStake New minimum stake amount
     */
    function updateMinStake(uint256 newMinStake) external onlyOwner {
        require(newMinStake > 0, "Min stake must be positive");
        minStakeAmount = newMinStake;
    }
    
    /**
     * @dev Update maximum stake amount (owner only)
     * @param newMaxStake New maximum stake amount
     */
    function updateMaxStake(uint256 newMaxStake) external onlyOwner {
        require(newMaxStake > minStakeAmount, "Max stake must be greater than min");
        maxStakeAmount = newMaxStake;
    }
    
    /**
     * @dev Update debate creation fee (owner only)
     * @param newFee New creation fee
     */
    function updateCreationFee(uint256 newFee) external onlyOwner {
        debateCreationFee = newFee;
    }
    
    /**
     * @dev Emergency pause (owner only)
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause (owner only)
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Get total number of debates
     */
    function getTotalDebates() external view returns (uint256) {
        return _debateIds;
    }
    
    /**
     * @dev Get user's active debate ID
     * @param user User address
     */
    function getUserActiveDebate(address user) external view returns (uint256) {
        return userActiveDebates[user];
    }
}
