'use strict';

/**
 * @fileoverview Nodejs Program to deploy MockToken.
 * See perform method for sample code.
 *
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

  perform() {
    //1. Create a deployer.
    let deployer = new this.openST.Deployer(this.deployParams);

    //2. Deploy MockToken.
    this.log('Deploying MockToken');
    deployer
      .deployEIP20Token()
      .then((receipt) => {
        this.logReceipt(receipt);
        if (receipt.status && receipt.contractAddress) {
          this.exitWithoutError('MockToken Contract Address:', receipt.contractAddress);
        } else {
          this.exitWithError('Failed to deploy MockToken. See receipt for details.');
        }
      })
      .catch((reason) => {
        this.logError(reason);
        this.exitWithError('Failed to deploy contract. See error for details.');
      });
  }
}

let fileName = 'deployMockToken.js';
const program = PerformerBase.getProgram();
program.parse(process.argv);

let performer = new Performer(program);
performer.perform();
