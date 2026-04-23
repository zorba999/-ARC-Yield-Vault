// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {SimpleYieldVault} from "../src/SimpleYieldVault.sol";

contract DeployScript is Script {
    // ARC Testnet USDC
    address constant USDC = 0x3600000000000000000000000000000000000000;

    function run() external {
        vm.startBroadcast();

        // Deploy with USDC address and 6 decimals
        SimpleYieldVault vault = new SimpleYieldVault(USDC, 6);

        console.log("SimpleYieldVault deployed at:", address(vault));
        console.log("Asset (USDC):", address(vault.asset()));
        console.log("Symbol:", vault.symbol());

        vm.stopBroadcast();
    }
}
