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

  static parseArguments(args) {
    if (!args instanceof Array) {
      return args;
    }
    let len = args.length;
    while (len--) {
      let a = args[len];
      //Check if JSON
      if ((a.indexOf('{') === 0 && a.indexOf('}') === a.length - 1) || (a.indexOf('[') === 0 && a.indexOf(']') === a.length - 1)) {
        try {
          console.log(a);
          args[len] = JSON.parse(a);
        } catch (e) {
          //Ignore.
          console.log('Error', e);
        }
      }
    }
    return args;
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
    console.info('\x1b[0m', '\x1b[32m', subject, '\x1b[0m', '\x1b[1m', message, '\x1b[0m');
  }

  /**
   * exitWithError() logs error message and exits the program.
   *
   * @param {string|object} error - Error object or error message.
   */
  static exitWithError(error) {
    if (error) {
      console.log('\n\n', '==========\x1b[31m ERROR \x1b[0m==========', '\n\n');
      Performer.logError(typeof error === 'string' ? error : error.message);
      console.log('\n\n', '==========\x1b[1m END-OF-PROGRAM \x1b[0m==========', '\n\n');
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
      console.log('\n\n', '==========\x1b[1m END-OF-PROGRAM \x1b[0m==========', '\n\n');
    }
    process.exit(0);
  }
}

let fileName = 'deployContract.js';
const program = require('commander')
  .usage('[constructor_arguments...] [options]')
  .option('-a, --abi <file>', 'Required. Path to smart-contract Abi file.')
  .option('-b, --bin <file>', 'Required. Path to smart-contract bin file.')
  .option('-c, --config <path to openst-setup folder>', 'defaults to ./openst-setup/config.json');

program.on('--help', function() {
  console.log('');
  console.log('');

  console.log('  \x1b[1m No Constructor Argument :\x1b[0m');
  console.log(
    `   $ node ${fileName} -a ./node_modules/\\@openstfoundation/openst.js/contracts/abi/MockToken.abi -b ./node_modules/\\@openstfoundation/openst.js/contracts/bin/MockToken.bin`
  );
  console.log('');
  console.log('');
  console.log('  \x1b[1m Multiple Constructor Arguments:\x1b[0m');
  console.log(
    `   $ node ${fileName} 0x00ebec794aa82bc98e753865a5ed9f339c8fd81d 0xe34d081dC576B04DDEDAf1087BB803dea256AE89 -a ./node_modules/\\@openstfoundation/openst.js/contracts/abi/TokenRules.abi -b ./node_modules/\\@openstfoundation/openst.js/contracts/bin/TokenRules.bin`
  );
  console.log('');
  console.log('');
  console.log('  \x1b[1m Single Constructor Argument:\x1b[0m');
  console.log(
    `   $ node ${fileName} 0xa502c51c8213A4e61Dc59dF914e252EB6354A8c0 -a ./node_modules/\\@openstfoundation/openst.js/contracts/abi/TransferRule.abi -b ./node_modules/\\@openstfoundation/openst.js/contracts/bin/TransferRule.bin`
  );
  console.log('');
  console.log('');
  console.log('  \x1b[1m Passing JSON Argument:\x1b[0m');
  console.log(
    `   $ node ${fileName} 0x00ebec794aa82bc98e753865a5ed9f339c8fd81d 0xa502c51c8213A4e61Dc59dF914e252EB6354A8c0 2 '["0xbba2c47be3add4fd302d9a8122442ca9d65ad9a3","0x39e76d2c955462674cd2dab10dbf46135dd2af24"]' -a ./node_modules/\\@openstfoundation/openst.js/contracts/abi/TokenHolder.abi -b ./node_modules/\\@openstfoundation/openst.js/contracts/bin/TokenHolder.bin`
  );

  console.log('');
  console.log('');
});

program.parse(process.argv);

let configPath = program.config || './openst-setup/config.json',
  contractArgs = Performer.parseArguments(program.args || []),
  abiInPath = program.abi,
  binInPath = program.bin;

let config = Performer.getSetupConfig(configPath),
  performer = new Performer(config, abiInPath, binInPath, contractArgs);

performer.deploy();
