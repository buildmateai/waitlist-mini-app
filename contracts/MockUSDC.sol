// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title MockUSDC
 * @dev Improved Mock USDC token for testing purposes on Base Sepolia
 * This contract simulates USDC functionality for the debate platform
 */
contract MockUSDC is ERC20, Ownable, ReentrancyGuard {
    uint8 private _decimals;
    uint256 public constant MAX_FAUCET_AMOUNT = 1000 * 10**6; // 1000 USDC max per faucet call
    uint256 public constant FAUCET_COOLDOWN = 1 hours; // 1 hour cooldown between faucet calls
    
    mapping(address => uint256) public lastFaucetTime;
    mapping(address => uint256) public totalFaucetClaimed;
    uint256 public totalFaucetSupply = 1000000 * 10**6; // 1M USDC total for faucet
    
    event FaucetUsed(address indexed user, uint256 amount);
    event TokensBurned(address indexed from, uint256 amount);
    
    constructor() ERC20("Mock USD Coin", "mUSDC") Ownable(msg.sender) {
        _decimals = 6; // USDC has 6 decimals
        // Mint initial supply for testing
        _mint(msg.sender, 1000000 * 10**_decimals); // 1M tokens
    }
    
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }
    
    /**
     * @dev Mint tokens for testing purposes
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
    
    /**
     * @dev Improved faucet function with cooldown and limits
     * Anyone can call this to get USDC for testing (with restrictions)
     */
    function faucet() external nonReentrant {
        require(block.timestamp >= lastFaucetTime[msg.sender] + FAUCET_COOLDOWN, "Faucet cooldown active");
        require(totalFaucetClaimed[msg.sender] < MAX_FAUCET_AMOUNT, "Max faucet amount reached");
        
        uint256 amount = MAX_FAUCET_AMOUNT;
        require(totalSupply() + amount <= totalFaucetSupply, "Faucet supply exhausted");
        
        lastFaucetTime[msg.sender] = block.timestamp;
        totalFaucetClaimed[msg.sender] += amount;
        
        _mint(msg.sender, amount);
        emit FaucetUsed(msg.sender, amount);
    }
    
    /**
     * @dev Burn tokens (for testing purposes)
     * @param amount Amount of tokens to burn
     */
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
        emit TokensBurned(msg.sender, amount);
    }
    
    /**
     * @dev Burn tokens from specific address (owner only)
     * @param from Address to burn from
     * @param amount Amount of tokens to burn
     */
    function burnFrom(address from, uint256 amount) external onlyOwner {
        _burn(from, amount);
        emit TokensBurned(from, amount);
    }
    
    /**
     * @dev Reset faucet for a user (owner only)
     * @param user User address to reset
     */
    function resetFaucet(address user) external onlyOwner {
        lastFaucetTime[user] = 0;
        totalFaucetClaimed[user] = 0;
    }
    
    /**
     * @dev Get faucet info for a user
     * @param user User address
     * @return canUseFaucet Whether user can use faucet
     * @return timeUntilNextFaucet Time until next faucet available
     * @return totalClaimed Total amount claimed by user
     */
    function getFaucetInfo(address user) external view returns (
        bool canUseFaucet,
        uint256 timeUntilNextFaucet,
        uint256 totalClaimed
    ) {
        canUseFaucet = block.timestamp >= lastFaucetTime[user] + FAUCET_COOLDOWN && 
                      totalFaucetClaimed[user] < MAX_FAUCET_AMOUNT;
        
        if (lastFaucetTime[user] + FAUCET_COOLDOWN > block.timestamp) {
            timeUntilNextFaucet = lastFaucetTime[user] + FAUCET_COOLDOWN - block.timestamp;
        } else {
            timeUntilNextFaucet = 0;
        }
        
        totalClaimed = totalFaucetClaimed[user];
    }
    
    /**
     * @dev Override transferFrom to include additional checks
     * @param from Address to transfer from
     * @param to Address to transfer to
     * @param amount Amount to transfer
     */
    function transferFrom(address from, address to, uint256 amount) public virtual override returns (bool) {
        address spender = _msgSender();
        _spendAllowance(from, spender, amount);
        _transfer(from, to, amount);
        return true;
    }
}
