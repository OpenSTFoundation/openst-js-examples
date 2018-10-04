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
    let openST = this.openST;
    let web3 = openST.web3();
    let account = web3.eth.accounts.create();
    this.exitWithoutError('New Ephemeral Key Details\n', account);
  }

  validate() {}
}

const program = PerformerBase.getProgram();

program.parse(process.argv);

let performer = new Performer(program);
performer.perform();
