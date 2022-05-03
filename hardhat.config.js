const { Signer, Wallet } = require("ethers");
const { task } = require("hardhat/config");

require("@nomiclabs/hardhat-waffle");
require('solidity-coverage');
require("dotenv").config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("create", "create voit")
  .addParam("account1", "The account's address1")
  .addParam("account2", "The account's address2")
  .setAction( async (taskArgs, hre) => {
    let owner;
    let voitManager;
    let candidat = [];
    candidat[0] = taskArgs.account1;
    candidat[1] = taskArgs.account2;
    [owner] = await hre.ethers.getSigners();
    voitManager = await hre.ethers.getContractAt("VoitManager", "0x11C6471baA47684bba78483E5A4f41E446C4BC37");
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

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  defaultNetwork: "rinkeby",
  networks: {
    hardhat: {
    },
    rinkeby: {
      url: `https://eth-rinkeby.alchemyapi.io/v2/${process.env.RINKEBY_KEY}`,
      accounts: [process.env.WALLET_KEY]
    }
  },
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
};
