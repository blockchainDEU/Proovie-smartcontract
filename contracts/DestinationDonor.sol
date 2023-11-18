// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {CCIPReceiver} from "@chainlink/contracts-ccip/src/v0.8/ccip/applications/CCIPReceiver.sol";
import {Client} from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import {main} from "./Main.sol";

contract DestinationDonor is CCIPReceiver {
    main mainContract;
    ERC20 immutable CCIPBnM;
    
    
    event DonateCallSuccessfull();

    constructor(address router, address _mainAddress, address _ccip) CCIPReceiver(router) {
        mainContract = main(_mainAddress);
        CCIPBnM = ERC20(_ccip);
    }

    function _ccipReceive(
        Client.Any2EVMMessage memory message
    ) internal override {
        CCIPBnM.approve(address(mainContract), type(uint256).max);
        (bool success, ) = address(mainContract).call(message.data);
        require(success);
        emit DonateCallSuccessfull();
    }
}