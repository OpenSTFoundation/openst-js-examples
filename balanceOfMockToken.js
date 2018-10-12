'use strict';

/**
 * @fileoverview Nodejs Program to check balance of Mock Token of an address.
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

    this.eip20Address = program.eip20Address;
    this.address = program.address;
  }

  perform() {
    let openST = this.openST;

    const BigNumber = require('bignumber.js');

    let mockToken = new (openST.web3()).eth.Contract(openST.abiBinProvider().getABI('MockToken'), this.eip20Address);

    mockToken.methods
      .balanceOf(this.address)
      .call({})
      .then((balance) => {
        this.exitWithoutError('Balance of address:' + this.address, new BigNumber(balance).toString(10));
      })
      .catch((reason) => {
        this.logError(reason);
        this.exitWithError('Balance check failed.');
      });
  }
}

const program = PerformerBase.getProgram();

program.option('--eip20-address [eip20Address]', 'Required. EIP20 Token contract address').option('--address [address]', 'Address');

program.on('--help', function() {
  console.log('');
  console.log('  Example:');
  console.log('');
  console.log('    node balanceOfMockToken.js --eip20-address 0x7F8d92283Fa96f9F2FE1596e718584F8aCA70264 --address 0x84b0a610C11A9F8DB974CDBe39b855915b42CfD7');
  console.log('');
  console.log('');
});

program.parse(process.argv);
let performer = new Performer(program);
performer.perform();
