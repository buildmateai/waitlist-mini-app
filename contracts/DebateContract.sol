// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title DebateContract
 * @dev Smart contract for decentralized debate platform with USDC staking
 * Features: Create debates, stake USDC, vote, automatic reward distribution
 */
contract DebateContract is Ownable, ReentrancyGuard {
    // Events
    event DebateCreated(uint256 indexed debateId, address indexed creator, string title, uint256 duration);
    event StakePlaced(uint256 indexed debateId, address indexed voter, uint256 optionIndex, uint256 amount);
    event DebateEnded(uint256 indexed debateId, uint256 winningOption, uint256 totalStaked);
    event RewardsDistributed(uint256 indexed debateId, address indexed winner, uint256 amount);
    
    // Structs
    struct Debate {
        uint256 id;
        address creator;
        string title;
        string description;
        string[] options;
        uint256[] stakes; // Stakes for each option
        uint256 totalStaked;
        uint256 startTime;
        uint256 endTime;
        bool ended;
        uint256 winningOption;
        mapping(address => bool) hasVoted;
        mapping(address => uint256) userStakes;
        mapping(address => uint256) userOption;
    }
    
    struct UserReward {
        address user;
        uint256 amount;
        bool claimed;
    }
    
    // State variables
    uint256 private _debateIds = 0;
    IERC20 public usdcToken;
    uint256 public platformFeePercent = 5; // 5% platform fee
    uint256 public minStakeAmount = 10 * 10**6; // 10 USDC minimum
    
    mapping(uint256 => Debate) public debates;
    mapping(uint256 => UserReward[]) public debateRewards;
    
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
    
    constructor(address _usdcToken) Ownable(msg.sender) {
        usdcToken = IERC20(_usdcToken);
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
    ) external returns (uint256) {
        require(options.length >= 2, "At least 2 options required");
        require(duration >= 3600 && duration <= 604800, "Duration must be 1 hour to 1 week");
        
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
            debate.options.push(options[i]);
            debate.stakes.push(0);
        }
        
        emit DebateCreated(debateId, msg.sender, title, duration);
        return debateId;
    }
    
    /**
     * @dev Stake USDC and vote on a debate option
     * @param debateId ID of the debate
     * @param optionIndex Index of the option to vote for
     * @param amount Amount of USDC to stake
     */
    function stakeAndVote(
        uint256 debateId,
        uint256 optionIndex,
        uint256 amount
    ) external nonReentrant debateExists(debateId) debateActive(debateId) {
        require(amount >= minStakeAmount, "Stake amount too low");
        require(optionIndex < debates[debateId].options.length, "Invalid option");
        require(!debates[debateId].hasVoted[msg.sender], "Already voted");
        
        // Transfer USDC from user to contract
        require(usdcToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        
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
        
        emit DebateEnded(debateId, winningOption, debate.totalStaked);
        
        // Calculate and distribute rewards
        _distributeRewards(debateId);
    }
    
    /**
     * @dev Internal function to distribute rewards to winners
     * @param debateId ID of the debate
     */
    function _distributeRewards(uint256 debateId) internal {
        Debate storage debate = debates[debateId];
        uint256 winningOption = debate.winningOption;
        uint256 totalWinningStakes = debate.stakes[winningOption];
        
        if (totalWinningStakes == 0) {
            return; // No winners
        }
        
        uint256 platformFee = (debate.totalStaked * platformFeePercent) / 100;
        uint256 rewardPool = debate.totalStaked - platformFee;
        
        // Calculate rewards for each winner
        // This is a simplified version - in production, you'd want to optimize gas usage
        for (uint256 i = 0; i < debate.options.length; i++) {
            if (i == winningOption) {
                // Winners get proportional rewards
                uint256 optionStakes = debate.stakes[i];
                if (optionStakes > 0) {
                    uint256 optionReward = (rewardPool * optionStakes) / totalWinningStakes;
                    
                    // Store reward for claiming (to avoid gas limit issues)
                    debateRewards[debateId].push(UserReward({
                        user: address(0), // Will be filled by frontend
                        amount: optionReward,
                        claimed: false
                    }));
                }
            }
        }
    }
    
    /**
     * @dev Claim rewards for a specific debate
     * @param debateId ID of the debate
     */
    function claimReward(uint256 debateId) external nonReentrant debateExists(debateId) debateEnded(debateId) {
        Debate storage debate = debates[debateId];
        require(debate.hasVoted[msg.sender], "Did not participate");
        require(debate.userOption[msg.sender] == debate.winningOption, "Not a winner");
        
        uint256 userStake = debate.userStakes[msg.sender];
        uint256 totalWinningStakes = debate.stakes[debate.winningOption];
        uint256 platformFee = (debate.totalStaked * platformFeePercent) / 100;
        uint256 rewardPool = debate.totalStaked - platformFee;
        
        uint256 userReward = (rewardPool * userStake) / totalWinningStakes;
        
        require(usdcToken.transfer(msg.sender, userReward), "Reward transfer failed");
        
        emit RewardsDistributed(debateId, msg.sender, userReward);
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
        uint256 winningOption
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
            debate.winningOption
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
        uint256 option
    ) {
        return (debates[debateId].userStakes[user], debates[debateId].userOption[user]);
    }
    
    /**
     * @dev Withdraw platform fees (owner only)
     */
    function withdrawFees() external onlyOwner {
        uint256 balance = usdcToken.balanceOf(address(this));
        require(balance > 0, "No fees to withdraw");
        require(usdcToken.transfer(owner(), balance), "Transfer failed");
    }
    
    /**
     * @dev Update platform fee percentage (owner only)
     * @param newFeePercent New fee percentage (0-100)
     */
    function updatePlatformFee(uint256 newFeePercent) external onlyOwner {
        require(newFeePercent <= 20, "Fee too high"); // Max 20%
        platformFeePercent = newFeePercent;
    }
    
    /**
     * @dev Update minimum stake amount (owner only)
     * @param newMinStake New minimum stake amount
     */
    function updateMinStake(uint256 newMinStake) external onlyOwner {
        minStakeAmount = newMinStake;
    }
}
