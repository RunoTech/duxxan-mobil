const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DuxxanPlatform Security Tests", function () {
  let duxxanPlatform;
  let mockUSDT;
  let owner;
  let user1;
  let user2;
  let attacker;
  let commissionWallet;
  
  beforeEach(async function () {
    [owner, user1, user2, attacker, commissionWallet] = await ethers.getSigners();
    
    // Deploy mock USDT token
    const MockUSDT = await ethers.getContractFactory("MockUSDT");
    mockUSDT = await MockUSDT.deploy();
    await mockUSDT.deployed();
    
    // Deploy DuxxanPlatform
    const DuxxanPlatform = await ethers.getContractFactory("DuxxanPlatform");
    duxxanPlatform = await DuxxanPlatform.deploy(mockUSDT.address, commissionWallet.address);
    await duxxanPlatform.deployed();
    
    // Mint USDT to users
    await mockUSDT.mint(user1.address, ethers.utils.parseUnits("10000", 18));
    await mockUSDT.mint(user2.address, ethers.utils.parseUnits("10000", 18));
    await mockUSDT.mint(attacker.address, ethers.utils.parseUnits("10000", 18));
  });

  describe("Reentrancy Protection", function () {
    it("Should prevent reentrancy attacks on raffle creation", async function () {
      await mockUSDT.connect(user1).approve(duxxanPlatform.address, ethers.utils.parseUnits("1000", 18));
      
      await expect(duxxanPlatform.connect(user1).createRaffle(
        "Test Raffle",
        "Description",
        ethers.utils.parseUnits("100", 18),
        ethers.utils.parseUnits("10", 18),
        10,
        86400
      )).to.not.be.reverted;
    });

    it("Should prevent reentrancy attacks on ticket purchasing", async function () {
      await mockUSDT.connect(user1).approve(duxxanPlatform.address, ethers.utils.parseUnits("1000", 18));
      await duxxanPlatform.connect(user1).createRaffle(
        "Test Raffle",
        "Description",
        ethers.utils.parseUnits("100", 18),
        ethers.utils.parseUnits("10", 18),
        10,
        86400
      );
      
      await mockUSDT.connect(user2).approve(duxxanPlatform.address, ethers.utils.parseUnits("100", 18));
      await expect(duxxanPlatform.connect(user2).buyTickets(0, 2)).to.not.be.reverted;
    });
  });

  describe("Access Control", function () {
    it("Should only allow owner to pause the contract", async function () {
      await expect(duxxanPlatform.connect(attacker).pause()).to.be.revertedWith("Ownable: caller is not the owner");
      await expect(duxxanPlatform.connect(owner).pause()).to.not.be.reverted;
    });

    it("Should only allow owner to set commission wallet", async function () {
      await expect(duxxanPlatform.connect(attacker).setCommissionWallet(attacker.address))
        .to.be.revertedWith("Ownable: caller is not the owner");
      await expect(duxxanPlatform.connect(owner).setCommissionWallet(user1.address)).to.not.be.reverted;
    });

    it("Should only allow owner to emergency withdraw", async function () {
      await expect(duxxanPlatform.connect(attacker).emergencyWithdraw(mockUSDT.address, 100))
        .to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Input Validation", function () {
    it("Should reject raffle creation with zero prize amount", async function () {
      await mockUSDT.connect(user1).approve(duxxanPlatform.address, ethers.utils.parseUnits("1000", 18));
      await expect(duxxanPlatform.connect(user1).createRaffle(
        "Test Raffle",
        "Description",
        0,
        ethers.utils.parseUnits("10", 18),
        10,
        86400
      )).to.be.revertedWith("Prize amount must be positive");
    });

    it("Should reject raffle creation with zero ticket price", async function () {
      await mockUSDT.connect(user1).approve(duxxanPlatform.address, ethers.utils.parseUnits("1000", 18));
      await expect(duxxanPlatform.connect(user1).createRaffle(
        "Test Raffle",
        "Description",
        ethers.utils.parseUnits("100", 18),
        0,
        10,
        86400
      )).to.be.revertedWith("Ticket price must be positive");
    });

    it("Should reject ticket purchase with zero quantity", async function () {
      await mockUSDT.connect(user1).approve(duxxanPlatform.address, ethers.utils.parseUnits("1000", 18));
      await duxxanPlatform.connect(user1).createRaffle(
        "Test Raffle",
        "Description",
        ethers.utils.parseUnits("100", 18),
        ethers.utils.parseUnits("10", 18),
        10,
        86400
      );
      
      await expect(duxxanPlatform.connect(user2).buyTickets(0, 0))
        .to.be.revertedWith("Quantity must be positive");
    });
  });

  describe("Economic Attacks", function () {
    it("Should prevent buying more tickets than available", async function () {
      await mockUSDT.connect(user1).approve(duxxanPlatform.address, ethers.utils.parseUnits("1000", 18));
      await duxxanPlatform.connect(user1).createRaffle(
        "Test Raffle",
        "Description",
        ethers.utils.parseUnits("100", 18),
        ethers.utils.parseUnits("10", 18),
        5,
        86400
      );
      
      await mockUSDT.connect(user2).approve(duxxanPlatform.address, ethers.utils.parseUnits("1000", 18));
      await expect(duxxanPlatform.connect(user2).buyTickets(0, 10))
        .to.be.revertedWith("Not enough tickets available");
    });

    it("Should correctly distribute commissions", async function () {
      const initialBalance = await mockUSDT.balanceOf(commissionWallet.address);
      const initialCreatorBalance = await mockUSDT.balanceOf(user1.address);
      
      await mockUSDT.connect(user1).approve(duxxanPlatform.address, ethers.utils.parseUnits("1000", 18));
      await duxxanPlatform.connect(user1).createRaffle(
        "Test Raffle",
        "Description",
        ethers.utils.parseUnits("100", 18),
        ethers.utils.parseUnits("10", 18),
        10,
        86400
      );
      
      const afterCreationBalance = await mockUSDT.balanceOf(commissionWallet.address);
      expect(afterCreationBalance.sub(initialBalance)).to.equal(ethers.utils.parseUnits("25", 18));
      
      await mockUSDT.connect(user2).approve(duxxanPlatform.address, ethers.utils.parseUnits("100", 18));
      await duxxanPlatform.connect(user2).buyTickets(0, 2);
      
      const ticketCost = ethers.utils.parseUnits("20", 18);
      const commission = ticketCost.mul(10).div(100);
      const platformShare = commission.mul(50).div(100);
      
      const finalCommissionBalance = await mockUSDT.balanceOf(commissionWallet.address);
      
      expect(finalCommissionBalance.sub(initialBalance)).to.equal(
        ethers.utils.parseUnits("25", 18).add(platformShare)
      );
    });
  });

  describe("State Manipulation", function () {
    it("Should prevent manipulation of completed raffles", async function () {
      await mockUSDT.connect(user1).approve(duxxanPlatform.address, ethers.utils.parseUnits("1000", 18));
      await duxxanPlatform.connect(user1).createRaffle(
        "Test Raffle",
        "Description",
        ethers.utils.parseUnits("100", 18),
        ethers.utils.parseUnits("10", 18),
        2,
        86400
      );
      
      await mockUSDT.connect(user2).approve(duxxanPlatform.address, ethers.utils.parseUnits("100", 18));
      await duxxanPlatform.connect(user2).buyTickets(0, 2);
      
      await expect(duxxanPlatform.connect(user2).buyTickets(0, 1))
        .to.be.revertedWith("Raffle not active");
    });

    it("Should prevent early raffle ending by non-authorized users", async function () {
      await mockUSDT.connect(user1).approve(duxxanPlatform.address, ethers.utils.parseUnits("1000", 18));
      await duxxanPlatform.connect(user1).createRaffle(
        "Test Raffle",
        "Description",
        ethers.utils.parseUnits("100", 18),
        ethers.utils.parseUnits("10", 18),
        10,
        86400 * 7
      );
      
      await expect(duxxanPlatform.connect(attacker).endRaffle(0))
        .to.be.revertedWith("Cannot end raffle yet");
    });
  });

  describe("Pause Functionality", function () {
    it("Should prevent raffle creation when paused", async function () {
      await duxxanPlatform.connect(owner).pause();
      
      await mockUSDT.connect(user1).approve(duxxanPlatform.address, ethers.utils.parseUnits("1000", 18));
      await expect(duxxanPlatform.connect(user1).createRaffle(
        "Test Raffle",
        "Description",
        ethers.utils.parseUnits("100", 18),
        ethers.utils.parseUnits("10", 18),
        10,
        86400
      )).to.be.revertedWith("Pausable: paused");
    });

    it("Should prevent donation creation when paused", async function () {
      await duxxanPlatform.connect(owner).pause();
      
      await mockUSDT.connect(user1).approve(duxxanPlatform.address, ethers.utils.parseUnits("1000", 18));
      await expect(duxxanPlatform.connect(user1).createDonation(
        "Test Donation",
        "Description",
        ethers.utils.parseUnits("1000", 18),
        86400,
        0
      )).to.be.revertedWith("Pausable: paused");
    });
  });
});