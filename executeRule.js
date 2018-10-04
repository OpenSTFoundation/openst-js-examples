'use strict';

/**
 * @fileoverview Nodejs Program to execute custom rule using ephemeral-key.
 * See perform() method for sample code.
 * Contract: https://github.com/OpenSTFoundation/openst-contracts/blob/v0.9.4/contracts/TokenRules.sol
 * @author rachin@ost.com (Rachin Kapoor)
 */
const PerformerBase = require('./PerformerBase');
class Performer extends PerformerBase {
  constructor(program) {
    super(program);

    let openST = this.openST;
    this.tokenHolder = program.tokenHolder;
    this.rule = program.rule;
    this.address = program.address;
    this.method = program.method;
    this.methodArgs = this.buildMethodArgs(program.methodArgs);
    this.ephemeralKeyAccount = this.buildEphemeralKeyAccount(program.ephemeralPrivateKey);
    this.validate();
  }

  async perform() {
    const oThis = this;

    let openST = this.openST;
    let web3 = openST.web3();
    let config = this.getSetupConfig();

    let tokenHolderAddress = this.tokenHolder;
    let customRuleName = this.rule;
    let customRuleAddress = this.address;
    let customRuleMethodName = this.method;
    let customMethodArgs = this.methodArgs;
    let ephemeralKeyAccount = this.ephemeralKeyAccount;

    //1. Get TokenRulesAddress
    let tokenHolder = new openST.contracts.TokenHolder(tokenHolderAddress);
    let tokenRulesAddress = await this.getTokenRules(tokenHolder);

    //2. Get The Custom Rule
    let customRuleContract = await this.getRule(tokenRulesAddress, customRuleName);
    let customRuleContractAddress = customRuleContract.options.address;

    //3. Get Transaction Encoded ABI
    let txData = this.getTransactionData(customRuleContract, customRuleMethodName, customMethodArgs);

    //4. Get Ephemeral Key Nonce
    let keyNonce = await this.getEphemeralKeyNonce(tokenHolder, ephemeralKeyAccount.address);

    //5. Get EIP1077 call prefix of executeRule
    let callPrefix = await this.getExecuteRuleCallPrefix(tokenHolder);

    //6. Create tx
    let tx = {
      from: tokenHolderAddress,
      to: customRuleContractAddress,
      data: txData,
      callPrefix: callPrefix,
      gas: 0,
      gasPrice: 0,
      nonce: keyNonce,
      value: 0
    };

    //7. Generate EIP1077 Signature. signEIP1077Transaction is a custom method added by openst.js.
    let signedTxData = ephemeralKeyAccount.signEIP1077Transaction(tx);

    //8. Execute the rule.
    tokenHolder
      .executeRule(customRuleContractAddress, txData, keyNonce, signedTxData.v, signedTxData.r, signedTxData.s)
      .send({
        from: config.facilitator,
        gasPrice: config.gasPrice,
        gas: config.gas
      })
      .then((receipt) => {
        this.logReceipt(receipt);
        if (receipt.status) {
          if (receipt.events.RuleExecuted.returnValues._status) {
            this.exitWithoutError('Rule Execution Success.');
          } else {
            this.exitWithError('Rule Execution Failed. Receipt status is true. But execution status is false.');
          }
        } else {
          this.exitWithError('Rule Execution Failed. Receipt status is false.');
        }
      })
      .catch((reason) => {
        this.logError(reason);
        this.exitWithError('Failed to execute rule. See error for details.');
      });
  }

  getTokenRules(tokenHolder) {
    const oThis = this;
    return tokenHolder
      .tokenRules()
      .call({})
      .catch((reason) => {
        oThis.logError(reason);
        oThis.exitWithError('Failed to get TokenRules Contract Address. See error for more details.');
      });
  }

  getRule(tokenRulesAddress, ruleName) {
    const oThis = this;
    let openST = this.openST;
    let tokenRules = new openST.contracts.TokenRules(tokenRulesAddress);

    return tokenRules.getRule(ruleName).catch((reason) => {
      oThis.logError(reason);
      oThis.exitWithError('Failed to get Custom Rule. See error for details.');
    });
  }

  getTransactionData(contract, customRuleMethodName, methodArgs) {
    let methodScope = contract.methods;
    let method = methodScope[customRuleMethodName];

    try {
      let tx = method.apply(methodScope, methodArgs);
      return tx.encodeABI();
    } catch (error) {
      oThis.logError(error);
      oThis.exitWithError('Failed to generate encodedABI. See error for details');
    }
  }

  getEphemeralKeyNonce(tokenHolder, keyAddress) {
    let openST = this.openST;
    let web3 = openST.web3();
    return tokenHolder
      .ephemeralKeys(keyAddress)
      .call({})
      .then((ephemeralKeyData) => {
        let bnNonce = web3.utils.toBN(ephemeralKeyData[1]);
        let bnIncriment = web3.utils.toBN('1');
        return bnNonce.add(bnIncriment).toString(10);
      })
      .catch((reason) => {
        oThis.logError(reason);
        oThis.exitWithError('Failed to get Ephemeral KeyNonce. See error for details.');
      });
  }

  getExecuteRuleCallPrefix(tokenHolder) {
    return tokenHolder
      .EXECUTE_RULE_CALLPREFIX()
      .call({})
      .catch((reason) => {
        oThis.logError(reason);
        oThis.exitWithError('Failed to get Execute Rule CallPrefix. See error for details.');
      });
  }

  buildEphemeralKeyAccount(privateKey) {
    console.log('privateKey', privateKey);
    let openST = this.openST;
    let web3 = openST.web3();
    try {
      return web3.eth.accounts.privateKeyToAccount(privateKey);
    } catch (e) {
      this.logError(e);
      let error = 'Invalid Ephemeral Private Key: Please provide Ephemeral Private Key using --ephemeral-private-key flag';
      this.exitWithError(error);
    }
  }

  buildMethodArgs(methodArgsStr) {
    try {
      methodArgsStr = methodArgsStr || '[]';
      return JSON.parse(methodArgsStr);
    } catch (error) {
      oThis.logError(error);
      oThis.exitWithError('Failed to parse method-args. See error for details');
    }
  }

  validate() {
    let openST = this.openST;
    let web3 = openST.web3();
    let utils = web3.utils;

    if (!utils.isAddress(this.tokenHolder)) {
      let error = 'Invalid TokenHolder Contract Address. Please provide TokenHolder contract address using --token-rules flag.';
      this.exitWithError(error);
      return;
    }

    if (!this.rule) {
      let error = 'Invalid Custom Rule Name. Please provide Custom Rule name using --rule flag.';
      this.exitWithError(error);
      return;
    }

    if (!this.method) {
      let error = 'Invalid Custom Rule Method Name. Please provide Custom Rule Method name using --method flag.';
      this.exitWithError(error);
      return;
    }
  }
}

const program = PerformerBase.getProgram();

program
  .usage('--token-holder [address] --rule [name] --address [address] --abi [file]')
  .option('--token-holder [tokenHolder]', 'TokenHolder contract address')
  .option('--ephemeral-private-key [privateKey]', 'Required. Ephemeral Private Key')
  .option('--rule [name]', 'Required. Name of the Rule.')
  .option('--method [name]', 'Required. Name of Method to be executed.')
  .option('--method-args [args]', 'defaults to []. Array of arguments to be passed to contract method.');

program.parse(process.argv);
let performer = new Performer(program);
performer.perform();
