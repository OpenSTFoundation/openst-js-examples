'use strict';

const program = require('commander');

function parseWalletList(val) {
  let a = val.split(',');
  for (let i = 0; i < a.length; i++) {
    a[i] = a[i].trim();
  }
  return a;
}

program
  .option('-e, --erc20-address [erc20Address]', 'ERC20 Token contract address')
  .option('-t, --token-rules-address [tokenRulesAddress]', 'TokenRules contract address')
  .option('-r, --requirement [requirement]', 'Requirement for the multisig operations', parseInt)
  .option('-w, --wallets <items>', 'List of wallet addresses', parseWalletList)
  .parse(process.argv);

// TODO - validate here for the params

let erc20Address = program.erc20Address,
  tokenRulesAddress = program.tokenRulesAddress,
  requirement = program.requirement,
  wallets = program.wallets;

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

deployer.deployTokenHolder(erc20Address, tokenRulesAddress, requirement, wallets).then((receipt) => {
  console.log('TokenHolder contract deployment done!');
});
