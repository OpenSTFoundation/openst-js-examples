# openst-js-examples

* NPM INSTALL
```
  npm install


```

* Fresh Setup
```
  node ./node_modules/\@openstfoundation/openst.js/tools/initDevEnv.js 


```

OR

* Using Existing Setup (Start Geth)
```
  sh ./openst-setup/bin/run-chain.sh


```

* Create and fund key
```
  node createAndFundKey.js --data-dir ./openst-setup/origin-geth
```


* Deploy MockToken (ERC20)
```
  node deployMockToken.js


```

* Deploy TokenRules
```
  node deployTokenRules.js --erc20-address 0x2c29c3E4D290Fc6c544A66d4D463e867c0210adE


```

* Deploy Transfer Rule
```
  node deployContract.js --abi ./node_modules/@openstfoundation/openst.js/contracts/abi/TransferRule.abi --bin ./node_modules/@openstfoundation/openst.js/contracts/bin/TransferRule.bin 0x29cd4E263EFBb2DF4abf237A64394bAf8822eC4c


```

* Register Rule

```

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

