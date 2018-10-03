'use strict';

/**
 * @fileoverview Nodejs Program to Revoke Ephemeral Key in a given TokenHolder Contract.
 * See perform method for sample code.
 *
 * Contract: https://github.com/OpenSTFoundation/openst-contracts/blob/develop/contracts/TokenHolder.sol
 * @author kedar@ost.com (Kedar Chandrayan)
 */

const PerformerBase = require('./PerformerBase');
class Performer extends PerformerBase {
  constructor(program) {
    super(program);
    this.tokenHolderAddress = program.tokenHolder;
    this.ephemeralKeyAddress = program.ephemeralKey;
    this.wallet = program.wallet;

    //Validate the inputs.
    this.validate();
  }

  perform() {
    let openST = this.openST;
    let config = this.getSetupConfig();
    let tokenHolder = new openST.contracts.TokenHolder(this.tokenHolderAddress);
    // Authorize an ephemeral public key
    tokenHolder
      .revokeSession(this.ephemeralKeyAddress)
      .send({
        from: this.wallet,
        gasPrice: config.gasPrice,
        gas: config.gas
      })
      .then((receipt) => {
        if (receipt.status) {
          this.exitWithoutError('Transaction Succeeded');
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
  .option('--ephemeral-key [ephemeralKey]', 'Ephemeral key address');

program.on('--help', () => {
  console.log('');
  console.log('  Example:');
  console.log('');
  console.log(
    '    node revokeEphemeralKey.js --token-holder 0xf8c9018DEA785A7cc8A59fE1F8A64B6f64f060cD --wallet 0xbba2c47be3add4fd302d9a8122442ca9d65ad9a3 --ephemeral-key 0xee339904c3a947f0e5eac4e7e4d0da835321f7a0'
  );
  console.log('');
  console.log('');
});

program.parse(process.argv);

let performer = new Performer(program);
performer.perform();
