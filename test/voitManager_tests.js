const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Voit Manager", function () {
  let owner;
  let user1;
  let candidats = [];
  let voitManager;

  beforeEach(async function () {
    [owner, user1, , candidats[0], candidats[1], candidats[2]] = await ethers.getSigners();

    const voitManagerContract = await ethers.getContractFactory("VoitManager", owner);
    voitManager = await voitManagerContract.deploy();
    await voitManager.deployed();
    candidats[0] = candidats[0].address;
    candidats[1] = candidats[1].address;
    candidats[2] = candidats[2].address;
  });

  it("was deployed!", async function () {
    expect(voitManager.address).to.be.properAddress;
  });

  it("is owner!", async function () {
    const _owner = await voitManager.owner();
    expect(_owner).to.eq(owner.address);
  });

  it("create voit!", async () => {
    const _voit = await voitManager.createVoit("new 1", candidats);
    const _lvoit = await voitManager.lastvoit();
    expect(_lvoit).to.not.eq(0);
  })

  it("create voit as not an owner", async () => {
    const _voit = voitManager.connect(user1).createVoit("new 1", candidats);
    await expect(_voit).to.be.revertedWith('You are not an owner!');
  });

  it("get voits", async () => {
    await voitManager.createVoit("new 1", candidats);
    const _voit = await voitManager.lastvoit();
    const voits = await voitManager.getVoits();
    expect(_voit).to.eq(voits[0].voit);
  });
});
