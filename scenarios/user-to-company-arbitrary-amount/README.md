# Arbitrary Amount Example

```
  npm install
  node ./node_modules/\@openstfoundation/openst.js/tools/initDevEnv.js
```

## Economy Setup
### Deploy an EIP20 Token
```
  node deployMockToken.js
```

Please use the **MockToken Contract Address** printed in the logs and in the command below in place of **0x123...**.

```
  eip20ContractAddress=0x123...
```

### Deploy the TokenRules Contract
```
  node deployTokenRules.js --eip20-address $eip20ContractAddress
```

Use the **TokenRules Contract Address** printed in the logs in the command below in place of **0x123...**.

```
  tokenRulesContractAddress=0x123...
```

### Deploy Donation Rule
```
  reserveAddress=0x52e44f279f4203dcf680395379e5f9990a69f13c
  node deployContract.js --abi ./scenarios/user-to-company-arbitrary-amount/Donation.abi --bin ./scenarios/user-to-company-arbitrary-amount/Donation.bin $tokenRulesContractAddress $reserveAddress

```

Use the **Deployed Contract Address** printed in the logs in the command below in place of **0x123...**.

```
  customRuleContractAddress=0x123...
  ruleName=donation
  method=donate
```

### Register TransferRule
```
  node registerRule.js --token-rules $tokenRulesContractAddress --rule $ruleName --address $customRuleContractAddress --abi ./scenarios/user-to-company-arbitrary-amount/Donation.abi
```

## User Setup
### Deploy TokenHolder Contract
To deploy the TokenHolder contract here, use wallet addresses from `cat ./openst-setup/config.json` in the following commands.

```
  wallet1=0x123...
  wallet2=0x456...
  requirement=2

  node deployTokenHolder.js --eip20-address $eip20ContractAddress --token-rules $tokenRulesContractAddress --requirement $requirement --wallets $wallet1,$wallet2
```
Use the **TokenHolder Contract Address** printed in the logs in the command below in place of **0x123...**.

```
  tokenHolderContractAddress=0x123...
```

### Create Ephemeral Key
```
  node createEphemeralKey.js
```
Use the **address** and **privateKey** printed in the logs in the command below in place of **0x123...** and **0x456...** respectively.
```
  ephemeralKey=0x123...
  ephemeralPrivateKey=0x456...
```

### Propose Ephemeral Key
```
  spendingLimit=1000
  expiryHeight=10000000000000
  node proposeEphemeralKey.js --token-holder $tokenHolderContractAddress --ephemeral-key $ephemeralKey --wallet $wallet1 --spending-limit $spendingLimit --expiration-height $expiryHeight
```

Use the **transaction id** printed in the logs in the command below in place of **...**.
```
  proposeEphemeralKeyTransactionId=...
```

### Confirm Ephemeral Key
```
  node confirmEphemeralKey.js --token-holder $tokenHolderContractAddress --wallet $wallet2 --transaction-id $proposeEphemeralKeyTransactionId
```

### Fund Mock Token
To execute a donation rule, the TokenHolder contract must hold Tokens.
To fund the contract with some tokens, use the following.

```
  node fundMockToken.js --eip20-address $eip20ContractAddress --to-address $tokenHolderContractAddress --amount 100000000000000000000
```
### Execute Donation Rule
To execute the Donation from the TokenHolder to a reserveAddress, use the following snippet

```
  donationValue=1000
  node executeRule.js --token-holder $tokenHolderContractAddress --ephemeral-private-key $ephemeralPrivateKey --rule $ruleName --method $method --method-args "[$donationValue]"
```

### Check Balance
```
  node balanceOfMockToken.js --eip20-address $eip20ContractAddress --address $tokenHolderContractAddress
  node balanceOfMockToken.js --eip20-address $eip20ContractAddress --address $reserveAddress
```

- sign by ephemeral key which is expired
- sign by 