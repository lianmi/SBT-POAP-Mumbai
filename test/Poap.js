const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { ethers, upgrades } = require("hardhat");


describe("Poap main test", function () {
  async function contractFixture() {
    const [owner, addr1, addr2] = await ethers.getSigners();
    const baseURI = "https://poapsbts.xyz/token/";
    const poapName = "PoapSBTs";
    const FPoap = await ethers.getContractFactory("Poap");
    const contract = await upgrades.deployProxy(FPoap, [poapName, poapName, "https://poapsbts.xyz/token/", [addr1.address]], { initializer: '__POAP_init' });
    await contract.deployed();
    // Fixtures can return anything you consider useful for your tests
    return { owner, addr1, addr2, contract, baseURI, poapName };
  }
  it("should return correct name", async function() {
    const { owner, addr1, addr2, contract } = await loadFixture(contractFixture);
    expect(await contract.name()).to.equal("PoapSBTs");
    expect(await contract.symbol()).to.equal("PoapSBTs");
  });
  it("Should check POAPs' vars", async function () {
    const { owner, addr1, addr2, contract } = await loadFixture(contractFixture);
    // -------------------
    // Status checking
    expect(await contract.paused()).to.equal(false);
    expect(await contract.isAdmin(owner.address)).to.equal(true);
    expect(await contract.isAdmin(addr1.address)).to.equal(true);
    expect(await contract.isAdmin(addr2.address)).to.equal(false);
    await contract.createEvent(1, "show#1");
    expect(await contract.isEventMinter(1, owner.address)).to.equal(true);
    expect(await contract.isEventMinter(1, addr1.address)).to.equal(true);
    expect(await contract.isEventMinter(1, addr2.address)).to.equal(false);
  });
  it("Should check POAPEvent", async function () {
    const { owner, contract } = await loadFixture(contractFixture);
    const EVENT = 128
    // -------------------
    // Poap event checking
    await expect(contract.mintToken(EVENT, "poap-event-test", owner.address)).to.be.revertedWith("Poap: event not exists");
    await contract.createEvent(EVENT, "event test");
    expect(await contract.eventMetaName(EVENT)).to.equal("event test");
    await contract.mintToken(EVENT, "poap-event-test", owner.address)
    expect(await contract.eventHasUser(EVENT, owner.address)).to.equal(true);
    expect(await contract.tokenEvent(await contract.tokenOfOwnerByIndex(owner.address, 0))).to.equal(EVENT);
  });
  it("Should check POAPRole", async function () {
    const { owner, contract, addr1, addr2 } = await loadFixture(contractFixture);
    const EVENT = 256;

    await contract.createEvent(EVENT, "show#2");
    // -------------------
    // PoapRole admin
    await contract.connect(addr1).renounceAdmin(); // msg.send = addr1
    expect(await contract.isAdmin(addr1.address)).to.equal(false);
    await contract.addAdmin(addr1.address);
    expect(await contract.isAdmin(addr1.address)).to.equal(true);

    await contract.connect(owner).removeAdmin(addr1.address);

    expect(await contract.isAdmin(addr1.address)).to.equal(false);
    await contract.addAdmin(addr1.address);
    expect(await contract.isAdmin(addr1.address)).to.equal(true);
    // -------------------
    // PoapRole event minter
    expect(await contract.isEventMinter(EVENT, addr2.address)).to.equal(false);
    await contract.addEventMinter(EVENT, addr2.address);
    expect(await contract.isEventMinter(EVENT, addr2.address)).to.equal(true);
    await contract.removeEventMinter(EVENT, addr2.address);
    expect(await contract.isEventMinter(EVENT, addr2.address)).to.equal(false);
    await contract.addEventMinter(EVENT, addr2.address);
    expect(await contract.isEventMinter(EVENT, addr2.address)).to.equal(true);
    await contract.connect(addr2).renounceEventMinter(EVENT);
    expect(await contract.isEventMinter(EVENT, addr2.address)).to.equal(false);
  });
  it("Should check POAPPausable", async function () {
    const { owner, contract } = await loadFixture(contractFixture);
    // -------------------
    // Poap pause checking
    expect(await contract.paused()).to.equal(false);
    await contract.pause();
    expect(await contract.paused()).to.equal(true);
    await contract.unpause();
    expect(await contract.paused()).to.equal(false);

  });
  it("Should check POAP mint", async function () {
    const { owner, contract, addr1, addr2, baseURI } = await loadFixture(contractFixture);
    const EVENT = 512;
    const EVENT2 = 1024;
    const afterBaseURI = baseURI + "sbt-poap-token/";

    await contract.createEvent(EVENT, "show#3");
    await contract.createEvent(EVENT2, "show#4");
    async function checkPoap(address, baseURI, index, contract, shouldBalance, shouldId, shouldEvent) {
      expect(await contract.balanceOf(address)).to.equal(shouldBalance);
      const [tokenId, eventId] = await contract.tokenDetailsOfOwnerByIndex(address, index);
      expect(tokenId).to.equal(shouldId);
      expect(await contract.tokenURI(tokenId)).to.equal(baseURI + `poap-${shouldId}`);
      expect(eventId).to.equal(shouldEvent);
    }

    // -------------------
    // Poap mint checking
    await contract.mintToken(EVENT, "poap-1", owner.address);
    await checkPoap(owner.address, baseURI, 0, contract, 1, 1, EVENT)
    // each event can only assign once to one user
    await expect(contract.mintToken(EVENT, "poap-2", owner.address)).to.be.revertedWith("Poap: already assigned the event");

    await contract.mintEventToManyUsers(EVENT2, ["poap-2", "poap-3"], [owner.address, addr1.address]);
    await checkPoap(owner.address, baseURI, 1, contract, 2, 2, EVENT2)
    await checkPoap(addr1.address, baseURI, 0, contract, 1, 3, EVENT2)

    await contract.mintUserToManyEvents([EVENT, EVENT2], ["poap-4", "poap-5"], addr2.address);
    await checkPoap(addr2.address, baseURI, 0, contract, 2, 4, EVENT)
    await checkPoap(addr2.address, baseURI, 1, contract, 2, 5, EVENT2)

    await contract.burn(4); // burn (EVENT, addr2)
    await checkPoap(addr2.address, baseURI, 0, contract, 1, 5, EVENT2)

    await contract.setBaseURI(afterBaseURI);
    await checkPoap(addr2.address, afterBaseURI, 0, contract, 1, 5, EVENT2)
  });

  // -------------------
  // Poap basically is a ERC721 Token

  it("Should check POAP transforms", async function() {
    const EVENT =  512;
    const { owner, contract, addr1 } = await loadFixture(contractFixture);
    await contract.createEvent(EVENT, "event for transforms");
    expect(await contract.eventMetaName(EVENT)).to.equal("event for transforms");
    await contract.mintToken(EVENT, "poap-event-transforms", owner.address)
    const [tokenId, eventId] = await contract.tokenDetailsOfOwnerByIndex(owner.address, 0);

    const transferTx = await contract.transferFrom(owner.address, addr1.address, tokenId);
    await transferTx.wait();
    expect(await contract.ownerOf(tokenId)).to.equal(addr1.address);
  });
});