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
          this.exitWithoutError('Transaction Id:', receipt.events.SessionAuthorizationSubmitted.returnValues._transactionId);
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

program.parse(process.argv);

let performer = new Performer(program);
performer.propose();
