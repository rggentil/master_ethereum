App = {

  web3Provider: null,
  contracts: {},

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    // Is there an injected web3 instance?
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
    } else {
      // If no injected web3 instance is detected, fall back to Ganache
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
    }
    web3 = new Web3(App.web3Provider);
    return App.initContract();
  },

  initContract: function(event) {
    $.getJSON('RPS.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var RPSArtifact = data;
      App.contracts.RPS = TruffleContract(RPSArtifact);

      // Set the provider for our contract
      App.contracts.RPS.setProvider(App.web3Provider);

      App.showJackpot();
      App.showPlayerAddress();
      App.manageGameEvents();
    });

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-rock', function(event){
      App.playRound(0);
    });
    $(document).on('click', '.btn-paper', function(event){
      App.playRound(1);
    });
    $(document).on('click', '.btn-scissors', function(event){
      App.playRound(2);
    });
  },

  manageGameEvents: async () => {
    rpsInstance = await App.contracts.RPS.deployed();

    web3.eth.getAccounts(async (error, accounts) => {
      account = await accounts[0];

      // rpsInstance.RoundCreated({player1: account}).watch((error, result) => {
      //       if (!error)
      //         console.log('Event "RoundCreated" ' + result.args.roundId.toNumber() + ' received for player');
      // });

      rpsInstance.RoundResolved({player1: account}
      ).watch((error, result) => {
          if (!error)
            console.log('Event "RoundResolved" ' + result.args.roundId.toNumber() + ' received for player');
            App.showResult(result.args.roundId, result.args.winner);
      });

      rpsInstance.allEvents({fromBlock: 0}
      ).get((error, events) => {
          if (!error)
            roundResolvedEvents = events.filter(e => e.event == "RoundResolved");
            resolvedRounds = roundResolvedEvents.map(e => e.args.roundId.toNumber());
            console.log(resolvedRounds);
            roundCreatedEvents = events.filter(e => e.event == "RoundCreated");
            openedRounds = roundCreatedEvents.filter(e => !(resolvedRounds.includes(e.args.roundId.toNumber())));
            App.populateHistoryTable(roundResolvedEvents.map(e => e.args));
            App.populateOpenedRoundsTable(openedRounds.map(e => e.args))
      }
      );

      // This is necessary because with TestRPC blockchain we receive the events twice
      web3.eth.getBlockNumber((error, latestBlock) => {
        rpsInstance.RoundResolved({fromBlock: latestBlock}
        ).watch((error, event) => {
          if (!error) {
            if(event.blockNumber != latestBlock) {   //accept only new events
              latestBlock = latestBlock + 1;   //update the latest blockNumber
              App.populateHistoryTable([event.args]);
              App.deleteRoundOpenedTable(event.args.roundId);
            }
          }
        });
      });

      // This is necessary because with TestRPC blockchain we receive the events twice
      web3.eth.getBlockNumber((error, latestBlock) => {
        rpsInstance.RoundCreated({fromBlock: latestBlock}
        ).watch((error, event) => {
          if (!error) {
            if(event.blockNumber != latestBlock) {   //accept only new events
              latestBlock = latestBlock + 1;   //update the latest blockNumber
              if (!event.args.isSolo) {
                App.populateOpenedRoundsTable([event.args]);
              }
            }
          }
        });
      });

    });
  },

  showJackpot: async () => {
    rpsInstance = await App.contracts.RPS.deployed();
    const jackpot = await rpsInstance.jackpot();
    document.getElementById("jackpot-amount").innerHTML = web3.fromWei(jackpot, 'ether') + ' ETH';
  },

  showPlayerAddress: async() => {

    const showAddress = () => {
      web3.eth.getAccounts(async (error, accounts) => {
        account = await accounts[0];
        accountShorted = account.slice(0, 6) + '...' + account.slice(-4);
        document.getElementById("metamask-player").innerHTML = accountShorted;
      });
    }

    showAddress();

    web3.currentProvider.publicConfigStore.on('update', () => {
      showAddress();
    });
  },

  playRound: (choice) => {
    document.getElementById("result").innerHTML = '';
    console.log('playing...');
    if ($("#soloPlayer").is(":checked")) {
      console.log('playing vs Jackpot');
      App.createRound(true, choice);
    }
    else if ($("#newRound").is(":checked")) {
      console.log('creating a new round');
      App.createRound(false, choice);
    }
    else if ($("#joinRound").is(":checked")){
      console.log('playing vs an oponent');
      App.joinRound($('#round').val(),choice);
    }
  },

  createRound: async (isSolo, choice) => {
    const betAmount = web3.toWei($('#betAmount').val(), 'ether');

    const rpsInstance = await App.contracts.RPS.deployed();

    web3.eth.getAccounts(async (error, accounts) => {
      const account = await accounts[0];

      const result = await rpsInstance.createRound(isSolo, choice, {from: account, value: betAmount});
      App.showJackpot();

      console.log("New round created");
      // console.log(result.logs)  // Showing events

    });
  },

  joinRound: async(roundId, choice) => {
    console.log(`joining round ${roundId} with choice ${choice}`);
    const betAmount = web3.toWei($('#betAmount').val(), 'ether');

    const rpsInstance = await App.contracts.RPS.deployed();

    web3.eth.getAccounts(async (error, accounts) => {
      const account = await accounts[0];

      await rpsInstance.joinRound(roundId, choice, {from: account, value: betAmount});
      App.showJackpot();

      console.log("Joined to round " + roundId);
      console.log(result.logs)  // Showing events
    });
  },

  showResult: (roundId, winner) => {
    web3.eth.getAccounts(async (error, accounts) => {
      const account = await accounts[0];

      if (winner == 0) {
        result = "Draw!";
      }
      else if (winner === account) {
        result = "You win!"
      }
      else {
        result = 'You lost!';
      }

      console.log(result);
      document.getElementById("result").innerHTML = `Round ${roundId}: ${result}`;
    });
  },

  populateHistoryTable: async (roundsData) => {

    rpsInstance = await App.contracts.RPS.deployed();

    rpsChoices = {0: "R", 1: "P", 2: "S"};

    web3.eth.getAccounts(async (error, accounts) => {
      account = await accounts[0];

      getPlayerString = (address, choice, winner) => {
        addressString = address.slice(0, 6) + "..";
        if (address == account) {
          playerString = "YOU" + " - " + rpsChoices[choice];
        } else if (address == rpsInstance.address){
          playerString = "House" + " - " + rpsChoices[choice];
        }
         else {
          playerString = addressString + " - " + rpsChoices[choice];
        }

        if (address == winner) {
          playerString = playerString.bold();
        }
        return playerString;
      }

      let table = document.getElementById("last-rounds-table");

      for(var i = 0; i < roundsData.length; i++) {
        // create a new row
        historyData = [
          roundsData[i].roundId,
          getPlayerString(roundsData[i].player1, roundsData[i].choice1, roundsData[i].winner),
          getPlayerString(roundsData[i].player2, roundsData[i].choice2, roundsData[i].winner),
          web3.fromWei(roundsData[i].betAmount)
          ];
        var newRow = table.insertRow(1);

        if (table.rows.length >= 8) {
          table.deleteRow(7);
        }

        for(var j = 0; j < historyData.length; j++) {
            // create a new cell
            var cell = newRow.insertCell(j);
            // add value to the cell
            cell.innerHTML = historyData[j];
        }
      }
    });
  },

  populateOpenedRoundsTable: async (roundsData) => {

    rpsInstance = await App.contracts.RPS.deployed();

    web3.eth.getAccounts(async (error, accounts) => {
      account = await accounts[0];

      getPlayerString = (address) => {
        addressString = address.slice(0, 6) + "..";
        if (address == account) {
          playerString = "YOU";
        } else {
          playerString = addressString;
        }


        return playerString;
      }

      let table = document.getElementById("opened-rounds-table");

      for(var i = 0; i < roundsData.length; i++) {
        // create a new row
        historyData = [
          roundsData[i].roundId,
          getPlayerString(roundsData[i].player1),
          web3.fromWei(roundsData[i].betAmount)
          ];
        var newRow = table.insertRow(1);

        // if (table.rows.length >= 8) {
        //   table.deleteRow(7);
        // }

        for(var j = 0; j < historyData.length; j++) {
            // create a new cell
            var cell = newRow.insertCell(j);
            // add value to the cell
            cell.innerHTML = historyData[j];
        }
      }
    });
  },

  deleteRoundOpenedTable: async (roundId) => {
    let table = document.getElementById("opened-rounds-table");

    for(var i = 1; i < table.rows.length; i++) {
      if (table.rows[i].cells[0].innerHTML == roundId.toNumber()) {
        table.deleteRow(i);
        break;
      }
    }
  },

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
