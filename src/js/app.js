App = {
  web3Provider: null,
  contracts: {},
  results: null,

  init: function() {
    // Loading page
    console.log("Loading page...")
    return App.initWeb3();
  },

  initWeb3: function() {

    console.log("Loading Web3 instance...")

    // Is there is an injected web3 instance?
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
    } else {
      // If no injected web3 instance is detected, fallback to the TestRPC
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
    }
    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: function() {

    console.log("Loading contract...")

    $.getJSON('Plant.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var PlantArtifact = data;
      App.contracts.Plant = TruffleContract(PlantArtifact);

      // Set the provider for our contract
      App.contracts.Plant.setProvider(App.web3Provider);

      // Use our contract to retrieve and mark the adopted pets
      return App.SetContractValues();
    });

    return App.bindEvents();
  },

  bindEvents: function() {
    // $(document).on('click', '.btn-submit', App.handlePicking);
    $(document).ready(function() {

      // Listener for leaf picking
      $('#submitButtonLeafPicking').click(function(event) {
        $('#leavesNumberEntry').html(function(i, val) {
          //console.log("the value is:", val);
          return App.handlePicking(parseInt(val));
        });
      });

      // Listener for sending ether
      $('#submitButtonSendEther').click(function(event) {
        $('#ETHValue').html(function(i, val) {
          console.log("Sending this amount of Ether:", val);
          return App.sendEther(parseFloat(val));
        });
      });

      // Listener for deposits
      $('#transactionModalId').click(function(event) {
        console.log('get transactions');
        return App.getTransactions();
      });

      // Listener for harvests
      $('#harvestsModalId').click(function(event) {
        console.log('get harvests');
        return App.getHarvests();
      });

    })
  },

  SetContractValues: function(adopters, account) {

    console.log("Loading contract variables...", )

    var adoptionInstance;
    var status = [];

    App.contracts.Plant.deployed().then(function(instance) {
      adoptionInstance = instance;
      return adoptionInstance.getStatus.call();
    }).then(function(stat) {

      // The order of the variables in status is:
      // 0 -> remaining_leaves
      // 1 -> total_supply
      // 2 -> finney_balance
      // 3 -> number_of_plants

      for (i = 0; i < stat.length; i++) {
        status.push(stat[i].c);
      }
      console.log(status);
      $('#mintCoin').text(status[1]);
      $('#totalLeaves').text(status[0]);

      // Update the UI below

      $("mintCoin").text(status[1]);


    }).catch(function(err) {
      console.log(err.message);
    });

  },

  handlePicking: function(leafNum) {

    console.log("About to pick", leafNum, "leaves.")
    tree.removeLeaves(parseInt(leafNum));

    getAccounts().then(function(accounts) {
      var account = accounts[0];
      console.log(account);

      return App.contracts.Plant.deployed().then(function(instance) {
        plantInstance = instance;
        // Execute leaf picking function
        return plantInstance.leafPicked(parseInt(leafNum), {
          from: account,
          value: web3.toWei(0.01)
        });
      });
    }).then(function(result) {
      console.log(result);
      return App.SetContractValues();
    }).catch(function(err) {
      console.log(err.message);
    });
  },

  getTransactions: function() {
    return getAccounts().then(function(accounts) {
      // var account = accounts[0];
      // console.log(account);
      return App.contracts.Plant.deployed();
    }).then(function(instance) {
      return getBlockNumber();
    }).then(function(number) {
      var blockPromises = [];

      for (i = number;
        (i >= 0 && i > (number - 5)); i--) {
        blockPromises.push(getBlock(i));
      }

      return Promise.all(blockPromises);
    }).then(function(blocks) {
      var transactionPromises = [];
      for (var b = 0; b < blocks.length; b++) {
        var block = blocks[b];
        var transactions = block.transactions;

        for (var j = 0; j < transactions.length; j++) {
          var transactionHash = transactions[j];
          transactionPromises.push(getTransaction(transactionHash));
        }
      }

      return Promise.all(transactionPromises);
    }).then(function(result) {
      var markup = "";
      for (var i = 0; i < result.length; i++) {
        var transaction = result[i];
        if (transaction) {
          markup += "<tr><td>" + transaction.blockNumber + "</td>\
          <td>" + transaction.from + "</td>\
          <td>" + web3.fromWei(transaction.value.toString(10), 'ether') + "</td></tr>";
        }
      }

      $("table .trans").html(markup);
    }).catch(function(err) {
      console.log(err.message);
    });
  },

  sendEther: function(_value) {
    // Enter details to send transaction;
    return getAccounts().then(function(accounts) {
      var account = accounts[0];
      console.log(account);
      return App.contracts.Plant.deployed();
    }).then(function(instance) {
      plantInstance = instance;
      // Execute leaf picking function
      return plantInstance.send(web3.toWei(_value, "ether"));

    }).then(function(result) {
      console.log("Results:", result);
      return App.SetContractValues();
    }).catch(function(err) {
      console.log(err.message);
    });
  },

  getHarvests: function() {

    return App.contracts.Plant.deployed().then(instance => {
      return instance.pickedEvent({}, {
        fromBlock: 0,
        toBlock: 'latest'
      });
    }).then(events => {
      return getEvents(events);
    }).then(result => {
      console.log(result[0]._time.c);
      var markup = "";
      for (var i = 0; i < result.length; i++) {
        var eventLog = result[i];
        var date = new Date(eventLog._time.c[0]);
        if (eventLog) {
          markup += "<tr><td>" + epochStringifyDate(date) + "</td>\
              <td>" + eventLog.harvester + "</td>\
              <td>" + eventLog.leafTaken + "</td></tr>";
        }
      }

      $("table .harvests").html(markup);
    });

    // App.contracts.Plant.deployed().then(function(instance) {
    //   let transferEvent = instance.pickedEvent({}, {
    //     fromBlock: 0,
    //     toBlock: 'latest'
    //   });
    //   return transferEvent.get((errors, logs) => {
    //     if (errors) console.log(errors, logs);
    //     logs.forEach(log => console.log("before", log.args))
    //     return logs.args;
    //   });
    // }).then((logs) => {
    //   console.log("after", logs);
    //   var markup = "";
    //   for (var i = 0; i < logs.length; i++) {
    //     var eventLog = logs[i];
    //     if (transaction) {
    //       markup += "<tr><td>" + (new Date(eventLog._time)).toString() + "</td>\
    //         <td>" + eventLog.harvester + "</td>\
    //         <td>" + eventLog.leafTaken + "</td></tr>";
    //     }
    //   }
    //
    //   $("table .harvests").html(markup);
    // });

    // App.contracts.Plant.deployed().then(function(instance) {
    //   return instance.allEvents({
    //     fromBlock: 0,
    //     toBlock: 'latest'
    //   });
    // }).then(function(events) {
    //   events.watch((error, result) => {
    //     console.log(result);
    //   });
    // });
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});


function epochStringifyDate(_unix) {
  var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var today = new Date(0);
  today.setUTCSeconds(_unix);
  var hh = today.getHours();
  var ms = today.getMinutes();
  var ss = today.getSeconds();
  var dd = today.getDate();
  var mm = today.getMonth() + 1; //January is 0!
  var yyyy = today.getFullYear() - 2000;


  if (dd < 10) {
    dd = '0' + dd
  }

  if (ss < 10) {
    ss = '0' + ss
  }

  if (mm < 10) {
    mm = '0' + mm
  }

  today = hh + ":" + ms + ":" + ss + " " + dd + "/" + mm + "/" + yyyy;
  return today;
}