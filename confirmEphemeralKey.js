'use strict';

const program = require('commander');

program
  .option('-t, --token-holder-address [tokenHolderAddress]', 'TokenHolder contract address')
  .option('-w, --wallet [wallet]', 'Wallet address')
  .option('-i, --transaction-id [transactionId]', 'Transaction id')
  .parse(process.argv);

// TODO - validate here for the params

let tokenHolderAddress = program.tokenHolderAddress,
  wallet = program.wallet,
  transactionId = program.transactionId;

const os = require('os');
let configFilePath = os.homedir() + '/openst-setup/config.json';

let config = require(configFilePath),
  provider = config.gethRpcEndPoint,
  passphrase = 'testtest';

const OpenST = require('@openstfoundation/openst.js');
let openST = new OpenST(provider);

let tokenHolder = new openST.contracts.TokenHolder(tokenHolderAddress);

console.log('* submitAuthorizeSession from wallet:', wallet);

let gethSigner = new openST.utils.GethSignerService(openST.web3());
gethSigner.addAccount(wallet, passphrase);
openST.signers.setSignerService(gethSigner);

// Authorize an ephemeral public key
tokenHolder
  .confirmTransaction(transactionId)
  .send({
    from: wallet,
    gasPrice: config.gasPrice,
    gas: config.gas
  })
  .then(function(confirmTransactionResponse) {
    if (confirmTransactionResponse.events.TransactionConfirmed) {
      console.log('confirmTransaction DONE!');
    } else {
      console.log('Error in confirmTransaction.');
    }
  });
