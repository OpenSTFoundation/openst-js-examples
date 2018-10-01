'use strict';

const os = require('os');
let configFilePath = os.homedir() + '/openst-setup/config.json';

let config = require(configFilePath),
  provider = config.gethRpcEndPoint;

const OpenST = require('@openstfoundation/openst.js');
let openST = new OpenST(provider);

let deployerAddress = config.deployerAddress;
let passphrase = 'testtest';

let deployParams = {
  from: deployerAddress,
  gasPrice: config.gasPrice,
  gas: config.gas
};
let deployer = new openST.Deployer(deployParams);

let gethSigner = new openST.utils.GethSignerService(openST.web3());
gethSigner.addAccount(deployerAddress, passphrase);
openST.signers.setSignerService(gethSigner);

deployer.deployERC20Token().then((receipt) => {
  console.log('ERC20Token contract deployment done!');
});
