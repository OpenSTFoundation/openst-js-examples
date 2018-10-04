'use strict';

/**
 * @fileoverview Nodejs Program to fund Mock Token to an address.
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
    this.sendOptions = {
      from: config.deployerAddress,
      gasPrice: config.gasPrice,
      gas: config.gas
    };

    this.eip20Address = program.eip20Address;
    this.toAddress = program.toAddress;
    this.amount = program.amount;
  }

  perform() {
    let openST = this.openST;

    const BigNumber = require('bignumber.js');
    let amountToTransferBN = new BigNumber(this.amount);

    let mockToken = new (openST.web3()).eth.Contract(openST.abiBinProvider().getABI('MockToken'), this.eip20Address);

    mockToken.methods
      .transfer(this.toAddress, amountToTransferBN.toString(10))
      .send(this.sendOptions)
      .then((receipt) => {
        this.logReceipt(receipt);
        if (receipt.status) {
          this.exitWithoutError('Fund EIP20 Done.');
        } else {
          this.exitWithError('Fund EIP20 failed.');
        }
      })
      .catch((reason) => {
        this.logError(reason);
        this.exitWithError('Fund EIP20 failed.');
      });
  }
}

const program = PerformerBase.getProgram();

program
  .option('--eip20-address [eip20Address]', 'Required. EIP20 Token contract address')
  .option('--to-address [toAddress]', 'To address')
  .option('--amount [amount]', 'Amount in weis.');

program.on('--help', function() {
  console.log('');
  console.log('  Example:');
  console.log('');
  console.log(
    '    node fundMockToken.js --eip20-address 0x7F8d92283Fa96f9F2FE1596e718584F8aCA70264 --to-address 0x84b0a610C11A9F8DB974CDBe39b855915b42CfD7 --amount 1000000000000000000000'
  );
  console.log('');
  console.log('');
});

program.parse(process.argv);
let performer = new Performer(program);
performer.perform();
