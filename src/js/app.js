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

      // Listener for transactions
      $('#transactionModalId').click(function(event) {
        console.log('get transactions');
        return App.getTransactions();
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

      var account = accounts[1];
      console.log(account);

      App.contracts.Plant.deployed().then(function(instance) {
        plantInstance = instance;
        // Execute leaf picking function
        return plantInstance.receiveEther({
          from: account,
          value: web3.toWei(_value)
        });
      }).then(function(result) {
        console.log(result);
        return App.SetContractValues();
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  getTransactions: function() {
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      // var account = accounts[0];
      // console.log(account);

      App.contracts.Plant.deployed().then(function(instance) {
        // Execute leaf picking function
        return new Promise(function(resolve, reject) {
          var transactionPromises = [];
          var blockPromises = [];
          web3.eth.getBlockNumber(function(err, number) {
            if (err) {
              reject(err)
            }
            for (i = number;
              (i >= 0 && i > (number - 5)); i--) {
              blockPromises.push(new Promise(function(resolve, reject) {
                web3.eth.getBlock(i, function(err, result) {
                  if (err) {
                    reject(err)
                  }
                  var transactions = result.transactions;
                  for (var j = 0; j < transactions.length; j++) {
                    var transactionHash = transactions[j];
                    transactionPromises.push(new Promise(function(resolve, reject) {
                      web3.eth.getTransaction(transactionHash, function(err, result) {
                        if (err) {
                          reject(err)
                        }
                        resolve(result);
                      })
                    }))
                    resolve();
                  }
                  // console.log(result);
                });
              }));
            }
            Promise.all(blockPromises).then(function() {
                return Promise.all(transactionPromises).then(function(results) {
                  console.log(results);
                  resolve(results);
                });
              })
              .catch(function(err) {
                reject(err);
              });
          });
        });
      }).then(function(result) {
        console.log(result[0]);
        for (var i = 0; i < result.length; i++) {
          var transaction = result[i];
          var markup = "<tr><td>" + transaction.blockNumber + "</td>\
            <td>" + transaction.from + "</td>\
            <td>" + transaction.value.toString(10) + "</td></tr>";
        }

        $("table tbody").append(markup);
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
        plantInstance.send(web3.toWei(_value, "ether"));
        // return plantInstance.sendEther({
        //   from: account,
        //   value: _value
        // });
      }).then(function(result) {
        console.log(result);
        return App.SetContractValues();
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