'use strict';
/**
 * @fileoverview Nodejs Program to deploy TokenHolder Contract. See deploy method for sample code.
 * Contract: https://github.com/OpenSTFoundation/openst-contracts/blob/develop/contracts/TokenHolder.sol
 * @author kedar@ost.com (Kedar Chandrayan)
 */

const PerformerBase = require('./PerformerBase');
class Performer extends PerformerBase {
  constructor(program) {
    super(program);
    let config = this.getSetupConfig();
    let openST = this.openST;

    //Set the deployer params.
    this.deployParams = {
      from: config.deployerAddress,
      gasPrice: config.gasPrice,
      gas: config.gas
    };

    this.erc20Address = program.erc20Address;
    this.tokenRulesAddress = program.tokenRulesAddress;
    this.requirement = program.requirement;
    this.wallets = program.wallets;

    this.validate();

    this.log('ERC20 Address:', this.erc20Address);
    this.log('TokenRules Address:', this.tokenRulesAddress);
    this.log('requirement', this.requirement);
    this.log('wallets', this.wallets.join(','));
  }

  deploy() {
    //1. Create a deployer.
    let deployer = new this.openST.Deployer(this.deployParams);

    //2. Deploy MockToken.
    this.log('Deploying TokenHolder Contract');
    deployer.deployTokenHolder(this.erc20Address, this.tokenRulesAddress, this.requirement, this.wallets).then((receipt) => {
      this.logReceipt(receipt);
      if (receipt.status && receipt.contractAddress) {
        this.exitWithoutError('TokenHolder Contract Address:', receipt.contractAddress);
      } else {
        this.exitWithError('Failed to deploy TokenHolder. See receipt for details.');
      }
    });
  }

  validate() {
    let openST = this.openST;
    let web3 = openST.web3();
    let utils = web3.utils;

    if (!utils.isAddress(this.erc20Address)) {
      let error = 'Invalid ERC20 Contract Address. Please provide ERC20 contract address using -e or --erc20-address flag.';
      this.exitWithError(error);
      return;
    }

    if (!utils.isAddress(this.tokenRulesAddress)) {
      let error = 'Invalid TokenRules Contract Address. Please provide TokenRules contract address using -t or --token-rules-address flag.';
      this.exitWithError(error);
      return;
    }

    let bnRequirement;
    try {
      bnRequirement = utils.toBN(this.requirement);
      if (bnRequirement.isZero()) {
        let err = new Error('Requirement can not be zero.');
        throw err;
      }
    } catch (e) {
      this.logError(e);
      let error = 'Invlaid requirement. Please provide requirement using -r or --requirement flag';
      this.exitWithError(error);
      return;
    }

    let wallets = this.wallets || [],
      len = wallets.length;
    if (bnRequirement.cmp(utils.toBN(len))) {
      let error = new Error(`Please provide atleast ${bnRequirement.toString(10)} wallet address(s) using -w or --wallets flag.`);
      this.exitWithError(error);
      return;
    }
    while (len--) {
      let wAddress = wallets[len];
      if (!utils.isAddress(wAddress)) {
        let error = `Invlaid Wallet Address ${wAddress}. Please provide wallet addresses using -w or --wallets flag`;
        this.exitWithError(error);
        return;
      }
    }
  }
}

function parseWalletList(val) {
  let a = val.split(',');
  for (let i = 0; i < a.length; i++) {
    a[i] = a[i].trim();
  }
  return a;
}

const program = require('commander');
program
  .option('-e, --erc20-address [erc20Address]', 'ERC20 Token contract address')
  .option('-t, --token-rules-address [tokenRulesAddress]', 'TokenRules contract address')
  .option('-r, --requirement [requirement]', 'Requirement for the multisig operations', parseInt)
  .option('-w, --wallets <items>', 'Comma-Separated (without space) List of wallet addresses', parseWalletList)
  .option('-h, --history <file>', 'defaults to ./openst-setup/history.log. Path to history.log file. You can always lookup history for address and logs.')
  .option('-c, --config <file>', 'defaults to ./openst-setup/config.json. Path to openst-setup config.json file.');

program.on('--help', function() {
  console.log('');
  console.log('  Example:');
  console.log('');
  console.log(
    '    node deployTokenHolder.js -e 0x7F8d92283Fa96f9F2FE1596e718584F8aCA70264 -t 0xa502c51c8213A4e61Dc59dF914e252EB6354A8c0 -r 2 -w 0xbba2c47be3add4fd302d9a8122442ca9d65ad9a3,0x39e76d2c955462674cd2dab10dbf46135dd2af24'
  );
  console.log('');
  console.log('');
});

program.parse(process.argv);
let performer = new Performer(program);
performer.deploy();
