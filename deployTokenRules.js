'use strict';

/**
 * @fileoverview Nodejs Program to deploy TokenRules Contract. See deploy method for sample code.
 * Contract: https://github.com/OpenSTFoundation/openst-contracts/blob/develop/contracts/TokenRules.sol
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
    this.organizationAddress = program.orgAddress || config.organizationAddress;

    this.validate();

    this.log('ERC20 Address:', this.erc20Address);
    this.log('Organisation Address:', this.organizationAddress);
  }

  deploy() {
    //1. Create a deployer.
    let deployer = new this.openST.Deployer(this.deployParams);

    //2. Deploy MockToken.
    this.log('Deploying TokenRules Contract');
    deployer.deployTokenRules(this.organizationAddress, this.erc20Address).then((receipt) => {
      this.logReceipt(receipt);
      if (receipt.status && receipt.contractAddress) {
        this.exitWithoutError('TokenRules Contract Address:', receipt.contractAddress);
      } else {
        this.exitWithError('Failed to deploy TokenRules. See receipt for details.');
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

    if (!utils.isAddress(this.organizationAddress)) {
      let error = 'Invalid Organisation Address. Please provide Organisation address using -o or --org-address flag.';
      this.exitWithError(error);
      return;
    }
  }
}

const program = require('commander');

program
  .option('-e, --erc20-address [erc20Address]', 'Required. ERC20 Token contract address')
  .option('-o, --org-address [Organisation Address]', 'defaults to config.organizationAddress. Organisation key address')
  .option('-h, --history <file>', 'defaults to ./openst-setup/history.log. Path to history.log file. You can always lookup history for address and logs.')
  .option('-c, --config <file>', 'defaults to ./openst-setup/config.json. Path to openst-setup config.json file.');

program.on('--help', function() {
  console.log('');
  console.log('  Example:');
  console.log('');
  console.log('    node deployTokenRules.js -e 0x7F8d92283Fa96f9F2FE1596e718584F8aCA70264');
  console.log('');
  console.log('');
});

program.parse(process.argv);
let performer = new Performer(program);
performer.deploy();
