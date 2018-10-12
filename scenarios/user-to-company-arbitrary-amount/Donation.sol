pragma solidity ^0.4.23;


// Copyright 2018 OpenST Ltd.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import "./TokenRules.sol";

contract Donation {

    /* Variables */

    TokenRules tokenRules;
    address public donee;


    /* Functions */

    constructor (
        address _tokenRules,
        address _donee
    )
        public
    {
        require (_tokenRules != address(0), "Token rules address is null.");
        tokenRules = TokenRules(_tokenRules);

        require (_donee != address(0), "Donee address is null.");
        donee = _donee;
    }

    function donate (
        uint256 _amount
    )
        public
        returns (bool)
    {
        address[] memory transfersTo = new address[](1);
        transfersTo[0] = donee;

        uint256[] memory transfersAmount = new uint256[](1);
        transfersAmount[0] = _amount;

        TokenRules(tokenRules).executeTransfers(
            msg.sender,
            transfersTo,
            transfersAmount
        );

        return true;
    }
}
