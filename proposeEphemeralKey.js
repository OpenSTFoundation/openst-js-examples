'use strict';

/**
 * @fileoverview Nodejs Program to Propose Ephemeral Key in a given TokenHolder Contract.
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
    this.ephemeralKeyAddress = program.ephemeralKey;
    this.wallet = program.wallet;
    this.spendingLimit = program.spendingLimit;
    this.expirationHeight = program.expirationHeight;

    //Validate the inputs.
    this.validate();
  }

  perform() {
    let openST = this.openST;
    let config = this.getSetupConfig();
    let tokenHolder = new openST.contracts.TokenHolder(this.tokenHolderAddress);
    // Authorize an ephemeral public key
    tokenHolder
      .submitAuthorizeSession(this.ephemeralKeyAddress, this.spendingLimit, this.expirationHeight)
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
          } else if (receipt.events.SessionAuthorizationSubmitted) {
            this.logReceiptEvent(receipt, 'SessionAuthorizationSubmitted');

            this.exitWithoutError(
              'Session authorization submitted. More Confirmations Needed.\n',
              'transaction id: ' + receipt.events.SessionAuthorizationSubmitted.returnValues._transactionID
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
  .option('--wallet [wallet]', 'Wallet address')
  .option('--spending-limit [spendingLimit]', 'Spending Limit')
  .option('--expiration-height [expirationHeight]', 'Expiration height')
  .option('--ephemeral-key [ephemeralKey]', 'Ephemeral key address');

program.on('--help', () => {
  console.log('');
  console.log('  Example:');
  console.log('');
  console.log(
    '    node proposeEphemeralKey.js --token-holder 0xf8c9018DEA785A7cc8A59fE1F8A64B6f64f060cD --wallet 0xbba2c47be3add4fd302d9a8122442ca9d65ad9a3 --spending-limit 5000000000000000000 --expiration-height 200000000 --ephemeral-key 0xee339904c3a947f0e5eac4e7e4d0da835321f7a0'
  );
  console.log('');
  console.log('');
});

program.parse(process.argv);

let performer = new Performer(program);
performer.perform();
