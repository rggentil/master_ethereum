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

      rpsInstance.RoundCreated({player1: account}).watch((error, result) => {
            if (!error)
              console.log('Event "RoundCreated" ' + result.args.roundId.toNumber() + ' received for player');
              // console.log(result.args);
      });

      rpsInstance.RoundResolved({player1: account}
      ).watch((error, result) => {
          if (!error)
            console.log('Event "RoundResolved" ' + result.args.roundId.toNumber() + ' received for player');
            // console.log(result.args);
            App.showResult(result.args.roundId, result.args.winner);
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
        document.getElementById("metamask-player").innerHTML = account;
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

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
