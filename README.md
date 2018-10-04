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

## Economy Setup

### Deploy MockToken (EIP20)
```
  $ node deployMockToken.js
```

Copy the **MockToken Contract Address** printed in the logs in the command below in place of **0x123...**.

```
  $ eip20ContractAddress=0x123...
```

For more options use `$ node deployMockToken.js -h`


### Deploy TokenRules
```
  $ node deployTokenRules.js --eip20-address $eip20ContractAddress
```

Copy the **TokenRules Contract Address** printed in the logs in the command below in place of **0x123...**.

```
  $ tokenRulesContractAddress=0x123...
```

For more options use `$ node deployTokenRules.js -h`

### Deploy Custom Rule
```
  $ node deployContract.js --abi ./node_modules/@openstfoundation/openst.js/contracts/abi/TransferRule.abi --bin ./node_modules/@openstfoundation/openst.js/contracts/bin/TransferRule.bin $tokenRulesContractAddress

```

Copy the **Deployed Contract Address** printed in the logs in the command below in place of **0x123...**.

```
  $ customRuleContractAddress=0x123...
  $ ruleName=transfer
```

For more options use `$ node deployContract.js -h`

### Register Rule

```
  $ node registerRule.js --token-rules $tokenRulesContractAddress --rule $ruleName --address $customRuleContractAddress --abi ./node_modules/@openstfoundation/openst.js/contracts/abi/TransferRule.abi
```

## User Setup

### Deploy TokenHolder
Copy wallet addresses from `cat ./openst-setup/config.json` in the following commands.

```
  $ wallet1=0x123...
  $ wallet2=0x456...
  $ requirement=2
```
```
  $ node deployTokenHolder.js --eip20-address $eip20ContractAddress --token-rules $tokenRulesContractAddress --requirement $requirement --wallets $wallet1,$wallet2
```
Copy the **TokenHolder Contract Address** printed in the logs in the command below in place of **0x123...**.

```
  $ tokenHolderContractAddress=0x123...
```

For more options use `$ node deployTokenHolder.js -h`

### Create Ephemeral Key
Create a new account.
```
  $ node createEphemeralKey.js
```
Copy the **address** and **privateKey** printed in the logs in the command below in place of **0x123...** and **0x456...** respectively.
```
  $ ephemeralKey=0x123...
  $ ephemeralPrivateKey=0x456...
```

For more options use `$ node createEphemeralKey.js -h`

### Propose Ephemeral Key
```
  $ spendingLimit=1000000000000000000000000000
  $ expiryHeight=10000000000000
  $ node proposeEphemeralKey.js --token-holder $tokenHolderContractAddress --ephemeral-key $ephemeralKey --wallet $wallet1 --spending-limit $spendingLimit --expiration-height $expiryHeight
```

Copy the **transaction id** printed in the logs in the command below in place of **...**.
```
  $ proposeEphemeralKeyTransactionId=...
```

For more options use `$ node proposeEphemeralKey.js -h`

### Confirm Ephemeral Key
```
  $ node confirmEphemeralKey.js --token-holder $tokenHolderContractAddress --wallet $wallet2 --transaction-id $proposeEphemeralKeyTransactionId
```

For more options use `$ node confirmEphemeralKey.js -h`

### Propose Wallet Key
```
  $ newWallet=0x52e44f279f4203dcf680395379e5f9990a69f13c
  $ node proposeWalletKey.js --token-holder $tokenHolderContractAddress --wallet-to-propose $newWallet --wallet $wallet1
```

Copy the **transaction id** printed in the logs in the command below in place of **...**.
```
  $ proposeWalletKeyTransactionId=...
```

For more options use `$ node proposeWalletKey.js -h`

### Confirm Wallet Key
```
  $ node confirmWalletKey.js --token-holder $tokenHolderContractAddress --wallet $wallet2 --transaction-id $proposeWalletKeyTransactionId
```

For more options use `$ node confirmWalletKey.js -h`

### Propose Revoke Wallet Key
```
  $ node proposeRevokeWalletKey.js --token-holder $tokenHolderContractAddress --wallet-to-revoke $newWallet --wallet $wallet1
```

Copy the **transaction id** printed in the logs in the command below in place of **...**.

```
  $ proposeRevokeWalletKeyTransactionId=...
```

For more options use `$ node proposeRevokeWalletKey.js -h`

### Confirm Revoke Wallet Key
```
  $ node confirmRevokeWalletKey.js --token-holder $tokenHolderContractAddress --wallet $wallet2 --transaction-id $proposeRevokeWalletKeyTransactionId
```

For more options use `$ node confirmRevokeWalletKey.js -h`

### Fund Mock Token
```
  $ node fundMockToken.js --eip20-address $eip20ContractAddress --to-address $tokenHolderContractAddress --amount 100000000000000000000000
```

For more options use `$ node fundMockToken.js -h`

### Execute Rule
```
  $ dummyRecipient=0x52e44f279f4203dcf680395379e5f9990a69f13c
  $ node executeRule.js --token-holder $tokenHolderContractAddress --ephemeral-private-key $ephemeralPrivateKey --rule $ruleName --method transferFrom --method-args [\"$tokenHolderContractAddress\",\"$dummyRecipient\",1]
```

For more options use `$ node executeRule.js -h`

### Revoke Ephemeral Key
```
  $ node revokeEphemeralKey.js --token-holder $tokenHolderContractAddress --wallet $wallet2 --ephemeral-key $ephemeralKey
```

For more options use `$ node revokeEphemeralKey.js -h`