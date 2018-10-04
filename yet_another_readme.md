 
### 1. Deploy Mock Token
* Command

``` 
node deployMockToken.js


```

  * Note down output


```
erc20=0x756C6eC80c8E360E297Ab58be31F219946F2d615


```

### 2. Deploy Token Rules
* Command

``` 
node deployTokenRules.js --erc20-address $erc20


```
* Note down output

```
tokenRule=0xe98131296C3dF62B62f0d14addd010F6e8fE3FE2


```



### 3. Deploy Custom Token Rule (Transfer Rule). 
* Command

```
node deployContract.js $erc20 $tokenRule  --abi ./node_modules/\@openstfoundation/openst.js/contracts/abi/TokenRules.abi --bin ./node_modules/\@openstfoundation/openst.js/contracts/bin/TokenRules.bin


```

* Note down output

```
transferRule=0x0E9f232eA36fc93Ccb0a15931335E5193b5ffd00


```

### 4. Register Custom Token Rule (Transfer Rule). 
* Command

```
ruleName=transferFrom
node registerRule.js --token-rules $tokenRule --abi ./node_modules/\@openstfoundation/openst.js/contracts/abi/TransferRule.abi --rule $ruleName --address $transferRule


```


### 5. Create Token Holder. 
* Read Wallets from ./openst-setup/config.json

```
wallet1=0xfbf95f640cd2dd4d0ae3d2878a9355d0eff3f247
wallet2=0xaf1f87c5a1453a0d05419c8f4041e1c908ec78f4


```
* Deploy TokenHolder

```
node deployTokenHolder.js --erc20-address $erc20 --token-rules $tokenRule --requirement 2 --wallets $wallet1,$wallet2


```

* Note down output


```
tokenHolder=0x3786eEfdAE809B27F556d9902a4061d77b98cc33


```


### 6. Propose Ephimeral Key
* Sample Ephimeral Key

```
epPrivateKey=0xa22406590d4fdde9d05156c3960d2313d68a0b72eab5a12ccfd634fb6ce203ff
epKeyAddress=0xaeaf65fc04b6402d8171b0e6b94412190d2d077d


```

* Propose Ephemeral Key

```
node proposeEphemeralKey.js --token-holder $tokenHolder --wallet $wallet1 --spending-limit 1000000000000000000000 --expiration-height 1000000000000000000000 --ephemeral-key $epKeyAddress

```

* Note Down Output

```
proposeTxId=0


```

### 7. Confirm Ephemeral Key

```
node confirmEphemeralKey.js --token-holder $tokenHolder --wallet $wallet2 --transaction-id proposeTxId


```

### 8. Execute Rule
* Prepare Data

```
ruleMethodName=transferFrom
#Read Organization Address from ./openst-setup/config.json
organizationAddress=0x6faea61ad509385cf455002d20e4bee058d5dbfa


```
* Execute Rule.

```
node executeRule.js --token-holder $tokenHolder --rule $ruleName --method $ruleMethodName --ephemeral-private-key $epPrivateKey --method-args [\"$tokenHolder\",\"$organizationAddress\",\"1000000000\"]


```

