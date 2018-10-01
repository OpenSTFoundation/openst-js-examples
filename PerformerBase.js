'use strict';

/**
 * @fileoverview This class is boilerplate for Example Programs. They should inherit from this class.
 * @author rachin@ost.com (Rachin Kapoor)
 */

const fs = require('fs');
const path = require('path');
const OpenST = require('@openstfoundation/openst.js');

class PerformerBase {
  constructor(program) {
    let configPath = program.config || './openst-setup/config.json',
      historyPath = program.history || './openst-setup/history.log';

    this.setHistoryArgs(program.rawArgs, historyPath);

    this.setConfigPath(configPath);
    let config = this.getSetupConfig();

    let provider = config.gethRpcEndPoint;
    //Create Object of openst.js.
    this.openST = new OpenST(provider);
    this.web3 = this.openST.web3();

    //Add Geth Signer Service so that we can unlock and sign using deployerAddress.
    let gethSigner = new this.openST.utils.GethSignerService(this.web3);
    let passphrase = 'testtest';
    gethSigner.addAccount(config.deployerAddress, passphrase);
    gethSigner.addAccount(config.organizationAddress, passphrase);
    gethSigner.addAccount(config.facilitator, passphrase);
    gethSigner.addAccount(config.chainOwnerAddress, passphrase);
    gethSigner.addAccount(config.opsAddress, passphrase);
    gethSigner.addAccount(config.wallet1, passphrase);
    gethSigner.addAccount(config.wallet2, passphrase);

    this.openST.signers.setSignerService(gethSigner);
  }

  setConfigPath(configInPath) {
    try {
      this.configPath = path.resolve(configInPath);
    } catch (e) {
      this.logError(e);
      let error = new Error(
        'Invalid Config File Path: ' + (configPath || this.configInPath) + '\nPlease provide openst-setup/config.json path using -c or --config flag'
      );
      this.exitWithError(error);
    }
  }
  /**
   * getSetupConfig() returns the openst-setup config object
   * based on passed config file path.
   *
   * @param {string} configInPath - Required. Relative or absolute Path to config.json.
   * @return {object} openst-setup config object.
   */
  getSetupConfig() {
    let configPath = null;
    try {
      configPath = path.resolve(this.configPath);
      return require(configPath);
    } catch (e) {
      this.logError(e);
      let error = new Error(
        'Invalid Config File Path: ' + (configPath || this.configPath) + '\nPlease provide openst-setup/config.json path using -c or --config flag'
      );
      this.exitWithError(error);
    }
  }

  setHistoryArgs(rawArgs, historyFilePath) {
    try {
      this.historyFilePath = path.resolve(historyFilePath);
    } catch (e) {
      this.logError(e);
      let error = new Error(
        'Invalid History File Path: ' + (this.historyFilePath || historyFilePath) + '\nPlease provide correct path using -h or --history flag'
      );
      this.exitWithError(error);
    }

    //Copy rawArgs & clean it.
    let args = Array.apply(null, rawArgs);
    //Remove node
    args.shift();
    //Push node
    args.unshift('node');

    let cmd = args.join(' ');

    this.logData = {
      cmd: cmd,
      start: new Date(),
      end: null,
      logs: [],
      success: false,
      output: null
    };
  }

  writeHistory() {
    if (!this.historyFilePath) {
      return;
    }
    this.logData['end'] = new Date();
    try {
      let content = '\n=====\n' + JSON.stringify(this.logData, null, 2);
      fs.writeFileSync(this.historyFilePath, content, {
        encoding: 'utf8',
        flag: 'a'
      });
    } catch (e) {
      //Ignore
    }
  }

  parseArguments(args) {
    if (!args instanceof Array) {
      return args;
    }
    let len = args.length;
    while (len--) {
      let a = args[len];
      //Check if JSON
      if ((a.indexOf('{') === 0 && a.indexOf('}') === a.length - 1) || (a.indexOf('[') === 0 && a.indexOf(']') === a.length - 1)) {
        try {
          args[len] = JSON.parse(a);
        } catch (e) {
          //Ignore.
          console.log('Error', e);
        }
      }
    }
    return args;
  }

  log(message) {
    this.logData['logs'].push(message);
    console.log(message);
  }

  /**
   * logReceipt() logs etherium transaction receipt
   *
   * @param {object} receipt - Required. Etherium Transaction Receipt to be logged.
   */
  logReceipt(receipt) {
    //Add to logs.
    this.logData['logs'].push('Transaction Receipt', JSON.stringify(receipt));

    let message = JSON.stringify(receipt, null, 1);
    if (receipt.status) {
      console.log('\n\n', '=====\x1b[32m Transaction Successful \x1b[0m=====', '\n\n');
    } else {
      console.log('\n\n', '=====\x1b[31m Transaction Failed \x1b[0m=====', '\n\n');
    }
    console.log('\x1b[2m', message, '\x1b[0m');
  }

  /**
   * logError() logs an error message.
   *
   * @param {string} message - Message to be logged.
   */
  logError(message) {
    console.error('\x1b[0m', '\x1b[31m', message, '\x1b[0m');
  }

  /**
   * logSuccess() logs success message.
   m
   * @param {string} subject - Subject of message to be logged.
   * @param {string} message - Success message to be logged.
   */
  logSuccess(subject, message) {
    console.info('\x1b[0m', '\x1b[32m', subject, '\x1b[0m', '\x1b[1m', message, '\x1b[0m');
  }

  /**
   * exitWithError() logs error message and exits the program.
   *
   * @param {string|object} error - Error object or error message.
   */
  exitWithError(error) {
    let message = typeof error === 'string' ? error : error.message;
    if (error) {
      console.log('\n\n', '==========\x1b[31m ERROR \x1b[0m==========', '\n\n');
      this.logError(message);
    }

    //Update the history log.
    this.logData['success'] = false;
    this.logData['output'] = {
      message: message,
      error: error
    };
    this.writeHistory();

    console.log('\n\n', '==========\x1b[1m END-OF-PROGRAM \x1b[0m==========', '\n\n');
    process.exit(1);
  }

  /**
   * exitWithError() logs success message and exits the program.
   *
   * @param {string} subject - Subject of message to be logged.
   * @param {string} message - Success message to be logged.
   */
  exitWithoutError(subject, message) {
    if (subject || message) {
      console.log('\n\n', '==========\x1b[32m SUCCESS \x1b[0m==========', '\n\n');
      this.logSuccess(subject, message);
    }

    //Update the history log.
    this.logData['success'] = true;
    this.logData['output'] = {
      subject: subject,
      message: message
    };
    this.writeHistory();

    console.log('\n\n', '==========\x1b[1m END-OF-PROGRAM \x1b[0m==========', '\n\n');
    process.exit(0);
  }
}

module.exports = PerformerBase;
