// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@fhevm/lib/Reencrypt.sol";
import "@fhevm/lib/Fhe.sol";

contract CipherBondBid {
    using Fhe for euint32;
    using Fhe for ebool;
    using Fhe for euint256;
    
    struct Bond {
        euint32 bondId;
        euint32 faceValue;
        euint32 currentBid;
        euint32 minBid;
        euint32 bidCount;
        ebool isActive;
        ebool isVerified;
        string issuer;
        string maturity;
        string rating;
        address issuerAddress;
        uint256 startTime;
        uint256 endTime;
    }
    
    struct Bid {
        euint32 bidId;
        euint32 amount;
        ebool isWinning;
        address bidder;
        uint256 timestamp;
    }
    
    struct BidderProfile {
        euint32 totalBids;
        euint32 successfulBids;
        euint32 reputation;
        ebool isVerified;
        string name;
        address bidderAddress;
    }
    
    mapping(uint256 => Bond) public bonds;
    mapping(uint256 => Bid) public bids;
    mapping(address => BidderProfile) public bidderProfiles;
    mapping(uint256 => uint256[]) public bondBids; // bondId => bidIds
    
    uint256 public bondCounter;
    uint256 public bidCounter;
    
    address public owner;
    address public verifier;
    
    event BondCreated(uint256 indexed bondId, address indexed issuer, string issuerName);
    event BidPlaced(uint256 indexed bidId, uint256 indexed bondId, address indexed bidder, uint32 amount);
    event BondWon(uint256 indexed bondId, address indexed winner, uint32 winningAmount);
    event BondVerified(uint256 indexed bondId, bool isVerified);
    event BidderVerified(address indexed bidder, bool isVerified);
    
    constructor(address _verifier) {
        owner = msg.sender;
        verifier = _verifier;
    }
    
    function createBond(
        string memory _issuer,
        string memory _maturity,
        string memory _rating,
        euint32 _faceValue,
        euint32 _minBid,
        uint256 _duration
    ) public returns (uint256) {
        require(bytes(_issuer).length > 0, "Issuer name cannot be empty");
        require(_duration > 0, "Duration must be positive");
        
        uint256 bondId = bondCounter++;
        
        bonds[bondId] = Bond({
            bondId: _faceValue, // Will be set properly
            faceValue: _faceValue,
            currentBid: Fhe.asEuint32(0),
            minBid: _minBid,
            bidCount: Fhe.asEuint32(0),
            isActive: Fhe.asEbool(true),
            isVerified: Fhe.asEbool(false),
            issuer: _issuer,
            maturity: _maturity,
            rating: _rating,
            issuerAddress: msg.sender,
            startTime: block.timestamp,
            endTime: block.timestamp + _duration
        });
        
        emit BondCreated(bondId, msg.sender, _issuer);
        return bondId;
    }
    
    function placeEncryptedBid(
        uint256 bondId,
        euint32 encryptedAmount
    ) public returns (uint256) {
        require(bonds[bondId].issuerAddress != address(0), "Bond does not exist");
        require(Fhe.decrypt(bonds[bondId].isActive), "Bond is not active");
        require(block.timestamp <= bonds[bondId].endTime, "Bidding period has ended");
        require(Fhe.decrypt(encryptedAmount) >= Fhe.decrypt(bonds[bondId].minBid), "Bid amount below minimum");
        
        uint256 bidId = bidCounter++;
        
        // Store encrypted bid data - no ETH transfer
        bids[bidId] = Bid({
            bidId: encryptedAmount, // Encrypted amount stored
            amount: encryptedAmount,
            isWinning: Fhe.asEbool(false),
            bidder: msg.sender,
            timestamp: block.timestamp
        });
        
        // Update bond totals with encrypted arithmetic
        bonds[bondId].currentBid = bonds[bondId].currentBid + encryptedAmount;
        bonds[bondId].bidCount = bonds[bondId].bidCount + Fhe.asEuint32(1);
        
        // Add bid to bond's bid list
        bondBids[bondId].push(bidId);
        
        // Update bidder profile with encrypted data
        if (bidderProfiles[msg.sender].bidderAddress == address(0)) {
            bidderProfiles[msg.sender] = BidderProfile({
                totalBids: Fhe.asEuint32(1),
                successfulBids: Fhe.asEuint32(0),
                reputation: Fhe.asEuint32(100),
                isVerified: Fhe.asEbool(false),
                name: "",
                bidderAddress: msg.sender
            });
        } else {
            bidderProfiles[msg.sender].totalBids = bidderProfiles[msg.sender].totalBids + Fhe.asEuint32(1);
        }
        
        emit BidPlaced(bidId, bondId, msg.sender, Fhe.decrypt(encryptedAmount));
        return bidId;
    }
    
    function finalizeBond(uint256 bondId) public {
        require(bonds[bondId].issuerAddress == msg.sender, "Only issuer can finalize");
        require(Fhe.decrypt(bonds[bondId].isActive), "Bond must be active");
        require(block.timestamp > bonds[bondId].endTime, "Bidding period not ended");
        
        bonds[bondId].isActive = Fhe.asEbool(false);
        
        // Find winning bid
        uint256[] memory bidIds = bondBids[bondId];
        uint256 winningBidId = 0;
        uint32 maxAmount = 0;
        
        for (uint256 i = 0; i < bidIds.length; i++) {
            uint32 bidAmount = Fhe.decrypt(bids[bidIds[i]].amount);
            if (bidAmount > maxAmount) {
                maxAmount = bidAmount;
                winningBidId = bidIds[i];
            }
        }
        
        if (winningBidId > 0) {
            bids[winningBidId].isWinning = Fhe.asEbool(true);
            bidderProfiles[bids[winningBidId].bidder].successfulBids = 
                bidderProfiles[bids[winningBidId].bidder].successfulBids + Fhe.asEuint32(1);
            
            emit BondWon(bondId, bids[winningBidId].bidder, maxAmount);
        }
    }
    
    function verifyBond(uint256 bondId, ebool isVerified) public {
        require(msg.sender == verifier, "Only verifier can verify bonds");
        require(bonds[bondId].issuerAddress != address(0), "Bond does not exist");
        
        bonds[bondId].isVerified = isVerified;
        emit BondVerified(bondId, Fhe.decrypt(isVerified));
    }
    
    function verifyBidder(address bidder, ebool isVerified) public {
        require(msg.sender == verifier, "Only verifier can verify bidders");
        require(bidder != address(0), "Invalid bidder address");
        
        bidderProfiles[bidder].isVerified = isVerified;
        emit BidderVerified(bidder, Fhe.decrypt(isVerified));
    }
    
    function updateBidderReputation(address bidder, euint32 reputation) public {
        require(msg.sender == verifier, "Only verifier can update reputation");
        require(bidder != address(0), "Invalid bidder address");
        
        bidderProfiles[bidder].reputation = reputation;
    }
    
    function getBondInfo(uint256 bondId) public view returns (
        string memory issuer,
        string memory maturity,
        string memory rating,
        uint32 faceValue,
        uint32 currentBid,
        uint32 minBid,
        uint32 bidCount,
        bool isActive,
        bool isVerified,
        address issuerAddress,
        uint256 startTime,
        uint256 endTime
    ) {
        Bond storage bond = bonds[bondId];
        return (
            bond.issuer,
            bond.maturity,
            bond.rating,
            Fhe.decrypt(bond.faceValue),
            Fhe.decrypt(bond.currentBid),
            Fhe.decrypt(bond.minBid),
            Fhe.decrypt(bond.bidCount),
            Fhe.decrypt(bond.isActive),
            Fhe.decrypt(bond.isVerified),
            bond.issuerAddress,
            bond.startTime,
            bond.endTime
        );
    }
    
    function getBidInfo(uint256 bidId) public view returns (
        uint32 amount,
        bool isWinning,
        address bidder,
        uint256 timestamp
    ) {
        Bid storage bid = bids[bidId];
        return (
            Fhe.decrypt(bid.amount),
            Fhe.decrypt(bid.isWinning),
            bid.bidder,
            bid.timestamp
        );
    }
    
    function getBidderProfile(address bidder) public view returns (
        uint32 totalBids,
        uint32 successfulBids,
        uint32 reputation,
        bool isVerified,
        string memory name
    ) {
        BidderProfile storage profile = bidderProfiles[bidder];
        return (
            Fhe.decrypt(profile.totalBids),
            Fhe.decrypt(profile.successfulBids),
            Fhe.decrypt(profile.reputation),
            Fhe.decrypt(profile.isVerified),
            profile.name
        );
    }
    
    function getBondBids(uint256 bondId) public view returns (uint256[] memory) {
        return bondBids[bondId];
    }
    
    function withdrawWinnings(uint256 bondId) public {
        require(!Fhe.decrypt(bonds[bondId].isActive), "Bond must be finalized");
        require(block.timestamp > bonds[bondId].endTime, "Bidding period not ended");
        
        // Check if caller is the winning bidder
        uint256[] memory bidIds = bondBids[bondId];
        bool isWinner = false;
        uint32 winningAmount = 0;
        
        for (uint256 i = 0; i < bidIds.length; i++) {
            if (bids[bidIds[i]].bidder == msg.sender && Fhe.decrypt(bids[bidIds[i]].isWinning)) {
                isWinner = true;
                winningAmount = Fhe.decrypt(bids[bidIds[i]].amount);
                break;
            }
        }
        
        require(isWinner, "Only winning bidder can withdraw");
        
        // Transfer winnings to bidder
        payable(msg.sender).transfer(winningAmount);
    }
}
