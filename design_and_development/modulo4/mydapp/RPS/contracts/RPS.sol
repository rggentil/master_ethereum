pragma solidity ^0.4.25;

import "zeppelin-solidity/contracts/ownership/Ownable.sol";


contract RPS is Ownable {

    uint public jackpot;
    uint public minJackpot = 1 ether;
    uint public minimumBet = 0.0001 ether;
    uint public roundCount;
    bool public gameRunning;
    bool public lotteryOn;

    uint public lotteryRate = 1000;

    /* Not used yet
    uint maxJackpot;
    uint businessFee;
    uint jackpotFee;
    */

    enum Choice { Rock, Paper, Scissors }

    struct Player {
        Choice choice;
        bytes32 playerHash;
        address playerAddress;
    }

    struct Round {
        Player player1;
        Player player2;
        uint betAmount;
        address winner;
        bool isClosed;
        bool isSolo;
        address lotteryWinner;
        uint currentJackpot;
    }

    mapping(uint=>Round) rounds;

    // We could add another mapping to check rounds per address:
    // mapping(address=>uint[])

    event RoundCreated(
        uint roundId,
        uint betAmount,
        address indexed player1,
        Choice choice1
    ); // possibility to used indexes

    event RoundResolved(
        uint roundId,
        address winner,
        uint betAmount,
        address indexed player1,
        Choice choice1,
        address player2,
        Choice choice2
    );

    event Payment(address paidAddress, uint amount);
    event LotteryWin(address winner, uint jackpot);

    modifier gameIsRunning() {
        require(gameRunning, "Function available only when game is running");
        _;
    }

    constructor() public payable {
        // We could handle games through constructor and setting variables like
        // minimum bet, max jackpot, fees, etc.
    }

    // Fallback, just in case of receiving funds, to the jackpot
    function () public payable {
        jackpot += msg.value;
    }

    function getRoundInfo(
        uint roundId
    )
        external
        view
        returns(
            address player1Address,
            Choice player1Choice,
            address player2Address,
            Choice player2Choice,
            uint betAmount,
            address winner
        )
    {
        Round memory myRound = rounds[roundId];
        return (
            myRound.player1.playerAddress,
            myRound.player1.choice,
            myRound.player2.playerAddress,
            myRound.player2.choice,
            myRound.betAmount,
            myRound.winner
        );
    }

    function fundGame() public payable {
        jackpot += msg.value;
    }

    function startGame() public onlyOwner {
        require(!gameRunning, "Game already started");
        require(jackpot <= address(this).balance, "Jackpot lower than SC balance");  // We might omit this check
        require((address(this).balance >= minJackpot) && (jackpot >= minJackpot), "Minimum Jackpot is needed for starting game");
        gameRunning = true;
        lotteryOn = true;
    }

    function stopLottery() public onlyOwner {
        lotteryOn = false;
    }

    function startLottery() public onlyOwner {
        lotteryOn = true;
    }

    function createRound(bool _isSolo, Choice _choice)
        public
        gameIsRunning
        payable
        returns(uint)
    {
        require(msg.value >= minimumBet, "Not enough amount bet");

        roundCount++;
        uint roundId = roundCount;
        Round storage round = rounds[roundId];
        round.player1.playerAddress = msg.sender;
        round.player1.choice = _choice;
        round.betAmount = msg.value;
        round.isSolo = _isSolo;

        emit RoundCreated(
            roundCount,
            round.betAmount,
            round.player1.playerAddress,
            round.player1.choice
        );

        if (round.isSolo) {
            require(msg.value <= jackpot, "Bet too high");
            round.player2.playerAddress = address(this);
            round.player2.choice = getRandomChoice();
            _resolveRound(roundId);
            if (lotteryOn) {
                _playLottery(round.player1.playerAddress, roundId);
            }
        }

        return roundId;
    }

    // It's safe enough that we provide the choice to be part of enum or maybe there
    // is any trick to be able to provide something out of choices? Maybe it's better to
    // add a check to see if in its range
    function joinRound(uint _roundId, Choice _choice) public payable {
        Round storage myRound = rounds[_roundId];  // Pointer to round
        require(myRound.player1.playerAddress != address(0), "Round does not exist");
        require(myRound.player2.playerAddress == address(0) && !myRound.isClosed, "Round already finished");
        require(msg.value >= myRound.betAmount, "Send at least the same bet amount");

        // Send back the excess of the amount sent minus the real bet amount
        // Use Safe Math, althouth this should never be overflow bc substract uints is another uint
        // Using transfer should prevent from fallback reentrancy, but...
        // Also, a reentrancy would have to send more value than betAmount, I think an attack has no sense
        // but I would have to analyze it a bit more.
        msg.sender.transfer(msg.value - myRound.betAmount);

        myRound.player2.playerAddress = msg.sender;
        myRound.player2.choice = _choice;
        _resolveRound(_roundId);

        // I need to study better how to handle lottery when playing two players. I think there could be 
        // easy attacks to jackpot. Not availale for now.
        // if (lotteryOn) {
        //     _playLottery(myRound.player1.playerAddress, _roundId);
        //     _playLottery(myRound.player2.playerAddress, _roundId);
        // }

    }

    // Change randomness in case we want it to be realistic. Probably it needs Oraclize.
    function getRandomChoice() private view returns(Choice){
        return Choice(uint(keccak256(abi.encodePacked(roundCount, msg.sender, blockhash(block.number - 1)))) % 3);
    }

    function _resolveRound(uint _roundId) private {
        Round storage myRound = rounds[_roundId];  // Pointer to round
        require(!myRound.isClosed, "Round already closed");
        myRound.winner = _checkWinner(myRound.player1, myRound.player2);
        _payWinner(_roundId);
        emit RoundResolved(
            _roundId,
            myRound.winner,
            myRound.betAmount,
            myRound.player1.playerAddress,
            myRound.player1.choice,
            myRound.player2.playerAddress,
            myRound.player2.choice
        );
    }

    function _payWinner(uint _roundId) private {  // Maybe it can return true or false for the lottery
        // We might want to add some checkers, requires or asserts, to see that the value
        // trasnfered is what it is...

        Round storage myRound = rounds[_roundId];  // Pointer to round
        address winner = myRound.winner;

        // I think this is necessary to avoid possible reentrancy attacks (although we're using transfer).
        // I also think we are protected since this function is private, the one which calls this one is
        // also private and the parent you need to send value to join round.
        require(!myRound.isClosed, "Round already closed");
        myRound.isClosed = true;

        uint inititalJackpot = jackpot;
        uint initialBalance = address(this).balance;

        if(myRound.isSolo) {  // 1 player mode
            if (winner == address(0)){  // Draw, player recevies what he bet
                myRound.player1.playerAddress.transfer(myRound.betAmount);
            } else if (winner == address(this)) {  // Player looses, bet to jackpot
                jackpot += myRound.betAmount;
            } else {  // Player wins
                jackpot -= myRound.betAmount;
                winner.transfer(2 * myRound.betAmount);
                emit Payment(winner, myRound.betAmount);
            }
        } else { // 2 players mode
            if (winner == address(0)){  // Draw, players receive what they bet
                myRound.player1.playerAddress.transfer(myRound.betAmount);
                myRound.player2.playerAddress.transfer(myRound.betAmount);
            } else {  // Bet to the winner
                winner.transfer(2 * myRound.betAmount);
                emit Payment(winner, myRound.betAmount);
            }
        }

        // Additional check por security for reentrancy (kind of formal verification)
        // These additional checks may not be necessary since we are using transfer that limits gas to 2300,
        // so in the final deployment we could ommit all these additional checks in order to save same uncessary gas
        assert((jackpot >= inititalJackpot - (2 * myRound.betAmount)) && (address(this).balance >= initialBalance - (2 * myRound.betAmount)));
    }

    function _checkWinner(Player player1, Player player2) private pure returns(address) {
        if ((uint(player1.choice) + 1) % 3 == uint(player2.choice)) {
            return player2.playerAddress;
        } else if ((uint(player1.choice) + 2) % 3 == uint(player2.choice)) {
            return player1.playerAddress;
        } else {
            return address(0);
        }
    }

    function setLotteryRate(uint newLotteryRate) public onlyOwner {
        lotteryRate = newLotteryRate;
    }

    // Careful to call this function only when there is no round without result
    function _playLottery(address playerAddress, uint _roundId) private returns (bool) {

        if (uint(keccak256(abi.encodePacked(roundCount, playerAddress, blockhash(block.number - 1)))) % lotteryRate == 0) {
            Round storage myRound = rounds[_roundId];  // Pointer to round
            require(myRound.lotteryWinner == 0, "Only one loterry winner per round");
            myRound.lotteryWinner = playerAddress;
            _payLotteryWinner(playerAddress);
            return true;
        }
        return false;
    }

    function _payLotteryWinner(address _winnerAddress) private {
        require(jackpot <= address(this).balance, "Jackpot is higher than contract balance");

        // I think we dont need to avoid reentrancy since no problem using transfer.
        _winnerAddress.transfer(jackpot);
        jackpot = 0;
        emit LotteryWin(_winnerAddress, jackpot);
        emit Payment(_winnerAddress, jackpot);
    }

}
