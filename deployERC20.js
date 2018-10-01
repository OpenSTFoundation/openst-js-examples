'use strict';

let config = require('./node_modules/@openstfoundation/openst.js/test/utils/configReader'),
  provider = config.gethRpcEndPoint;

const OpenST = require('@openstfoundation/openst.js');
let openST = new OpenST(provider);

let deployerAddress = config.deployerAddress;
let passphrase = config.passphrase;

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
