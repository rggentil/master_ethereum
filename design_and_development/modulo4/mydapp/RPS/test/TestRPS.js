const ROCK = 0;
const PAPER = 1;
const SCISSORS = 2;

const RPS = artifacts.require("RPS");

const helpers = {

    checkWinner: (player1, player2) => {
        if ((player1.choice + 1) % 3 == player2.choice) {
            return player2.address;
        }
        else if ((player1.choice + 2) % 3 == player2.choice) {
            return player1.address;
        }
        else {
            return 0;
        }
    }
}


contract("RPS", async (accounts) => {

    before(async () => {
        owner = accounts[0];
    });

    beforeEach(async () => {
        player1 = {
            address: accounts[1],
            choice: ROCK
        }

        player2 = {
            address: accounts[2],
            choice: PAPER
        }

        rps = await RPS.deployed();
    });

    it("Test fund game", async () => {

        // Initial fund must be 0
        initialJackpot = await rps.jackpot({from: accounts[1]});
        assert.equal(initialJackpot, 0);

        // Fund game with several contributions
        const fund0 = web3.toWei(0.021);
        const fund1 = web3.toWei(0.12);
        const fund2 = web3.toWei(0.13);
        const fund3 = web3.toWei(0.35);
        const totalFund = parseInt(fund0) + parseInt(fund1) + parseInt(fund2) + parseInt(fund3);

        rps.fundGame({from: accounts[0], value: fund0});
        rps.fundGame({from: accounts[1], value: fund1});
        rps.fundGame({from: accounts[2], value: fund2});
        rps.fundGame({from: accounts[0], value: fund3});

        currentJackpot = (await rps.jackpot({from: accounts[0]})).toNumber();

        assert.equal(currentJackpot, totalFund, 'Current jackpot not as expected');
    });

    it("Test start game", async () => {

        // Game is not started auto
        assert.isFalse(await rps.gameRunning(), 'Game should not be running');

        // Previous fund was below minimum jackpot, then game could not be started
        try {
            await rps.startGame({from: owner});
        }
        catch(e) {}
        assert.isFalse(await rps.gameRunning(), 'Game should not be running');

        // Not possible to start game if not owner
        try {
            await rps.startGame({from: accounts[1]});
        }
        catch(e) {
            assert.isFalse(await rps.gameRunning(), 'Game should not be running');

            // Start game after funding it
            rps.fundGame({from: accounts[3], value: await rps.minJackpot()});
            rps.startGame({from: owner});
            assert.isTrue(await rps.gameRunning(), 'Game should be running');

            return;
        }

        assert.isOk(false, 'Game started from non owner');  // It shouldn't reach this assert
    });

    it("Playing vs the House", async () => {

        const house = {
            address: rps.address,
        }

        const roundsNumber = 5;
        const betAmount = web3.toWei(0.1);
        let expectedPlayersBalance;
        let expectedContractsBalance;

        // Try several attemps to assure that passing the test is not because of a random gess.
        // Maybe final version redouce the attemps to get lower unit test time.
        for (i of [...Array(roundsNumber).keys()]) {
            const previousPlayersBalance = (await web3.eth.getBalance(player1.address)).toNumber();
            const previousContractsBalance = (await web3.eth.getBalance(rps.address)).toNumber();
            player1.choice = i % 3;  // to select different player choices
            rps.createRound(true, player1.choice, {from: player1.address, value: betAmount});
            let lastRound = await rps.roundCount();
            roundInfo =  await rps.getRoundInfo(lastRound);
            house.choice = roundInfo[3].toNumber();
            winner = roundInfo[5];

            const expectedWinner = helpers.checkWinner(player1, house);

            assert.equal(expectedWinner, winner, "Winner not as expected");

            const newPlayersBalance = (await web3.eth.getBalance(player1.address)).toNumber();
            const newContractsBalance = (await web3.eth.getBalance(rps.address)).toNumber();
            const fees =  parseInt(web3.toWei(0.05));  // Gas fees, adjust when we know better about gas cost

            if (winner == player1.address) {
                expectedPlayersBalance = previousPlayersBalance + parseInt(betAmount);
                expectedContractsBalance = previousContractsBalance - parseInt(betAmount);
            } else if (winner == RPS.address) {
                expectedPlayersBalance = previousPlayersBalance -  parseInt(betAmount);
                expectedContractsBalance = previousContractsBalance + parseInt(betAmount);
            } else {
                expectedPlayersBalance = previousPlayersBalance;
                expectedContractsBalance = previousContractsBalance;
            }

            assert.closeTo(newPlayersBalance, expectedPlayersBalance, fees, 'Player balance is wrong after round vs House');
            assert.equal(newContractsBalance, expectedContractsBalance, 'House balance is wrong after round vs House');
        }
    });

    it("Test getting info from round (vs House)", async () => {

        const betAmount = web3.toWei(0.11);

        rps.createRound(true, player1.choice, {from: player1.address, value: betAmount});

        let lastRound = await rps.roundCount();
        roundInfo =  await rps.getRoundInfo(lastRound);

        assert.equal(player1.address, roundInfo[0], 'Player1 address wrong');
        assert.equal(player1.choice, roundInfo[1], 'Player1 choice wrong');
        assert.equal(rps.address, roundInfo[2], 'House address wrong');
        assert.isTrue(roundInfo[3] in [ROCK, PAPER, SCISSORS], 'House choice wrong');  // We can't know the house choice, just check is one of three
        assert.equal(betAmount, roundInfo[4], 'House address wrong');
    });

    it("Playing 2 players", async () => {

        const betAmount = web3.toWei(0.1);

        // Try several attemps to assure that passing the test is not because of a random gess.
        // Maybe final version reduce the attemps to get lower unit test time.
        for (i of [...Array(3).keys()]) {
            const previousPlayer1sBalance = (await web3.eth.getBalance(player1.address)).toNumber();
            const previousPlayer2sBalance = (await web3.eth.getBalance(player2.address)).toNumber();
            player2.choice = i % 3;  // to select different player choices
            rps.createRound(false, player1.choice, {from: player1.address, value: betAmount});
            let lastRound = await rps.roundCount();
            rps.joinRound(lastRound, player2.choice, {from: player2.address, value: betAmount});
            roundInfo =  await rps.getRoundInfo(lastRound);

            winner = roundInfo[5];
            const expectedWinner = helpers.checkWinner(player1, player2);
            assert.equal(expectedWinner, winner, "Winner not as expected");

            const newPlayer1sBalance = (await web3.eth.getBalance(player1.address)).toNumber();
            const newPlayer2sBalance = (await web3.eth.getBalance(player2.address)).toNumber();
            const fees =  parseInt(web3.toWei(0.05));  // Gas fees, adjust when we know better about gas cost

            if (winner == player1.address) {
                expectedPlayer1sBalance = previousPlayer1sBalance + parseInt(betAmount);
                expectedPlayer2sBalance = previousPlayer2sBalance - parseInt(betAmount);
            } else if (winner == player2.address) {
                expectedPlayer1sBalance = previousPlayer1sBalance - parseInt(betAmount);
                expectedPlayer2sBalance = previousPlayer2sBalance + parseInt(betAmount);

            } else {
                expectedPlayer1sBalance = previousPlayer1sBalance;
                expectedPlayer2sBalance = previousPlayer2sBalance;
            }

            assert.closeTo(newPlayer1sBalance, expectedPlayer1sBalance, fees, 'Player1 balance is wrong after round vs Player2');
            assert.closeTo(newPlayer2sBalance, expectedPlayer2sBalance, fees, 'Player2 balance is wrong after round vs Player2');        }
    });

    it("Test getting info from round (2 players)", async () => {

        const betAmount = web3.toWei(0.11);

        await rps.createRound(false, player1.choice, {from: player1.address, value: betAmount});

        let lastRound = await rps.roundCount();
        await rps.joinRound(lastRound, player2.choice, {from: player2.address, value: betAmount});
        const roundInfo = await rps.getRoundInfo(lastRound);
        assert.equal(player1.address, roundInfo[0], 'Player1 address wrong');
        assert.equal(player1.choice, roundInfo[1], 'Player1 choice wrong');
        assert.equal(player2.address, roundInfo[2], 'Player2 address wrong');
        assert.equal(player2.choice, roundInfo[3], 'Player2 choice wrong');
        assert.equal(betAmount, roundInfo[4], 'House address wrong');
        winner = roundInfo[5];
        assert.equal(player2.address, roundInfo[5], 'Winner wrong');  // Paper beats rock, player2 must win
    });

    it("Test error when creating round with bet lower than minimum bet", async () => {

        const minimumBet = await rps.minimumBet();
        const lastRound = await rps.roundCount();

        try {
            await rps.createRound(false, player1.choice, {from: player1.address, value: minimumBet - 1});
        }
        catch(e) {
            const newLastRound = await rps.roundCount();
            assert.equal(parseInt(lastRound), newLastRound, 'New round should not be created');
            // But we can create new round with minimum bet
            await rps.createRound(false, player1.choice, {from: player1.address, value: minimumBet});
            return;
        }

        assert.isOk(false, 'Round should not be possible to be created');  // It shouldn't reach this assert
    });

    it("Test error when joining to a non existing round", async () => {

        const betAmount = web3.toWei(0.11);

        // await rps.createRound(true, player1.choice, {from: player1.address, value: betAmount})
        let lastRound = await rps.roundCount();

        const roundToJoin = lastRound + 100
        try {
            await rps.joinRound(roundToJoin, player2.choice, {from: player2.address, value: betAmount})
        }
        catch(e) {
            roundInfo = await rps.getRoundInfo(roundToJoin);
            assert.equal(0, roundInfo[0], 'Player1 should be 0');
            assert.equal(0, roundInfo[2], 'Player2 should be 0');
            assert.equal(0, roundInfo[4], 'Bet amount should be 0');
            assert.equal(0, roundInfo[5], 'Winner should be 0');
            return;
        }

        assert.isOk(false, 'It should not be possibe to join to a non existing round');  // It shouldn't reach this assert
    });


    it("Test error when joining to a finished 1 player round", async () => {

        const betAmount = web3.toWei(0.11);

        await rps.createRound(true, player1.choice, {from: player1.address, value: betAmount})
        let lastRound = await rps.roundCount();

        // Player2 cannot join to this round becaouse it is finished
        try {
            await rps.joinRound(lastRound, player2.choice, {from: player2.address, value: betAmount})
        }
        catch(e) {
            roundInfo = await rps.getRoundInfo(lastRound);
            assert.equal(rps.address, roundInfo[2], 'Player 2 address should be player2.address');
            return;
        }

        assert.isOk(false, 'It should not be possibe to join to a non existing round');  // It shouldn't reach this assert
    });

    it("Test error when joining to a finished 2 players round", async () => {

        const player3 = {
            address: accounts[3],
            choice: PAPER
        }

        const betAmount = web3.toWei(0.11);

        await rps.createRound(false, player1.choice, {from: player1.address, value: betAmount})
        lastRound = await rps.roundCount();

        // Player2 can join last round and then it finishes
        await rps.joinRound(lastRound, player2.choice, {from: player2.address, value: betAmount})

        // Player3 cannot join to this round becaouse it is finished
        try {
            await rps.joinRound(lastRound, player3.choice, {from: player3.address, value: betAmount})
        }
        catch(e) {
            roundInfo = await rps.getRoundInfo(lastRound);
            assert.equal(player2.address, roundInfo[2], 'Player 2 address should be player2.address');
            return;
        }

        assert.isOk(false, 'It should not be possibe to join to a finished 2 players round');  // It shouldn't reach this assert
    });

    it("Test error when joining to a round sending lower bet amount", async () => {

        const betAmount = web3.toWei(0.11);

        await rps.createRound(false, player1.choice, {from: player1.address, value: betAmount})
        const lastRound = await rps.roundCount();

        try {
            // Not possible to test boundary values since it seems it accepts a bet with a lower up to 8 wei bet
            // For me it's a really weird thing, I guess it's Ethereum-EVM-Solidity stuff.
            await rps.joinRound(lastRound, player2.choice, {from: player2.address, value: betAmount - 10})
        }
        catch(e) {
            roundInfo = await rps.getRoundInfo(lastRound);
            assert.equal(0, roundInfo[2], 'Player2 should be 0');
            assert.equal(betAmount, roundInfo[4], 'Bet amount should be 0');
            assert.equal(0, roundInfo[5], 'Winner should be 0');
            return;
        }

        assert.isOk(false, 'It should not be possibe to join to a round with lower bet');  // It shouldn't reach this assert
    });
}

)