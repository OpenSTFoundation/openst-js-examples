# openst-js-examples

1. NPM INSTALL
```
  npm install


```

2.a. Fresh Setup
```
  node ./node_modules/\@openstfoundation/openst.js/tools/initDevEnv.js 


```

OR

2.b. Using Existing Setup (Start Geth)
```
  sh ./openst-setup/bin/run-chain.sh


```


3. Deploy MockToken (ERC20)
```
  node deployMockToken.js


```

4. Deploy Token Rules
```
  node deployTokenRules.js -e 0x2c29c3E4D290Fc6c544A66d4D463e867c0210adE


```

5. Deploy Transfer Rule
```
  node deployContract.js -a ./node_modules/@openstfoundation/openst.js/contracts/abi/TransferRule.abi -b ./node_modules/@openstfoundation/openst.js/contracts/bin/TransferRule.bin 0x29cd4E263EFBb2DF4abf237A64394bAf8822eC4c


```

6. Register Rule
