App = {
  web3Provider: null,
  contracts: {},
  account00: '',

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
    });
  
    return App.bindEvents();
  },

  bindEvents: function() {
    // var isSolo = $("#soloPlayer").prop("checked", true);
    // (isSolo)? console.log('siiiii'): console.log('noooooooo');
    // console.log((isSolo !== null));
    // console.log(isSolo);
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

  showJackpot: function(){

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.RPS.deployed().then(function(instance) {
        rpsInstance = instance;

        // Execute adopt as a transaction by sending account
        return rpsInstance.getJackpot({from: account});
      }).then(function(result) {
        document.getElementById("jackpot").innerHTML = "Current jackpot: " + web3.fromWei(result, 'ether') + ' ETH';
        console.log(result);
      }).catch(function(err) {
        console.log(err.message);
      });
    });
      
  },

  playRound: function(choice) {
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

  joinRound: function(roundId, choice) {
    console.log(`joining round ${roundId} with choice ${choice}`);
    var betAmount = $('#betAmount').val();
    betAmount = web3.toWei(betAmount, 'ether')
    console.log(betAmount);
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.RPS.deployed().then(function(instance) {
        rpsInstance = instance;

        // Execute adopt as a transaction by sending account
        return rpsInstance.joinRound(roundId, choice, {from: account, value: betAmount});
      }).then(function(result) {
        App.showJackpot();

        var result='';

        return rpsInstance.getRoundInfo(roundId).then(function(result) {
          console.log("Player1: " + result[1]);
          console.log("Player2: " + result[3]);
          if (result[5] == 0) {
            console.log("Draw!");
            result = "Draw!";
          }
          else if (result[5] === account) {
            console.log("You win!");
            result = "You win!"
          }
          // else if (result[5] === App.contracts.RPS.address) {
          //   console.log("You lost!");
          //   result = "You lost!"
          // }
          // Add here about getting winner from contract
          else {
            console.log("You lost!");
            result = "You lost!";
          }
          document.getElementById("result").innerHTML = result;
          console.log(result[5])
          console.log("Bet amount: " + web3.fromWei(result[4]) + ' ETH');
        });
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  createRound: function(isSolo, choice) {
    console.log(`Users choice is: ${choice}`);
    var betAmount = $('#betAmount').val();
    betAmount = web3.toWei(betAmount, 'ether')
    console.log(betAmount);
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.RPS.deployed().then(function(instance) {
        rpsInstance = instance;

        // Execute adopt as a transaction by sending account
        return rpsInstance.createRound(isSolo, choice, {from: account, value: betAmount});
      }).then(function(result) {
        App.showJackpot();

        var result='';

        console.log("New round created");
        return rpsInstance.roundCount().then(function(result) {
          console.log("Last round: " + result);
          if (isSolo) {
            return rpsInstance.getRoundInfo(result).then(function(result) {
              console.log("Player1: " + result[1]);
              console.log("Player2: " + result[3]);
              if (result[5] == 0) {
                console.log("Draw!");
                result = "Draw!";
              }
              else if (result[5] === account) {
                console.log("You win!");
                result = "You win!"
              }
              else if (result[5] === App.contracts.RPS.address) {
                console.log("You lost!");
                result = "You lost!"
              }
              else {
                console.log("Error!");
                result = "ERROR!"
              }
              document.getElementById("result").innerHTML = result;
              console.log(result[5])
              console.log("Bet amount: " + web3.fromWei(result[4]) + ' ETH');
            })
          }
        });
        
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
