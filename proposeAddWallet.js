'use strict';

/**
 * @fileoverview Nodejs Program to propose add wallet in a given TokenHolder Contract. See propose method for sample code.
 * Contract: https://github.com/OpenSTFoundation/openst-contracts/blob/develop/contracts/TokenHolder.sol
 * @author kedar@ost.com (Kedar Chandrayan)
 */

const PerformerBase = require('./PerformerBase');

class Performer extends PerformerBase {
  constructor(program) {
    super(program);

    this.tokenHolderAddress = program.tokenHolderAddress;
    this.walletToPropose = program.walletToPropose;
    this.wallet = program.wallet;

    //Validate the inputs.
    this.validate();
  }

  propose() {
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
        this.logReceipt(receipt);
        if (receipt.status && receipt.events.WalletAdditionSubmitted) {
          this.logSuccess('WalletAdditionSubmitted Event:', receipt.events.WalletAdditionSubmitted);
          this.exitWithoutError('Transaction Id:', receipt.events.WalletAdditionSubmitted.returnValues._transactionID);
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
  .option('-p, --wallet-to-propose [walletToPropose]', 'Wallet to propose')
  .option('-w, --wallet [wallet]', 'Wallet address');

program.on('--help', () => {
  console.log('');
  console.log('  Example:');
  console.log('');
  console.log(
    '    node proposeAddWallet.js -t 0x3D7bb53A5d731B157554E32a6499162070365C06 -p 0xea674fdde714fd979de3edf0f56aa9716b898ec8 -w 0xe7817ce78558ca0e43f11a975acc6027eb845a5a'
  );
  console.log('');
  console.log('');
});

program.parse(process.argv);

let performer = new Performer(program);
performer.propose();
