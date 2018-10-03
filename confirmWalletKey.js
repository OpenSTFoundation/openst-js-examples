'use strict';

/**
 * @fileoverview Nodejs Program to Confirm Wallet Key in a given TokenHolder Contract. See confirm method for sample code.
 * Contract: https://github.com/OpenSTFoundation/openst-contracts/blob/develop/contracts/TokenHolder.sol
 * @author kedar@ost.com (Kedar Chandrayan)
 */

const PerformerBase = require('./PerformerBase');
class Performer extends PerformerBase {
  constructor(program) {
    super(program);
    this.tokenHolderAddress = program.tokenHolderAddress;
    this.wallet = program.wallet;
    this.transactionId = program.transactionId;

    //Validate the inputs.
    this.validate();
  }

  confirm() {
    let openST = this.openST;
    let config = this.getSetupConfig();
    let tokenHolder = new openST.contracts.TokenHolder(this.tokenHolderAddress);

    tokenHolder
      .confirmTransaction(this.transactionId)
      .send({
        from: this.wallet,
        gasPrice: config.gasPrice,
        gas: config.gas
      })
      .then((receipt) => {
        this.logReceipt(receipt);
        if (receipt.status) {
          if (receipt.events.TransactionExecutionSucceeded) {
            this.logReceiptEvent(receipt, 'TransactionExecutionSucceeded', 2);
            this.exitWithoutError('Transaction Executed and Succeeded');
          } else if (receipt.events.TransactionExecutionFailed) {
            this.logReceiptEvent(receipt, 'TransactionExecutionFailed', 1);
            this.exitWithError('Failed to Execute Transaction. See TransactionExecutionFailed event for details.');
          } else if (receipt.events.TransactionConfirmed) {
            this.logReceiptEvent(receipt, 'TransactionConfirmed');
            this.exitWithoutError('Transaction Confirmed. More Confirmations Needed.');
          }
        } else {
          this.exitWithError('Failed to Confirm Transaction. See receipt for details.');
        }
      })
      .catch((reason) => {
        this.logError(reason);
        this.exitWithError('Failed to Confirm Transaction. See error for details.');
      });
  }

  validate() {}
}

const program = require('commander');
program
  .option('-t, --token-holder-address [tokenHolderAddress]', 'TokenHolder contract address')
  .option('-w, --wallet [wallet]', 'Wallet address')
  .option('-i, --transaction-id [transactionId]', 'Transaction id');

program.on('--help', () => {
  console.log('');
  console.log('  Example:');
  console.log('');
  console.log('    node confirmWalletKey.js -t 0xf8c9018DEA785A7cc8A59fE1F8A64B6f64f060cD -w 0x39e76d2c955462674cd2dab10dbf46135dd2af24 -i 2');
  console.log('');
  console.log('');
});

program.parse(process.argv);

let performer = new Performer(program);
performer.confirm();