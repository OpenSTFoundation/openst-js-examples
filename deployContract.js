'use strict';

/**
 * @fileoverview Nodejs Program to deploy ethereum smart contracts. See deploy method for sample code.
 * @author rachin@ost.com (Rachin Kapoor)
 */

const fs = require('fs');
const path = require('path');
const OpenST = require('@openstfoundation/openst.js');

class Performer {
  constructor(config, jsonInterfacePath, byteCodePath, contractArgs) {
    this.jsonInterface = this.buildAbi(jsonInterfacePath);
    this.byteCode = this.buildBin(byteCodePath);

    let provider = config.gethRpcEndPoint;

    //Create Object of openst.js.
    let openSt = new OpenST(provider);
    let web3 = openSt.web3();

    //Add Geth Signer Service so that we can unlock and sign using deployerAddress.
    let gethSigner = new openSt.utils.GethSignerService(web3);
    let passphrase = 'testtest';
    gethSigner.addAccount(config.deployerAddress, passphrase);
    openSt.signers.setSignerService(gethSigner);

    this.openSt = openSt;

    //Set the deployer params.
    this.deployParams = {
      from: config.deployerAddress,
      gasPrice: config.gasPrice,
      gas: config.gas
    };

    this.contractArgs = contractArgs;
  }

  deploy() {
    //1. Get web3 object from openst.
    let web3 = this.openSt.web3();

    //2. Create an instance of contract.
    let contract = new web3.eth.Contract(this.jsonInterface);

    //3. Deploy the contract.
    try {
      contract
        .deploy({
          data: this.byteCode,
          arguments: this.contractArgs || []
        })
        .send(this.deployParams)
        .on('receipt', (receipt) => {
          Performer.logReceipt(receipt);
          if (receipt.status && receipt.contractAddress) {
            Performer.exitWithoutError('Deployed Contract Address:', receipt.contractAddress);
          } else {
            Performer.exitWithError('Failed to deploy contract. See receipt for details.');
          }
        })
        .catch((reason) => {
          Performer.exitWithError(reason);
        });
    } catch (e) {
      Performer.logError(e);
      Performer.exitWithError('Failed to deploy contract. See error details.');
    }
  }

  buildAbi(abiInPath) {
    //Validate abiPath
    let abiPath = null;
    try {
      abiPath = path.resolve(abiInPath);
      let abiContent = fs.readFileSync(abiPath, { encoding: 'utf8' });
      let abi = JSON.parse(abiContent);
      return abi;
    } catch (e) {
      Performer.logError(e);
      let error = new Error('Invalid ABI Path: ' + (abiPath || abiInPath) + '\nPlease provide contract Abi using -a or --abi flag');
      Performer.exitWithError(error);
    }
  }

  buildBin(binInPath) {
    //Validate binPath
    let binPath;
    try {
      binPath = path.resolve(binInPath);
      let binContent = fs.readFileSync(binPath, { encoding: 'utf8' });

      if (binContent.indexOf('0x') !== 0) {
        binContent = '0x' + binContent;
      }

      return binContent;
    } catch (e) {
      Performer.logError(e);
      let error = new Error('Invalid BIN Path: ' + (binPath || binInPath) + '\nPlease provide contract Bin using -b or --bin flag');
      Performer.exitWithError(error);
    }
  }

  /**
   * getSetupConfig() returns the openst-setup config object
   * based on passed config file path.
   *
   * @param {string} configInPath - Required. Relative or absolute Path to config.json.
   * @return {object} openst-setup config object.
   */
  static getSetupConfig(configInPath) {
    let configPath = null;
    try {
      configPath = path.resolve(configInPath);
      return require(configPath);
    } catch (e) {
      Performer.logError(e);
      let error = new Error(
        'Invalid Config File Path: ' + (configPath || configInPath) + '\nPlease provide openst-setup/config.json path using -c or --config flag'
      );
      Performer.exitWithError(error);
    }
  }

  /**
   * logReceipt() logs etherium transaction receipt
   *
   * @param {object} receipt - Required. Etherium Transaction Receipt to be logged.
   */
  static logReceipt(receipt) {
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
  static logError(message) {
    console.error('\x1b[0m', '\x1b[31m', message, '\x1b[0m');
  }

  /**
   * logSuccess() logs success message.
   m
   * @param {string} subject - Subject of message to be logged.
   * @param {string} message - Success message to be logged.
   */
  static logSuccess(subject, message) {
    console.info('\x1b[0m', '\x1b[32m', subject, '\x1b[0m', '\x1b[34m', message, '\x1b[0m');
  }

  /**
   * exitWithError() logs error message and exits the program.
   *
   * @param {string|object} error - Error object or error message.
   */
  static exitWithError(error) {
    if (err) {
      console.log('\n\n', '==========\x1b[31m ERROR \x1b[0m==========', '\n\n');
      Performer.logError(typeof error === 'string' ? error : error.message);
      console.log('\n\n', '==========\x1b[31m END-OF-PROGRAM \x1b[0m==========', '\n\n');
    }

    process.exit(1);
  }

  /**
   * exitWithError() logs success message and exits the program.
   *
   * @param {string} subject - Subject of message to be logged.
   * @param {string} message - Success message to be logged.
   */
  static exitWithoutError(subject, message) {
    if (subject || message) {
      console.log('\n\n', '==========\x1b[32m SUCCESS \x1b[0m==========', '\n\n');
      Performer.logSuccess(subject, message);
      console.log('\n\n', '==========\x1b[34m END-OF-PROGRAM \x1b[0m==========', '\n\n');
    }
    process.exit(0);
  }
}

const program = require('commander')
  .option('-a, --abi <file>', 'Required. Path to smart-contract Abi file.')
  .option('-b, --bin <file>', 'Required. Path to smart-contract bin file.')
  .option('-c, --config <path to openst-setup folder>', 'defaults to ./openst-setup/config.json');

program.parse(process.argv);

let contractArgs = program.args || [],
  abiInPath = program.abi,
  binInPath = program.bin,
  configPath = program.config || './openst-setup/config.json',
  abiPath,
  binPath,
  abiContent,
  binContent,
  abi,
  bin;

let config = Performer.getSetupConfig(configPath),
  performer = new Performer(config, abiInPath, binInPath, contractArgs);

performer.deploy();
