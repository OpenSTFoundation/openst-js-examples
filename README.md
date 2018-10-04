# openst-js-examples

This repository contains an example usage of openst.js where we walk you through registering rules, adding users, adding wallets to users, revoking ephemeral keys and other functionality in the context of a token economy.

This example walks you through the


## Basic Set Up
In this section, we go through the environment setup required to get started with deploying contracts and interacting with them.

### NPM install
To ensure that you have all the files needed to run this node.js application, Install dependency packages.
```
  $ npm install
```

### Start Geth
To connect to ethereum, you'll need a client running. Here, we use Geth.
You could either start a fresh, new geth OR start an existing one (assuming one isn't already running)

In order to set up a new Geth, use the following command:
```
  $ node ./node_modules/\@openstfoundation/openst.js/tools/initDevEnv.js
```

Alternatively, to start an existing Geth:
```
  $ sh ./openst-setup/bin/run-chain.sh
```

## Economy Setup
The economy setup includes deploying a Token, the rules associated with the transactions in the economy, and the TokenRules contract which enforces the business rules defined in the Rule contracts.
### Deploy an EIP20 Token
The first step to getting a Token Economy started is to deploy a token to use as the currency of the economy.
Using the command below, you can deploy an EIP20 Token (currently, the MockToken)
```
  $ node deployMockToken.js
```

Please use the **MockToken Contract Address** printed in the logs and in the command below in place of **0x123...**.

```
  $ eip20ContractAddress=0x123...
```

For more options use `$ node deployMockToken.js -h`


### Deploy the TokenRules Contract
Every Token Economy needs a TokenRules contract that performs the transactions in accordance with the Rules registered in it by the Organization.

```
  $ node deployTokenRules.js --eip20-address $eip20ContractAddress
```

Use the **TokenRules Contract Address** printed in the logs in the command below in place of **0x123...**.

```
  $ tokenRulesContractAddress=0x123...
```

For documentation and options, use `$ node deployTokenRules.js -h`

### Deploy Transfer Rule
The TokenRules and Rule contracts are designed to enable an economy administrator to add rules that are aligned with their goals. Here, we deploy a simple TransferRule contract to enable transfers between economy participants.
```
  node deployContract.js --abi ./node_modules/@openstfoundation/openst.js/contracts/abi/TransferRule.abi --bin ./node_modules/@openstfoundation/openst.js/contracts/bin/TransferRule.bin $tokenRulesContractAddress

```

Use the **Deployed Contract Address** printed in the logs in the command below in place of **0x123...**.

```
  $ customRuleContractAddress=0x123...
  $ ruleName=transfer
```

For documentation and options, use `$ node deployContract.js -h`

### Register TransferRule
In order to Execute a rule that is payable, i.e transfers value between users in an economy, the Organization must register the Rule in the TokenRules contract.

```
  $ node registerRule.js --token-rules $tokenRulesContractAddress --rule $ruleName --address $customRuleContractAddress --abi ./node_modules/@openstfoundation/openst.js/contracts/abi/TransferRule.abi
```

## User Setup
An economy user needs to be able to hold tokens and sign transactions.
A TokenHolder contract simplifies this for end-user. The TokenHolder contract is a multi-sig contract with multiple ownership keys (wallets) that control the value and also multiple ephemeral keys that sign transactions.

### Deploy TokenHolder Contract
The Organization deploys a TokenHolder contract for each user.

To deploy the TokenHolder contract here, use wallet addresses from `cat ./openst-setup/config.json` in the following commands.

```
  $ wallet1=0x123...
  $ wallet2=0x456...
  $ requirement=2
```
```
  $ node deployTokenHolder.js --eip20-address $eip20ContractAddress --token-rules $tokenRulesContractAddress --requirement $requirement --wallets $wallet1,$wallet2
```
Use the **TokenHolder Contract Address** printed in the logs in the command below in place of **0x123...**.

```
  $ tokenHolderContractAddress=0x123...
```

For documentation and options, use `$ node deployTokenHolder.js -h`

### Create Ephemeral Key
The authorization of an Ephemeral key requires the creation of a key

```
  $ node createEphemeralKey.js
```
Use the **address** and **privateKey** printed in the logs in the command below in place of **0x123...** and **0x456...** respectively.
```
  $ ephemeralKey=0x123...
  $ ephemeralPrivateKey=0x456...
```

For documentation and options, use `$ node createEphemeralKey.js -h`

### Propose Ephemeral Key
In order for the ephermeral key to sign transaction, it must be approved by multiple wallets.
Here, one wallet proposes the authorization of the key created in the step above.
```
  $ spendingLimit=1000000000000000000000000000
  $ expiryHeight=10000000000000
  $ node proposeEphemeralKey.js --token-holder $tokenHolderContractAddress --ephemeral-key $ephemeralKey --wallet $wallet1 --spending-limit $spendingLimit --expiration-height $expiryHeight
```

Use the **transaction id** printed in the logs in the command below in place of **...**.
```
  $ proposeEphemeralKeyTransactionId=...
```

For documentation and options, use `$ node proposeEphemeralKey.js -h`

### Confirm Ephemeral Key
The second wallet that owns the TokenHolder contract confirms the proposal, thus authorizing the ephememal key to sign transactions.
```
  $ node confirmEphemeralKey.js --token-holder $tokenHolderContractAddress --wallet $wallet2 --transaction-id $proposeEphemeralKeyTransactionId
```

For documentation and options, use `$ node confirmEphemeralKey.js -h`

### Propose Wallet Key
If the human user that owns the TokhenHolder Contract via multiple wallets wants to add a new wallet, all existing wallets must approve the transaction to add the new Wallet.

Like in the case of ephermeral keys above, the multi-sig transaction takes the form of one Wallet proposing the addition as shown below.
```
  $ newWallet=0x52e44f279f4203dcf680395379e5f9990a69f13c
  $ node proposeWalletKey.js --token-holder $tokenHolderContractAddress --wallet-to-propose $newWallet --wallet $wallet1
```

Use the **transaction id** printed in the logs in the command below in place of **...**.
```
  $ proposeWalletKeyTransactionId=...
```

For documentation and options, use `$ node proposeWalletKey.js -h`

### Confirm Wallet Key
For the addition of the key, the other Wallet must confirm the transaction.
```
  $ node confirmWalletKey.js --token-holder $tokenHolderContractAddress --wallet $wallet2 --transaction-id $proposeWalletKeyTransactionId
```

For documentation and options, use `$ node confirmWalletKey.js -h`

### Propose Revoke Wallet Key
If the human user that owns the TokenHolder contract loses a Wallet, they can revoke its ownership relationship with the TokenHolder contract. To do so, one of the other Wallets must propose the revocation.

```
  $ node proposeRevokeWalletKey.js --token-holder $tokenHolderContractAddress --wallet-to-revoke $newWallet --wallet $wallet1
```

Use the **transaction id** printed in the logs in the command below in place of **...**.

```
  $ proposeRevokeWalletKeyTransactionId=...
```

For documentation and options, use `$ node proposeRevokeWalletKey.js -h`

### Confirm Revoke Wallet Key
And one other must confirm the revocation.

```
  $ node confirmRevokeWalletKey.js --token-holder $tokenHolderContractAddress --wallet $wallet2 --transaction-id $proposeRevokeWalletKeyTransactionId
```

For documentation and options, use `$ node confirmRevokeWalletKey.js -h`

### Fund Mock Token
To execute a transfer between, the Tok

```
  $ node fundMockToken.js --eip20-address $eip20ContractAddress --to-address $tokenHolderContractAddress --amount 100000000000000000000000
```

For documentation and options, use `$ node fundMockToken.js -h`

### Execute Rule
```
  $ dummyRecipient=0x52e44f279f4203dcf680395379e5f9990a69f13c
  $ node executeRule.js --token-holder $tokenHolderContractAddress --ephemeral-private-key $ephemeralPrivateKey --rule $ruleName --method transferFrom --method-args [\"$tokenHolderContractAddress\",\"$dummyRecipient\",1]
```

For documentation and options, use `$ node executeRule.js -h`

### Revoke Ephemeral Key
```
  $ node revokeEphemeralKey.js --token-holder $tokenHolderContractAddress --wallet $wallet2 --ephemeral-key $ephemeralKey
```

For documentation and options, use `$ node revokeEphemeralKey.js -h`
