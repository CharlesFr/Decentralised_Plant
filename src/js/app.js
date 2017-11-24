App = {
  web3Provider: null,
  contracts: {},

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

      var markup = "<tr><td>" + status[0] + "</td>\
      <td>" + status[1] + "</td>\
      <td>" + status[2] + "</td>\
      <td>" + status[3] + "</td></tr>";
      $("table tbody").append(markup);

      $("mintCoin").text(status[1]);


    }).catch(function(err) {
      console.log(err.message);
    });

  },

  handlePicking: function(leafNum) {

    console.log("About to pick", leafNum, "leaves.")
    tree.removeLeaves(parseInt(leafNum));

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];
      console.log(account);

      App.contracts.Plant.deployed().then(function(instance) {
        plantInstance = instance;
        // Execute leaf picking function
        return plantInstance.leafPicked(parseInt(leafNum), {
          from: account
        });
      }).then(function(result) {
        console.log(result);
        return App.SetContractValues();
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  sendEther: function(_value) {

    // Enter details to send transaction;
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];
      console.log(account);

      App.contracts.Plant.deployed().then(function(instance) {
        plantInstance = instance;
        // Execute leaf picking function
        return plantInstance.sendEther({
          from: account,
          gas: ,
          value: _value
        });
      }).then(function(result) {
        console.log(result);
        return App.SetContractValues();
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});