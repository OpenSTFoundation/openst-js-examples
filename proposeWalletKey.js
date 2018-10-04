'use strict';

/**
 * @fileoverview Nodejs Program to propose add wallet in a given TokenHolder Contract.
 * See perform method for sample code.
 *
 * Contract: https://github.com/OpenSTFoundation/openst-contracts/blob/v0.9.4/contracts/TokenHolder.sol
 * @author kedar@ost.com (Kedar Chandrayan)
 */

const PerformerBase = require('./PerformerBase');

class Performer extends PerformerBase {
  constructor(program) {
    super(program);

    this.tokenHolderAddress = program.tokenHolder;
    this.walletToPropose = program.walletToPropose;
    this.wallet = program.wallet;

    //Validate the inputs.
    this.validate();
  }

  perform() {
    let openST = this.openST;
    let config = this.getSetupConfig();
    let tokenHolder = new openST.contracts.TokenHolder(this.tokenHolderAddress);
    // Propose a new wallet by calling submitAddWallet
    tokenHolder
      .submitAddWallet(this.walletToPropose)
      .send({
        from: this.wallet,
        gasPrice: config.gasPrice,
        gas: config.gas
      })
      .then((receipt) => {
        if (receipt.status) {
          if (receipt.events.TransactionExecutionSucceeded) {
            this.logReceiptEvent(receipt, 'TransactionExecutionSucceeded', 2);
            this.exitWithoutError('Transaction Executed and Succeeded');
          } else if (receipt.events.TransactionExecutionFailed) {
            this.logReceiptEvent(receipt, 'TransactionExecutionFailed', 1);
            this.exitWithError('Failed to Execute Transaction. See TransactionExecutionFailed event for details.');
          } else if (receipt.events.WalletAdditionSubmitted) {
            this.logReceiptEvent(receipt, 'WalletAdditionSubmitted');

            this.exitWithoutError(
              'Wallet addition submitted. More Confirmations Needed.\n',
              'transaction id: ' + receipt.events.WalletAdditionSubmitted.returnValues._transactionID
            );
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

const program = PerformerBase.getProgram();
program
  .option('--token-holder [tokenHolder]', 'TokenHolder contract address')
  .option('--wallet-to-propose [walletToPropose]', 'Wallet to propose')
  .option('--wallet [wallet]', 'Wallet address');

program.on('--help', () => {
  console.log('');
  console.log('  Example:');
  console.log('');
  console.log(
    '    node proposeWalletKey.js --token-holder 0x3D7bb53A5d731B157554E32a6499162070365C06 --wallet-to-propose 0xea674fdde714fd979de3edf0f56aa9716b898ec8 --wallet 0xe7817ce78558ca0e43f11a975acc6027eb845a5a'
  );
  console.log('');
  console.log('');
});

program.parse(process.argv);

let performer = new Performer(program);
performer.perform();
