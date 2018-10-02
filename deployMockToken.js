'use strict';

/**
 * @fileoverview Nodejs Program to deploy MockToken.
 * Contract: https://github.com/OpenSTFoundation/mosaic-contracts/blob/v0.9.3-rc1/contracts/SimpleToken/MockToken.sol
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
  }

  deploy() {
    //1. Create a deployer.
    let deployer = new this.openST.Deployer(this.deployParams);

    //2. Deploy MockToken.
    this.log('Deploying MockToken');
    deployer.deployERC20Token().then((receipt) => {
      this.logReceipt(receipt);
      if (receipt.status && receipt.contractAddress) {
        this.exitWithoutError('MockToken Contract Address:', receipt.contractAddress);
      } else {
        this.exitWithError('Failed to deploy MockToken. See receipt for details.');
      }
    });
  }
}

let fileName = 'deployMockToken.js';
const program = require('commander')
  .usage('')
  .option('-h, --history <file>', 'defaults to ./openst-setup/history.log. Path to history.log file. You can always lookup history for address and logs.')
  .option('-c, --config <file>', 'defaults to ./openst-setup/config.json. Path to openst-setup config.json file.');
program.parse(process.argv);

let performer = new Performer(program);
performer.deploy();
