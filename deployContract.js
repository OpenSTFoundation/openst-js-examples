'use strict';

/**
 * @fileoverview Nodejs Program to deploy ethereum smart contracts. See deploy method for sample code.
 * @author rachin@ost.com (Rachin Kapoor)
 */

const fs = require('fs');
const path = require('path');
const PerformerBase = require('./PerformerBase');

class Performer extends PerformerBase {
  constructor(program) {
    super(program);
    let config = this.getSetupConfig();
    let openST = this.openST;

    let contractArgs = this.parseArguments(program.args || []),
      jsonInterfacePath = program.abi,
      byteCodePath = program.bin;

    this.jsonInterface = this.buildAbi(jsonInterfacePath);
    this.byteCode = this.buildBin(byteCodePath);

    //Set the deployer params.
    this.deployParams = {
      from: config.deployerAddress,
      gasPrice: config.gasPrice,
      gas: config.gas
    };

    this.contractArgs = contractArgs;
  }

  deploy() {
    //1. Get web3 object from openST.
    let web3 = this.openST.web3();

    //2. Create an instance of contract.
    let contract = new web3.eth.Contract(this.jsonInterface);

    //3. Deploy the contract.
    try {
      this.log('Deploying Contract.');
      contract
        .deploy({
          data: this.byteCode,
          arguments: this.contractArgs || []
        })
        .send(this.deployParams)
        .on('receipt', (receipt) => {
          this.logReceipt(receipt);
          if (receipt.status && receipt.contractAddress) {
            this.exitWithoutError('Deployed Contract Address:', receipt.contractAddress);
          } else {
            this.exitWithError('Failed to deploy contract. See receipt for details.');
          }
        })
        .catch((reason) => {
          this.exitWithError(reason);
        });
    } catch (e) {
      this.logError(e);
      this.exitWithError('Failed to deploy contract. See error details.');
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
      this.logError(e);
      let error = new Error('Invalid ABI Path: ' + (abiPath || abiInPath) + '\nPlease provide contract Abi using -a or --abi flag');
      this.exitWithError(error);
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
      this.logError(e);
      let error = new Error('Invalid BIN Path: ' + (binPath || binInPath) + '\nPlease provide contract Bin using -b or --bin flag');
      this.exitWithError(error);
    }
  }
}

let fileName = 'deployContract.js';
const program = require('commander')
  .usage('[constructor_arguments...] [options]')
  .option('-a, --abi <file>', 'Required. Path to smart-contract Abi (Application Binary Interface) file.')
  .option('-b, --bin <file>', 'Required. Path to smart-contract Bin (Binary) file.')
  .option('-h, --history <file>', 'defaults to ./openst-setup/history.log. Path to history.log file. You can always lookup history for address and logs.')
  .option('-c, --config <file>', 'defaults to ./openst-setup/config.json. Path to openst-setup config.json file.');

program.on('--help', function() {
  console.log('');
  console.log('');

  console.log('  \x1b[1m Deploy contract without any constructor arguments :\x1b[0m');
  console.log(
    `   $ node ${fileName} -a ./node_modules/\\@openstfoundation/openst.js/contracts/abi/MockToken.abi -b ./node_modules/\\@openstfoundation/openst.js/contracts/bin/MockToken.bin`
  );
  console.log('');
  console.log('');
  console.log('  \x1b[1m Deploy contract with multiple constructor arguments:\x1b[0m');
  console.log(
    `   $ node ${fileName} 0x00ebec794aa82bc98e753865a5ed9f339c8fd81d 0xe34d081dC576B04DDEDAf1087BB803dea256AE89 \x1b[2m -a ./node_modules/\\@openstfoundation/openst.js/contracts/abi/TokenRules.abi -b ./node_modules/\\@openstfoundation/openst.js/contracts/bin/TokenRules.bin \x1b[0m`
  );
  console.log('');
  console.log('');
  console.log('  \x1b[1m Deploy contract with single constructor argument:\x1b[0m');
  console.log(
    `   $ node ${fileName} 0xa502c51c8213A4e61Dc59dF914e252EB6354A8c0 \x1b[2m -a ./node_modules/\\@openstfoundation/openst.js/contracts/abi/TransferRule.abi -b ./node_modules/\\@openstfoundation/openst.js/contracts/bin/TransferRule.bin \x1b[0m`
  );
  console.log('');
  console.log('');
  console.log('  \x1b[1m Deploy contract with an argument of type array:\x1b[0m');
  console.log(
    `   $ node ${fileName} \x1b[2m 0x00ebec794aa82bc98e753865a5ed9f339c8fd81d 0xa502c51c8213A4e61Dc59dF914e252EB6354A8c0 2 \x1b[0m\x1b[1m '["0xbba2c47be3add4fd302d9a8122442ca9d65ad9a3","0x39e76d2c955462674cd2dab10dbf46135dd2af24"]' \x1b[0m\x1b[2m -a ./node_modules/\\@openstfoundation/openst.js/contracts/abi/TokenHolder.abi -b ./node_modules/\\@openstfoundation/openst.js/contracts/bin/TokenHolder.bin \x1b[0m`
  );

  console.log('');
  console.log('');
});

program.parse(process.argv);

let performer = new Performer(program);
performer.deploy();
