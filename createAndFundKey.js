'use strict';

/**
 * @fileoverview Nodejs Program create and fund a key.
 * See perform method for sample code.
 *
 * @author kedar@ost.com (Kedar Chandrayan)
 */

let fs = require('fs');
const path = require('path');
const PerformerBase = require('./PerformerBase');
class Performer extends PerformerBase {
  constructor(program) {
    super(program);
    let dataDirPath = program.dataDir || './openst-setup/origin-geth/';
    this.dataDir = path.resolve(dataDirPath);

    this.config = this.getSetupConfig();

    //Validate the inputs.
    this.validate();
  }

  async perform() {
    let senderAddr = this.config.chainOwnerAddress;
    let amount = '1000000000000000000000';
    let passphrase = 'testtest';

    let openST = this.openST;
    let web3 = openST.web3();

    let account = web3.eth.accounts.create();
    this.addKeyInfoToConfig(account.address, passphrase);

    let keystoreObj = web3.eth.accounts.encrypt(account.privateKey, passphrase);

    let date = new Date();

    let addrWithOutPrefix = account.address.substr(2).toLowerCase();

    let filename =
      'UTC--' +
      date.getUTCFullYear() +
      '-' +
      date.getUTCMonth() +
      '-' +
      date.getUTCDay() +
      'T' +
      date.getUTCHours() +
      '-' +
      date.getUTCMinutes() +
      '-' +
      date.getUTCSeconds() +
      '.' +
      date.getUTCMilliseconds() +
      'Z--' +
      addrWithOutPrefix;

    let keystoreFilePath = this.dataDir + '/keystore/' + filename;

    fs.writeFileSync(keystoreFilePath, JSON.stringify(keystoreObj));

    await this._fundEthFor(web3, senderAddr, account.address, amount, passphrase);

    this.exitWithoutError('Account created and funded.\n', account);
  }

  _fundEthFor(web3, senderAddr, recipient, amount, passphrase) {
    let gasPrice = this.config.gasPrice;
    let gas = this.config.gas;

    return web3.eth.sendTransaction({
      from: senderAddr,
      to: recipient,
      value: amount,
      gasPrice: gasPrice,
      gas: gas
    });
  }

  validate() {}
}

const program = PerformerBase.getProgram();
program.option('--data-dir [dataDir]', 'defaults to ./openst-setup/origin-geth/ Data directory of GETH');

program.on('--help', () => {
  console.log('');
  console.log('  Example:');
  console.log('');
  console.log('    node createAndFundKey.js --data-dir ./openst-setup/origin-geth');
  console.log('');
  console.log('');
});

program.parse(process.argv);

let performer = new Performer(program);
performer.perform();
