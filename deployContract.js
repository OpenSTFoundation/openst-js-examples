'use strict';

const fs = require('fs');
const path = require('path');
const OpenST = require('@openstfoundation/openst.js');

class Performer {
  constructor(configPath, jsonInterfacePath, byteCodePath, contractArgs) {
    this.jsonInterface = this.buildAbi(jsonInterfacePath);
    this.byteCode = this.buildBin(byteCodePath);

    let config = this.getSetupConfig(configPath),
      provider = config.gethRpcEndPoint;

    //Create Object of openst.js and access web3 object.
    let openSt = new OpenST(provider);
    let web3 = (this.web3 = openSt.web3());

    //Add Geth Signer Service so that we can unlock and sign using deployerAddress.
    let gethSigner = new openSt.utils.GethSignerService(web3);
    let passphrase = 'testtest';
    gethSigner.addAccount(config.deployerAddress, passphrase);
    openSt.signers.setSignerService(gethSigner);

    //Set the deployer params.
    this.deployParams = {
      from: config.deployerAddress,
      gasPrice: config.gasPrice,
      gas: config.gas
    };

    this.contractArgs = contractArgs;
  }

  deploy() {
    let contract = new this.web3.eth.Contract(this.jsonInterface);
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

  static logReceipt(receipt) {
    let message = JSON.stringify(receipt, null, 1);

    if (receipt.status) {
      console.log(
        '\n\n',
        '===========================\x1b[32m Transaction Successful \x1b[0m===========================',
        '\n\n'
      );
    } else {
      console.log(
        '\n\n',
        '==============================\x1b[31m Transaction Failed \x1b[0m============================',
        '\n\n'
      );
    }
    console.log('\x1b[2m', message, '\x1b[0m');
  }

  static logError(message) {
    console.error('\x1b[0m', '\x1b[31m', message, '\x1b[0m');
  }

  static logSuccess(subject, message) {
    console.info('\x1b[0m', '\x1b[32m', subject, '\x1b[0m', '\x1b[34m', message, '\x1b[0m');
  }

  static exitWithError(err) {
    if (err) {
      console.log(
        '\n\n',
        '==============================\x1b[31m ERROR \x1b[0m=======================================',
        '\n\n'
      );
      Performer.logError(typeof err === 'string' ? err : err.message);
      console.log('\n\n', '============================== END-OF-PROGRAM ==============================', '\n\n');
    }

    process.exit(1);
  }

  static exitWithoutError(subject, message) {
    if (subject || message) {
      console.log(
        '\n\n',
        '==============================\x1b[32m SUCCESS \x1b[0m=====================================',
        '\n\n'
      );
      Performer.logSuccess(subject, message);
      console.log(
        '\n\n',
        '==============================\x1b[34m END-OF-PROGRAM \x1b[0m==============================',
        '\n\n'
      );
    }
    process.exit(0);
  }

  getSetupConfig(configInPath) {
    let configPath = null;
    try {
      configPath = path.resolve(configInPath);
      return require(configPath);
    } catch (e) {
      Performer.logError(e);
      let error = new Error(
        'Invalid Config File Path: ' +
          (configPath || configInPath) +
          '\nPlease provide openst-setup/config.json path using -c or --config flag'
      );
      Performer.exitWithError(error);
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
      let error = new Error(
        'Invalid ABI Path: ' + (abiPath || abiInPath) + '\nPlease provide contract Abi using -a or --abi flag'
      );
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
      let error = new Error(
        'Invalid BIN Path: ' + (binPath || binInPath) + '\nPlease provide contract Bin using -b or --bin flag'
      );
      Performer.exitWithError(error);
    }
  }
}

const program = require('commander')
  .option('-a, --abi <file>')
  .option('-b, --bin <file>')
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

let performer = new Performer(configPath, abiInPath, binInPath, contractArgs);
performer.deploy();
