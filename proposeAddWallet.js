'use strict';

const program = require('commander');

program
  .option('-t, --token-holder-address [tokenHolderAddress]', 'TokenHolder contract address')
  .option('-p, --wallet-to-propose [walletToPropose]', 'Wallet to propose')
  .option('-w, --wallet [wallet]', 'Wallet address')
  .parse(process.argv);

// TODO - validate here for the params

let tokenHolderAddress = program.tokenHolderAddress,
  walletToPropose = program.walletToPropose,
  wallet = program.wallet;

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
  .submitAddWallet(walletToPropose)
  .send({
    from: wallet,
    gasPrice: config.gasPrice,
    gas: config.gas
  })
  .then(function(submitAddWalletReceipt) {
    if (submitAddWalletReceipt.events.WalletAdditionSubmitted) {
      console.log('submitAddWallet DONE!');

      let transactionId = submitAddWalletReceipt.events.WalletAdditionSubmitted.returnValues._transactionId;
      console.log('transactionId for submitAddWallet', transactionId);
    } else {
      console.log('Error in submitAddWallet.');
    }
  });
