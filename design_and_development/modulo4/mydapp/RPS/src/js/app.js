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
      App.manageGameEvents();

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
  
    // web3.eth.getAccounts(function(error, accounts) {
    //   if (error) {
    //     console.log(error);
    //   }


    // });
  },

  manageGameEvents: async () => {
    rpsInstance = await App.contracts.RPS.deployed();
    // var eventRoundCreated = rpsInstance.RoundCreated();
    // watch for changes
    web3.eth.getAccounts(async (error, accounts) => {
      account = accounts[0];

      rpsInstance.RoundCreated({
        filter: {player1: account}, // TODO: This is not working
      }
      ).watch(function(error, result){
          if (!error)
            console.log('Event "RoundCreated" received for player ' + account);
            console.log(result.args);
            // App.showResult(result.args.roundId, result.args.winner);
      });

      // rpsInstance.RoundResolved({
      //   filter: {player1: account}, // TODO: This is not working
      // }
      // ).watch(function(error, result){
      //     if (!error)
      //       console.log('Event "RoundResolved" received for player ' + account);
      //       console.log(result.args.roundId.toNumber());
      //       console.log('hola')
      //       const winner = result.args.
            // return rpsInstance.getRoundInfo(result.args.roundId.toNumber()).then(function(result) {
            //   console.log("Player1: " + result[1]);
            //   console.log("Player2: " + result[3]);
            //   if (result[5] == 0) {
            //     console.log("Draw!");
            //     result = "Draw!";
            //   }
            //   else if (result[5] === account) {
            //     console.log("You win!");
            //     result = "You win!"
            //   }
            //   // else if (result[5] === App.contracts.RPS.address) {
            //   //   console.log("You lost!");
            //   //   result = "You lost!"
            //   // }
            //   // Add here about getting winner from contract
            //   else {
            //     console.log("You lost!");
            //     result = "You lost!";
            //   }
            //   // document.getElementById("result").innerHTML = result;
            //   App.showResult(result.args.roundId.toNumber(), result);
            //   console.log(result[5])
            //   // console.log("Bet amount: " + web3.fromWei(result[4]) + ' ETH');
            // });

      });

    rpsInstance.RoundResolved(
    ).watch(function(error, result){
        if (!error)
          console.log('Event "RoundResolved" received');
          console.log(result.args.roundId.toNumber());
          console.log(result.args.winner);
          console.log(result.args);
          console.log('que he dicho que cretaed');
          App.showResult(result.args.roundId, result.args.winner);
    });

    // var subscription = web3.eth.subscribe('logs', {
    //   player1: '0xb3c750A6D40bF5D3919e92349b24b5f863B90965',
    //   // topics: ['0x12345...']
    // }, function(error, result){
    //     if (!error)
    //         console.log('conioooooo');
    //         console.log(result);
    // })
    // .on("data", function(log){
    //     console.log('ooooooootiaaaa');
    //     console.log(log);
    // })
    // .on("changed", function(log){
    // });

  },

  showJackpot: function(){

    // App.contracts.RPS.deployed().then(function(instance) {
    //   rpsInstance = instance;
    //   var event = rpsInstance.RoundCreated();
    //   // watch for changes
    //   event.watch(function(error, result2){
    //       if (!error)
    //           console.log('holahola')
    //           // console.log(result2)
    //           console.log(result2.args);
    //           console.log('caracola')
    //   });
    // });

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.RPS.deployed().then(function(instance) {
        rpsInstance = instance;

        // Execute adopt as a transaction by sending account
        return rpsInstance.jackpot({from: account});
      }).then(function(result) {
        document.getElementById("jackpot-amount").innerHTML = web3.fromWei(result, 'ether') + ' ETH';
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

        // return rpsInstance.getRoundInfo(roundId).then(function(result) {
        //   console.log("Player1: " + result[1]);
        //   console.log("Player2: " + result[3]);
        //   if (result[5] == 0) {
        //     console.log("Draw!");
        //     result = "Draw!";
        //   }
        //   else if (result[5] === account) {
        //     console.log("You win!");
        //     result = "You win!"
        //   }
        //   // else if (result[5] === App.contracts.RPS.address) {
        //   //   console.log("You lost!");
        //   //   result = "You lost!"
        //   // }
        //   // Add here about getting winner from contract
        //   else {
        //     console.log("You lost!");
        //     result = "You lost!";
        //   }
        //   // document.getElementById("result").innerHTML = result;
        //   App.showResult(roundId, result);
        //   console.log(result[5])
        //   console.log("Bet amount: " + web3.fromWei(result[4]) + ' ETH');
        // });
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


        //var result='';

        console.log("New round created");
        console.log(result.logs)

        ///////////////////////
        var event = rpsInstance.RoundCreated();

        // watch for changes
        // event.watch(function(error, result2){
        //     if (!error)
        //         console.log('holahola')
        //         // console.log(result2)
        //         console.log(result2.args);
        //         console.log('caracola')
        // });
        ////////////////////////////////

        // rpsInstance.events.RoundCreated({
        //   // filter: {myIndexedParam: [20,23], myOtherIndexedParam: '0x123456789...'}, // Using an array means OR: e.g. 20 or 23
        //   // fromBlock: 0
        // }, function(error, event){ console.log(event); })
        // .on('data', function(event){
        //     console.log('xxxxxxxxxxxxxxxxxx')
        //     console.log(event); // same results as the optional callback above
        // })
        // .on('changed', function(event){
        //     // remove event from local database
        // })
        // .on('error', console.error);

        // return rpsInstance.roundCount().then(function(result) {
        //   roundId = result;
        //   console.log("Last round: " + result);
        //   if (isSolo) {
        //     return rpsInstance.getRoundInfo(result).then(function(result) {
        //       console.log("Player1: " + result[1]);
        //       console.log("Player2: " + result[3]);
        //       if (result[5] == 0) {
        //         console.log("Draw!");
        //         result = "Draw!";
        //       }
        //       else if (result[5] === account) {
        //         console.log("You win!");
        //         result = "You win!"
        //       }
        //       else if (result[5] === App.contracts.RPS.address) {
        //         console.log("You lost!");
        //         result = "You lost!"
        //       }
        //       else {
        //         console.log("Error!");
        //         result = "ERROR!"
        //       }
        //       // document.getElementById("result").innerHTML = result;
        //       App.showResult(roundId, result);
        //       console.log(result[5])
        //       console.log("Bet amount: " + web3.fromWei(result[4]) + ' ETH');
        //     })
        //   }
        // });
        
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  showResult: (roundId, winner) => {
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      console.log('winner: ' + winner);
      console.log('my account: '+ account);

      if (winner == 0) {
        result = "Draw!";
      }
      else if (winner === account) {
        result = "You win!"
      }
      else if (result[5] === App.contracts.RPS.address) {
        result = "You lost!"
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
