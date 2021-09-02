// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract BasicToken is ERC20 {
    constructor(uint256 initialBalance) ERC20("Basic", "BSC") {
        _mint(msg.sender, initialBalance);
    }
}

contract AmIRichAlready {
    BasicToken private tokenContract;

    uint256 private constant RICHNESS = 1000000 * 10**18;

    constructor(BasicToken _tokenContract) {
        tokenContract = _tokenContract;
    }

    function check() public view returns (bool) {
        uint256 balance = tokenContract.balanceOf(msg.sender);
        return balance > RICHNESS;
    }
}
