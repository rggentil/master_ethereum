pragma solidity ^0.4.25;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/RPS.sol";


contract TestRPS {
    // RPS rps = RPS(DeployedAddresses.RPS());
    RPS rps = new RPS();

    function testFundGame() public {
        RPS rps = new RPS();
        Assert.equal(0, rps.getJackpot(), "Initial jackpot should be 0");
        // rps.fundGame.value(5 finney)();
        // Assert.equal(5 finney, rps.getJackpot(), "Wrong jackpot value");
    }

    // function testStartGame() public {
    //     Assert.equal(false, rps.gameRunning(), "Game is running and it should not");
    //     rps.startGame();
    //     Assert.equal(true, rps.gameRunning(), "Game is not running and it should");
    // }
}
