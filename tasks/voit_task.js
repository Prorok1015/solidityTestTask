const { Signer, Wallet } = require("ethers");
const { task } = require("hardhat/config");


task("create", "create voit")
  .addParam("voitmanager", "The address of voit manager, after deployed")
  .addParam("account1", "The account's address1 of candidate")
  .addParam("account2", "The account's address2 of candidate")
  .setAction( async (taskArgs, hre) => {
    let owner;
    let voitManager;
    let candidat = [];
    candidat[0] = taskArgs.account1;
    candidat[1] = taskArgs.account2;
    [owner] = await hre.ethers.getSigners();
    voitManager = await hre.ethers.getContractAt("VoitManager", taskArgs.voitmanager);
    await voitManager.createVoit("new 1", candidat);
    const _lvoit = await voitManager.lastvoit();
    console.log("You create voit with address: ", _lvoit);
});


task("voit", "voit for a candidate")
.addParam("me", "The private key of voiter")
.addParam("voit", "The address of voit")
.addParam("account", "The address of candidate")
.setAction(async ({me, voit, account}, hre) => {
    const provider = new ethers.providers.getDefaultProvider(`https://eth-rinkeby.alchemyapi.io/v2/${process.env.RINKEBY_KEY}`);
    let signer = new Wallet(me, provider);
    let _voit = await hre.ethers.getContractAt("Voit", voit);
    await _voit.connect(signer).voit(account, {value: ethers.utils.parseEther("0.01")});
    console.log("You are voit! All candidates: ", await _voit.getCand());
});

task("close", "close voit, if it end")
.addParam("voit", "The address of voit")
.setAction(async ({voit}, hre) => {
  let _voit = await hre.ethers.getContractAt("Voit", voit);
  const tx = await _voit.close();
  console.log("success!\n", tx);
});

task("outtax", "translate tax from voit, if it close")
.addParam("voit", "The address of voit")
.setAction(async ({voit}, hre) => {
  let _voit = await hre.ethers.getContractAt("Voit", voit);
  const tx = await _voit.getTax();
  console.log("success!\n", tx);
});

task("endvoit", "set voit on end[for debug]")
.addParam("voit", "The address of voit")
.setAction(async ({voit}, hre) => {
  let _voit = await hre.ethers.getContractAt("Voit", voit);
  const tx = await _voit.setEndVoit();
  console.log("success!\n", tx);
});

task("allcandidates", "set voit on end[for debug]")
.addParam("voit", "The address of voit")
.setAction(async ({voit}, hre) => {
  let _voit = await hre.ethers.getContractAt("Voit", voit);
  console.log("candidates list: ", await _voit.getCand());
});