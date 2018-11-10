pragma solidity ^0.4.25;

import "zeppelin-solidity/contracts/ownership/Ownable.sol";

// /**
//  * @title Ownable
//  * @dev The Ownable contract has an owner address, and provides basic authorization control
//  * functions, this simplifies the implementation of "user permissions".
//  */
// contract Ownable {
//     address private _owner;

//     event OwnershipTransferred(
//         address indexed previousOwner,
//         address indexed newOwner
//     );

//     /**
//     * @dev The Ownable constructor sets the original `owner` of the contract to the sender
//     * account.
//     */
//     constructor() internal {
//         _owner = msg.sender;
//         emit OwnershipTransferred(address(0), _owner);
//     }

//     /**
//     * @return the address of the owner.
//     */
//     function owner() public view returns(address) {
//         return _owner;
//     }

//     /**
//     * @dev Throws if called by any account other than the owner.
//     */
//     modifier onlyOwner() {
//         require(isOwner());
//         _;
//     }

//     /**
//     * @return true if `msg.sender` is the owner of the contract.
//     */
//     function isOwner() public view returns(bool) {
//         return msg.sender == _owner;
//     }

//     /**
//     * @dev Allows the current owner to relinquish control of the contract.
//     * @notice Renouncing to ownership will leave the contract without an owner.
//     * It will not be possible to call the functions with the `onlyOwner`
//     * modifier anymore.
//     */
//     function renounceOwnership() public onlyOwner {
//         emit OwnershipTransferred(_owner, address(0));
//         _owner = address(0);
//     }

//     /**
//     * @dev Allows the current owner to transfer control of the contract to a newOwner.
//     * @param newOwner The address to transfer ownership to.
//     */
//     function transferOwnership(address newOwner) public onlyOwner {
//         _transferOwnership(newOwner);
//     }

//     /**
//     * @dev Transfers control of the contract to a newOwner.
//     * @param newOwner The address to transfer ownership to.
//     */
//     function _transferOwnership(address newOwner) internal {
//         require(newOwner != address(0));
//         emit OwnershipTransferred(_owner, newOwner);
//         _owner = newOwner;
//     }
// }


contract RPS is Ownable {
    
    uint jackpot;
    uint minJackpot = 500 finney;
    uint maxJackpot;
    uint feePercent;
    uint feeForJackpot;
    uint mininumBet = 1 finney;
    address lastWinner;
    
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
        Choice choice;
        bool isClosed; // need to check round closed before paying
        address winner;
        bool isSolo;
    }
    
    uint public roundCount;
    mapping(uint=>Round) rounds;
    
    // We could add another mapping to check rounds per address:
    // mapping(address=>uint[])
    
    bool public gameRunning;
    bool roundInProgress;
    uint lastJackpot;
    

    event MyLog(bytes32 choice1, uint choice2);
    event RoundCreated(uint roundId, uint betAmount, address indexed player1, Choice choice1); // possibility to used indexes
    event RoundResolved(uint roundId, address winner, uint betAmount, address player1, Choice choice1, address player2, Choice choice2);
    event Payment(address paidAddress, uint amount);
    event LotteryPlayed(address winner, uint jackpot);

    
    constructor() public payable {
        maxJackpot = 6 ether;
    }
    
    function fundGame() public payable {
        jackpot += msg.value;
    }
    
    modifier gameIsRunning() {
        require(gameRunning, "Function available only when game is running");
        _;
    }
    
    function startGame() public onlyOwner {
        require(!gameRunning, "Game already started");
        require(jackpot <= address(this).balance, "Jackpot higher than SC balance");
        require(address(this).balance >= minJackpot, "Minimum Jackpot is needed for starting game");
        gameRunning = true;
    }
    
    function createRound(bool _isSolo, Choice _choice) 
        public 
        gameIsRunning
        payable
        returns(uint) {
        // require (!roundInProgress, "Another round in progress");
        require(msg.value >= mininumBet, "Not enough amount bet");
        // roundInProgress = true;
        roundCount++;
        Round storage round = rounds[roundCount];
        round.player1.playerAddress = msg.sender;
        round.player1.choice = _choice;
        round.betAmount = msg.value;
        round.isSolo = _isSolo;

        emit RoundCreated(roundCount, round.betAmount, round.player1.playerAddress, round.player1.choice);
        
        if (round.isSolo) {
            require(msg.value <= jackpot, "Bet too high");
            round.player2.playerAddress = address(this);
            round.player2.choice = getRandomChoice();
            resolveRound(roundCount);
        } else {
            gameRunning = true;
        }

        return roundCount;
        
    }

    function getWinner() external view returns(address) {
        return lastWinner;
    }
    
    // Is safe enough that we provide the choice to be part of enum or maybe there
    // is any trick to be able to provide something out of choices? May it's better to
    // add a check to see if in its range
    function joinRound(uint _roundId, Choice _choice) public payable{
        Round storage myRound = rounds[_roundId];  // Pointer to round
        require(myRound.player1.playerAddress != address(0), "Round does not exist");
        require(myRound.player2.playerAddress == address(0), "Round already finished");
        require(msg.value >= myRound.betAmount, "Send at least the same bet amount");
        require(!myRound.isClosed, "Round already finished");
        msg.sender.transfer(msg.value - myRound.betAmount);  // Use Safe Math, althouth this should never be overflow bc substract uints is another uint
        
        myRound.player2.playerAddress = msg.sender;
        myRound.player2.choice = _choice;
        resolveRound(_roundId);
    }
    
    function resolveRound(uint _roundId) internal {
        Round storage myRound = rounds[_roundId];  // Pointer to round
        require(!myRound.isClosed, "Round already closed");
        myRound.isClosed = true;
        myRound.winner = _checkWinner(myRound.player1, myRound.player2);
        lastWinner = myRound.winner;
        _payWinner(_roundId);
        //roundInProgress = false;
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
    
    function _payWinner(uint _roundId) internal {  // Maybe it can return true or false for the lottery
        // We might want to add some checkers, requires or asserts, to see that the value 
        // trasnfered is what it is...
        Round storage myRound = rounds[_roundId];  // Pointer to round
        address winner = myRound.winner;
        
        if(myRound.isSolo) {  // 1 player mode
            if (winner == address(0)){  // Draw, player recevies what he bet
                myRound.player1.playerAddress.transfer(myRound.betAmount);
            }
            else if (winner == address(this)) {  // Player looses, bet to jackpot
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


    }
    
    // Change randomness in case we want it to be realistic. Probably it needs Oraclize.
    function getRandomChoice() internal view returns(Choice){
        return Choice(uint(blockhash(block.number - 1)) % 3);
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

    function getBCChoice() external view returns(uint) {
        return uint(blockhash(block.number - 1)) % 3;
    }
    
    
    function getJackpot() external view returns(uint) {
        return jackpot;
    }
    
    function getBalance() external view returns(uint) {
        return address(this).balance;
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
            address winner,
            uint blockNumber
        )
    {
        Round memory myRound = rounds[roundId];
        return (
            myRound.player1.playerAddress,
            myRound.player1.choice,
            myRound.player2.playerAddress,
            myRound.player2.choice,
            myRound.betAmount,
            myRound.winner,
            block.number - 1
        );
    }
    
    // Careful to call this function only when there is no round without result
    // function playLottery() internal {}
}
