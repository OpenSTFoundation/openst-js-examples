'use strict';

/**
 * @fileoverview Nodejs Program to Propose Ephemeral Key in a given TokenHolder Contract. See propose method for sample code.
 * Contract: https://github.com/OpenSTFoundation/openst-contracts/blob/develop/contracts/TokenHolder.sol
 * @author kedar@ost.com (Kedar Chandrayan)
 */
const PerformerBase = require('./PerformerBase');
class Performer extends PerformerBase {
  constructor(program) {
    super(program);
    this.tokenHolderAddress = program.tokenHolderAddress;
    this.ephemeralKeyAddress = program.ephemeralKeyAddress;
    this.wallet = program.wallet;
    this.spendingLimit = program.spendingLimit;
    this.expirationHeight = program.expirationHeight;

    //Validate the inputs.
    this.validate();
  }

  propose() {
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
        this.logReceipt(receipt);
        if (receipt.status && receipt.events.SessionAuthorizationSubmitted) {
          this.logSuccess('SessionAuthorizationSubmitted Event:', receipt.events.SessionAuthorizationSubmitted);
          this.exitWithoutError('Transaction Id:', receipt.events.SessionAuthorizationSubmitted.returnValues._transactionID);
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
  .option('-t, --token-holder-address [tokenHolderAddress]', 'TokenHolder contract address')
  .option('-w, --wallet [wallet]', 'Wallet address')
  .option('-s, --spending-limit [spendingLimit]', 'Spending Limit')
  .option('-x, --expiration-height [expirationHeight]', 'Expiration height')
  .option('-e, --ephemeral-key-address [ephemeralKeyAddress]', 'Ephemeral key address');

program.on('--help', () => {
  console.log('');
  console.log('  Example:');
  console.log('');
  console.log(
    '    node proposeEphemeralKey.js -t 0xf8c9018DEA785A7cc8A59fE1F8A64B6f64f060cD -w 0xbba2c47be3add4fd302d9a8122442ca9d65ad9a3 -s 5000000000000000000 -x 200000000 -e 0xee339904c3a947f0e5eac4e7e4d0da835321f7a0'
  );
  console.log('');
  console.log('');
});

program.parse(process.argv);

let performer = new Performer(program);
performer.propose();
