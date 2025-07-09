// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DuxxanPlatformSimple is ReentrancyGuard, Ownable {
    IERC20 public immutable USDT;
    
    // Platform settings
    uint256 public constant RAFFLE_CREATION_FEE = 25 * 10**18; // 25 USDT
    uint256 public constant DONATION_CREATION_FEE = 25 * 10**18; // 25 USDT
    uint256 public constant RAFFLE_COMMISSION_RATE = 10; // 10%
    uint256 public constant DONATION_COMMISSION_RATE = 2; // 2%
    uint256 public constant PLATFORM_SHARE = 50; // 50% of commission
    uint256 public constant CREATOR_SHARE = 50; // 50% of commission
    
    address public commissionWallet;
    address public immutable deployWallet;
    
    // Prize types
    enum PrizeType { USDT_ONLY, PHYSICAL_ITEM }
    
    // Packed structs for gas optimization
    struct RaffleData {
        uint256 id;
        address creator;
        string title;
        string description;
        uint256 prizeAmount;
        uint256 ticketPrice;
        uint256 maxTickets;
        uint256 ticketsSold;
        uint256 endTime;
        address winner;
        PrizeType prizeType;
        uint8 flags; // packed: isActive(1) + isCompleted(2) + creatorApproved(4) + platformApproved(8) + payoutReleased(16)
    }
    
    struct DonationData {
        uint256 id;
        address creator;
        string title;
        string description;
        uint256 goalAmount;
        uint256 currentAmount;
        uint256 endTime;
        uint8 flags; // packed: isActive(1) + isUnlimited(2)
    }
    
    struct PaymentVars {
        uint256 total;
        uint256 commission;
        uint256 platformComm;
        uint256 prize;
        uint256 netAmount;
    }
    
    // Storage
    mapping(uint256 => RaffleData) public raffles;
    mapping(uint256 => DonationData) public donations;
    mapping(uint256 => mapping(address => uint256)) public raffleTickets;
    mapping(uint256 => mapping(address => uint256)) public donationContributions;
    
    uint256 public raffleCounter;
    uint256 public donationCounter;
    
    // Events
    event RaffleCreated(uint256 indexed raffleId, address indexed creator, uint256 prizeAmount, PrizeType prizeType);
    event TicketPurchased(uint256 indexed raffleId, address indexed buyer, uint256 quantity);
    event RaffleEnded(uint256 indexed raffleId, address indexed winner, uint256 prizeAmount);
    event DonationCreated(uint256 indexed donationId, address indexed creator, uint256 goalAmount);
    event DonationMade(uint256 indexed donationId, address indexed donor, uint256 amount);
    event PayoutReleased(uint256 indexed raffleId, address indexed winner, uint256 amount);
    
    constructor(address _usdtToken, address _commissionWallet) Ownable(msg.sender) {
        USDT = IERC20(_usdtToken);
        commissionWallet = _commissionWallet;
        deployWallet = msg.sender;
    }
    
    // Create raffle - only deploy/commission wallets can create USDT raffles
    function createRaffle(
        string memory _title,
        string memory _description,
        uint256 _prizeAmount,
        uint256 _ticketPrice,
        uint256 _maxTickets,
        uint256 _duration,
        PrizeType _prizeType
    ) external nonReentrant {
        require(_prizeAmount > 0, "Prize amount must be greater than 0");
        require(_ticketPrice > 0, "Ticket price must be greater than 0");
        require(_maxTickets > 0, "Max tickets must be greater than 0");
        require(_duration > 0, "Duration must be greater than 0");
        
        // USDT raffle restriction
        if (_prizeType == PrizeType.USDT_ONLY) {
            require(msg.sender == deployWallet || msg.sender == commissionWallet, 
                "Only authorized wallets can create USDT raffles");
        }
        
        // Collect fees and prize
        USDT.transferFrom(msg.sender, commissionWallet, RAFFLE_CREATION_FEE);
        if (_prizeType == PrizeType.USDT_ONLY) {
            USDT.transferFrom(msg.sender, address(this), _prizeAmount);
        }
        
        raffles[raffleCounter] = RaffleData({
            id: raffleCounter,
            creator: msg.sender,
            title: _title,
            description: _description,
            prizeAmount: _prizeAmount,
            ticketPrice: _ticketPrice,
            maxTickets: _maxTickets,
            ticketsSold: 0,
            endTime: block.timestamp + _duration,
            winner: address(0),
            prizeType: _prizeType,
            flags: 1 // isActive = true
        });
        
        emit RaffleCreated(raffleCounter, msg.sender, _prizeAmount, _prizeType);
        raffleCounter++;
    }
    
    // Buy raffle tickets
    function buyTickets(uint256 _raffleId, uint256 _quantity) external nonReentrant {
        RaffleData storage raffle = raffles[_raffleId];
        require(raffle.flags & 1 == 1, "Raffle not active"); // check isActive flag
        require(block.timestamp < raffle.endTime, "Raffle ended");
        require(raffle.ticketsSold + _quantity <= raffle.maxTickets, "Not enough tickets");
        
        uint256 totalCost = raffle.ticketPrice * _quantity;
        USDT.transferFrom(msg.sender, address(this), totalCost);
        
        raffleTickets[_raffleId][msg.sender] += _quantity;
        raffle.ticketsSold += _quantity;
        
        emit TicketPurchased(_raffleId, msg.sender, _quantity);
    }
    
    // End raffle 
    function endRaffle(uint256 _raffleId) external {
        RaffleData storage raffle = raffles[_raffleId];
        require(raffle.flags & 1 == 1, "Raffle not active");
        require(block.timestamp >= raffle.endTime || raffle.ticketsSold >= raffle.maxTickets, 
            "Raffle not ready");
        require(msg.sender == raffle.creator || msg.sender == owner(), "Not authorized");
        
        raffle.flags = (raffle.flags & 0xFE) | 2; // clear isActive(bit 0), set isCompleted(bit 1)
        
        if (raffle.ticketsSold > 0) {
            raffle.winner = msg.sender; // Simplified
        }
        
        emit RaffleEnded(_raffleId, raffle.winner, raffle.prizeAmount);
    }
    
    // Approve raffle result
    function approveRaffleResult(uint256 _raffleId, bool _approve) external {
        RaffleData storage raffle = raffles[_raffleId];
        require(raffle.flags & 2 == 2, "Raffle not completed");
        require(raffle.flags & 16 == 0, "Payout released");
        
        if (msg.sender == raffle.creator) {
            raffle.flags = _approve ? (raffle.flags | 4) : (raffle.flags & 0xFB); // creatorApproved(bit 2)
        } else if (msg.sender == owner()) {
            raffle.flags = _approve ? (raffle.flags | 8) : (raffle.flags & 0xF7); // platformApproved(bit 3)
        } else {
            revert("Not authorized");
        }
        
        // Check if both approved (flags 4 and 8 set)
        if ((raffle.flags & 12) == 12 && raffle.winner != address(0)) {
            _releasePayout(_raffleId);
        }
    }
    
    // Release payout
    function _releasePayout(uint256 _raffleId) internal {
        RaffleData storage raffle = raffles[_raffleId];
        require(raffle.flags & 16 == 0, "Already released");
        
        raffle.flags |= 16; // set payoutReleased
        
        PaymentVars memory vars;
        vars.total = raffle.ticketsSold * raffle.ticketPrice;
        vars.commission = (vars.total * RAFFLE_COMMISSION_RATE) / 100;
        vars.platformComm = (vars.commission * PLATFORM_SHARE) / 100;
        vars.prize = vars.total - vars.commission;
        
        if (raffle.prizeType == PrizeType.USDT_ONLY) {
            USDT.transfer(raffle.winner, raffle.prizeAmount + vars.prize);
        } else {
            USDT.transfer(raffle.winner, vars.prize);
        }
        
        USDT.transfer(commissionWallet, vars.platformComm);
        USDT.transfer(raffle.creator, vars.commission - vars.platformComm);
        
        emit PayoutReleased(_raffleId, raffle.winner, vars.prize);
    }
    
    // Create donation
    function createDonation(
        string memory _title,
        string memory _description,
        uint256 _goalAmount,
        uint256 _duration,
        bool _isUnlimited
    ) external nonReentrant {
        USDT.transferFrom(msg.sender, commissionWallet, DONATION_CREATION_FEE);
        
        donations[donationCounter] = DonationData({
            id: donationCounter,
            creator: msg.sender,
            title: _title,
            description: _description,
            goalAmount: _goalAmount,
            currentAmount: 0,
            endTime: _isUnlimited ? 0 : block.timestamp + _duration,
            flags: _isUnlimited ? 3 : 1 // isActive + isUnlimited or just isActive
        });
        
        emit DonationCreated(donationCounter, msg.sender, _goalAmount);
        donationCounter++;
    }
    
    // Make donation
    function makeDonation(uint256 _donationId, uint256 _amount) external nonReentrant {
        DonationData storage donation = donations[_donationId];
        require(donation.flags & 1 == 1 && _amount > 0, "Invalid donation");
        
        if (donation.flags & 2 == 0) { // not unlimited
            require(block.timestamp < donation.endTime, "Donation ended");
        }
        
        PaymentVars memory vars;
        vars.commission = (_amount * DONATION_COMMISSION_RATE) / 100;
        vars.netAmount = _amount - vars.commission;
        
        USDT.transferFrom(msg.sender, donation.creator, vars.netAmount);
        USDT.transferFrom(msg.sender, commissionWallet, vars.commission);
        
        donationContributions[_donationId][msg.sender] += _amount;
        donation.currentAmount += _amount;
        
        emit DonationMade(_donationId, msg.sender, _amount);
    }
    
    // Admin functions
    function updateCommissionWallet(address _newWallet) external onlyOwner {
        commissionWallet = _newWallet;
    }
    
    function emergencyWithdraw(address _token, uint256 _amount) external onlyOwner {
        IERC20(_token).transfer(owner(), _amount);
    }
}