'use strict';

const program = require('commander');

program.option('-e, --erc20-address [erc20Address]', 'ERC20 Token contract address').parse(process.argv);

if (typeof program.erc20Address !== 'string') {
  console.log('Error :: invalid erc20Address');
  process.exit(1);
}

let erc20Address = program.erc20Address;

const os = require('os');
let configFilePath = os.homedir() + '/openst-setup/config.json';

let config = require(configFilePath),
  provider = config.gethRpcEndPoint;

const OpenST = require('@openstfoundation/openst.js');
let openST = new OpenST(provider);

let deployerAddress = config.deployerAddress;
let passphrase = 'testtest';
let organizationAddress = config.organizationAddress;

let deployParams = {
  from: deployerAddress,
  gasPrice: config.gasPrice,
  gas: config.gas
};
let deployer = new openST.Deployer(deployParams);

let gethSigner = new openST.utils.GethSignerService(openST.web3());
gethSigner.addAccount(deployerAddress, passphrase);
openST.signers.setSignerService(gethSigner);

deployer.deployTokenRules(organizationAddress, erc20Address).then((receipt) => {
  console.log('TokenRules contract deployment done!');
});
