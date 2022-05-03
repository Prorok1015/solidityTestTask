const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Voit", function () {
  let owner;
  let user1;
  let user2;
  let voit;
  let candidats = [];

  beforeEach(async function () {
    let voitManager;
    [owner, user1, user2, candidats[0], candidats[1], candidats[2]] = await ethers.getSigners();
    const voitManagerContract = await ethers.getContractFactory("VoitManager", owner);
    voitManager = await voitManagerContract.deploy();
    await voitManager.deployed();
    candidats[0] = candidats[0].address;
    candidats[1] = candidats[1].address;
    candidats[2] = candidats[2].address;

    await voitManager.createVoit("new 1", candidats);
    const _lvoit = await voitManager.lastvoit();
    voit = await ethers.getContractAt("Voit", _lvoit);
  });

  async function fvoit(user, candidate) {
    return voit.connect(user).voit(candidate, {value: ethers.utils.parseEther("0.01")});
  }

  it("once voit", async () => {
    await fvoit(user1, candidats[1]);
    const ar = await voit.getCand();
    expect(ar[1].count).to.be.eq(1);
  });

  it("double voit", async () => {
    await fvoit(user1, candidats[1]);   
    let tx = fvoit(user1, candidats[2]);
    await expect(tx).to.be.revertedWith('you already voted');
  });

  it("close no end", async () => {
    await fvoit(user1, candidats[1]);
    let tx = voit.close();
    await expect(tx).to.be.revertedWith('voiting is underway!');
  });

  it("close with end", async () => {
    await fvoit(user1, candidats[1]);
    await voit.setEndVoit();
    let tx = await voit.close();
    expect(tx).to.changeEtherBalance(candidats[1], ethers.utils.parseEther("0.01"));
  });

  it("out tax as an owner", async () => {
    await fvoit(user1, candidats[1]);
    await voit.setEndVoit();
    await voit.close();
    let tx = await voit.getTax();
    expect(tx).to.changeEtherBalance(owner, ethers.utils.parseEther("0.001"));
  });

  it("out tax as not an owner", async () => {
    await fvoit(user1, candidats[1]);
    await voit.setEndVoit();
    await voit.close();
    let tx = voit.connect(user2).getTax();
    await expect(tx).to.be.revertedWith('you not an owner!');
  });

  it("out tax while no end", async () => {
    await fvoit(user1, candidats[1]);
    let tx = voit.getTax();
    await expect(tx).to.be.revertedWith('voiting is underway!');
  });

  it("double out tax", async () => {
    await fvoit(user1, candidats[1]);
    await voit.setEndVoit();
    await voit.close();
    await voit.getTax();
    let tx = voit.getTax();
    await expect(tx).to.be.revertedWith('out of money!');
  });
});
