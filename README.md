# openst-js-examples

### NPM install
Install dependency packages.
```
  $ npm install
```

### Start Geth
Option 1 - Do a fresh setup.
```
  $ node ./node_modules/\@openstfoundation/openst.js/tools/initDevEnv.js 
```

Option 2 - Start existing Geth, if not already running.
```
  $ sh ./openst-setup/bin/run-chain.sh
```

### Deploy MockToken (ERC20)
* Command
```
  $ node deployMockToken.js
```

* Copy the **MockToken Contract Address** printed in the logs in the command below in place of **0x123...**.
```
  $ erc20ContractAddress=0x123...
```

### Deploy TokenRules
* Command
```
  $ node deployTokenRules.js --erc20-address $erc20ContractAddress
```

* Usage
```  
  $ deployTokenRules [options]
  
  Options:

    -h, --help                            output usage information
    -l, --log <file>                      defaults to ./openst-setup/history.log. Path to history.log file. You can always lookup history for address and logs.
    -c, --config <file>                   defaults to ./openst-setup/config.json. Path to openst-setup config.json file.
    --erc20-address [erc20Address]        Required. ERC20 Token contract address
    --org-address [Organisation Address]  defaults to config.organizationAddress. Organisation key address
```

* Copy the **TokenRules Contract Address** printed in the logs in the command below in place of **0x123...**.
```
  $ tokenRulesContractAddress=0x123...
```

* Deploy Transfer Rule
```
  node deployContract.js --abi ./node_modules/@openstfoundation/openst.js/contracts/abi/TransferRule.abi --bin ./node_modules/@openstfoundation/openst.js/contracts/bin/TransferRule.bin 0x29cd4E263EFBb2DF4abf237A64394bAf8822eC4c

```

* Register Rule

```
  node registerRule.js --token-rules 0xC8fA993e4ddF41458FA7b498AEbD5Bb9F840d320 --rule transfer --address 0x80016bA973dbe91395157CA97D7abF9Ca00CC553 --abi ./node_modules/@openstfoundation/openst.js/contracts/abi/TransferRule.abi
```

* Deploy TokenHolder
```
  node deployTokenHolder.js --erc20-address 0x7CeB0bC15B7d34f9C26A35A2a0ed6c6308A9827b --token-rules 0xC8fA993e4ddF41458FA7b498AEbD5Bb9F840d320 --requirement 2 --wallets "0xe7817ce78558ca0e43f11a975acc6027eb845a5a,0xd9fd651481ec1efd62898686ab41b56b0e8f18d3"
```

* Propose Ephemeral Key
```
  node proposeEphemeralKey.js --token-holder 0xFCA1f6b834b5b99f0dB7Fe6586e3dfaAB4C60121 --ephemeral-key 0x2d803d6644a2b54212cf273f89ea6fa6f8355976 --wallet 0xe7817ce78558ca0e43f11a975acc6027eb845a5a --spending-limit 1000000000000000000000000000 --expiration-height 10000000000000
```

* Confirm Ephemeral Key
```
  node confirmEphemeralKey.js --token-holder 0xFCA1f6b834b5b99f0dB7Fe6586e3dfaAB4C60121 --wallet 0xd9fd651481ec1efd62898686ab41b56b0e8f18d3 --transaction-id 0
```

* Propose Wallet Key
```
  node proposeWalletKey.js --token-holder 0xFCA1f6b834b5b99f0dB7Fe6586e3dfaAB4C60121 --wallet-to-propose 0x52e44f279f4203dcf680395379e5f9990a69f13c --wallet 0xe7817ce78558ca0e43f11a975acc6027eb845a5a
```

* Confirm Wallet Key
```
  node confirmWalletKey.js --token-holder 0xFCA1f6b834b5b99f0dB7Fe6586e3dfaAB4C60121 --wallet 0xd9fd651481ec1efd62898686ab41b56b0e8f18d3 --transaction-id 1
```

* Propose Revoke Wallet Key
```
  node proposeRevokeWalletKey.js --token-holder 0xFCA1f6b834b5b99f0dB7Fe6586e3dfaAB4C60121 --wallet-to-revoke 0x52e44f279f4203dcf680395379e5f9990a69f13c --wallet 0xe7817ce78558ca0e43f11a975acc6027eb845a5a
```

* Confirm Revoke Wallet Key
```
  node confirmRevokeWalletKey.js --token-holder 0xFCA1f6b834b5b99f0dB7Fe6586e3dfaAB4C60121 --wallet 0xd9fd651481ec1efd62898686ab41b56b0e8f18d3 --transaction-id 2
```

* Revoke Ephemeral Key
```
  node revokeEphemeralKey.js --token-holder 0xFCA1f6b834b5b99f0dB7Fe6586e3dfaAB4C60121 --wallet 0xd9fd651481ec1efd62898686ab41b56b0e8f18d3 --ephemeral-key 0x2d803d6644a2b54212cf273f89ea6fa6f8355976
```

* Execute Rule
```
  node executeRule.js --token-holder 0xFCA1f6b834b5b99f0dB7Fe6586e3dfaAB4C60121 --ephemeral-private-key 0x9db95f8c2cad4e69f734b210435028a0f0a079ddb885413035c21aebc93a4b38 --rule transfer --method transferFrom --method-args '["0x8c74004d0687140f29CE6c1da126ae0dd948e126", "0x52bc44d5378309ee2abf1539bf71de1b7d7be3b5", 1]'
```

* Fund Mock Token
```
  node fundMockToken.js --erc20-address 0x7CeB0bC15B7d34f9C26A35A2a0ed6c6308A9827b --to-address 0xFCA1f6b834b5b99f0dB7Fe6586e3dfaAB4C60121 --amount 100000000000000000000000
```

### Create and fund key
Create a new account and fund it with some ETH.
```
  Usage:
  $ node createAndFundKey [options]

  Options:

    -h, --help            output usage information
    -l, --log <file>      defaults to ./openst-setup/history.log. Path to history.log file. You can always lookup history for address and logs.
    -c, --config <file>   defaults to ./openst-setup/config.json. Path to openst-setup config.json file.
    --data-dir [dataDir]  Data directory of GETH


  Example:

    node createAndFundKey.js --data-dir ./openst-setup/origin-geth
```