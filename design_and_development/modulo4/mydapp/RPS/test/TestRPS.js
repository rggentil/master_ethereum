const ROCK = 0;
const PAPER = 1;
const SCISSORS = 2;

var RPS = artifacts.require("RPS");

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

// is there anyway to start with 1000 ETH instead of 100?

contract("RPS", async (accounts) => {

    before(async () => {
        owner = accounts[0];
    });

    it("Test fund game", async () => {
        let rps = await RPS.deployed();

        // Initial fund must be 0
        initialJackpot = await rps.getJackpot({from: accounts[1]});
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

        currentJackpot = (await rps.getJackpot({from: accounts[0]})).toNumber();

        assert.equal(currentJackpot, totalFund, 'Current jackpot not as expected');
    });

    it("Test start game", async () => {
        let rps = await RPS.deployed();

        // Game is not started auto
        assert.isFalse(await rps.gameRunning(), 'Game should not be running');

        // Previous fund was below minimum jackpot, then game could not be started
        try {
            await rps.startGame({from: owner});
        }
        catch(e) {
            assert.isOk(true, "Game should be not ready to be started");
        }

        // Not possible to start game if not owner
        try {
            await rps.startGame({from: accounts[1]});
        }
        catch(e) {
            assert.isOk(true, "Game started from non owner");
        }

        // Start game after funding it
        rps.fundGame({from: accounts[4], value: await rps.minJackpot()});
        rps.startGame({from: owner});
        assert.isTrue(await rps.gameRunning(), 'Game should be running');
    });

    it("Playing vs the House", async () => {

        let rps = await RPS.deployed();

        const player1 = {
            address: accounts[1],
            choice: ROCK
        }

        const house = {
            address: rps.address,
        }

        // Try several attemps to assure that passing the test is not because of a random gess.
        // Maybe final version redouce the attemps to get lower unit test time.
        for (i of [...Array(6).keys()]) {
            player1.choice = i % 3;  // to select different player choices
            rps.createRound(true, player1.choice, {from: player1.address, value: web3.toWei(0.1)});
            let lastRound = await rps.roundCount();
            roundInfo =  await rps.getRoundInfo(lastRound);
            house.choice = roundInfo[3].toNumber();
            winner = roundInfo[5];
    
            const expectedWinner = helpers.checkWinner(player1, house);
    
            assert.equal(expectedWinner, winner, "Winner not as expected");
        }

        // Aditional checks to see about balance of the contract and players



        
        
    });

}

)