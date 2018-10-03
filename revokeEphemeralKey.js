'use strict';

const program = require('commander');

program
  .option('-t, --token-holder-address [tokenHolderAddress]', 'TokenHolder contract address')
  .option('-e, --ephemeral-key-address [ephemeralKeyAddress]', 'Ephemeral key address')
  .option('-w, --wallet [wallet]', 'Wallet address')
  .parse(process.argv);

// TODO - validate here for the params

let tokenHolderAddress = program.tokenHolderAddress,
  ephemeralKeyAddress = program.ephemeralKeyAddress,
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
  .revokeSession(ephemeralKeyAddress)
  .send({
    from: wallet,
    gasPrice: config.gasPrice,
    gas: config.gas
  })
  .then(function(revokeSessionReceipt) {
    // TODO: check for event here. PR is not yet merged from contracts side.
    // if (revokeSessionReceipt.events.SessionAuthorizationSubmitted) {
    //   console.log('submitAuthorizeSession DONE!');
    // } else {
    //   console.log('Error in submitAuthorizeSession.');
    // }
  });
