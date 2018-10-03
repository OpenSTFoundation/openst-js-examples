'use strict';

/**
 * @fileoverview Nodejs Program to register custom rule contract with TokenRules Contract.
 * See perform() method for sample code.
 * Contract: https://github.com/OpenSTFoundation/openst-contracts/blob/develop/contracts/TokenRules.sol
 * @author rachin@ost.com (Rachin Kapoor)
 */

const fs = require('fs');
const path = require('path');
const PerformerBase = require('./PerformerBase');
class Performer extends PerformerBase {
  constructor(program) {
    super(program);

    this.tokenRules = program.tokenRules;
    this.rule = program.rule;
    this.address = program.address;

    this.validate();

    let jsonInterfacePath = program.abi;
    let jsonInterface = this.buildAbi(program.abi);
    this.abi = JSON.stringify(jsonInterface);
  }

  perform() {
    let config = this.getSetupConfig();
    let openST = this.openST;
    let tokenRules = new openST.contracts.TokenRules(this.tokenRules);

    tokenRules
      .registerRule(this.rule, this.address, this.abi)
      .send({
        from: config.organizationAddress,
        gasPrice: config.gasPrice,
        gas: config.gas
      })
      .then((receipt) => {
        this.logReceipt(receipt);
        if (receipt.status && receipt.events.RuleRegistered) {
          this.logReceiptEvent(receipt, 'RuleRegistered', 2);
          this.exitWithoutError('Rule Registered Successfully.');
        } else {
          this.exitWithError('Failed to registered rule. See receipt for details.');
        }
      })
      .catch((reason) => {
        this.logError(reason);
        this.exitWithError('Failed to deploy contract. See error for details.');
      });
  }

  buildAbi(abiInPath) {
    let abiPath = null;
    try {
      abiPath = path.resolve(abiInPath);
      let abiContent = fs.readFileSync(abiPath, { encoding: 'utf8' });
      let abi = JSON.parse(abiContent);
      return abi;
    } catch (e) {
      this.logError(e);
      let error = new Error('Invalid ABI Path: ' + (abiPath || abiInPath) + '\nPlease provide contract Abi using -a or --abi flag');
      this.exitWithError(error);
    }
  }

  validate() {
    let openST = this.openST;
    let web3 = openST.web3();
    let utils = web3.utils;

    if (!utils.isAddress(this.tokenRules)) {
      let error = 'Invalid TokenRules Contract Address. Please provide TokenRules contract address using --token-rules flag.';
      this.exitWithError(error);
      return;
    }

    if (!this.rule) {
      let error = 'Invalid Custom Rule Name. Please provide Custom Rule name using --rule flag.';
      this.exitWithError(error);
      return;
    }

    if (!utils.isAddress(this.address)) {
      let error = 'Invalid Custom Rule Contract Address. Please provide Custom Rule contract address using --address flag.';
      this.exitWithError(error);
      return;
    }
  }
}

const program = PerformerBase.getProgram();

program
  .usage('--token-rules [address] --rule [name] --address [address] --abi [file]')
  .option('--token-rules [address]', 'Required. Address of TokenRules Contract.')
  .option('--rule [name]', 'Required. Name of the Rule.')
  .option('--address [address]', 'Required. Address of Rule Contract.')
  .option('--abi [file]', 'Required. Path to smart-contract Abi (Application Binary Interface) file.');

program.parse(process.argv);
let performer = new Performer(program);
performer.perform();
