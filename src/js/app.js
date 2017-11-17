App = {
  web3Provider: null,
  contracts: {},

  init: function() {
<<<<<<< HEAD
    // Loading page
    console.log("Loading page...")
=======
    // // Load pets.
    // $.getJSON('../pets.json', function(data) {
    //   var petsRow = $('#petsRow');
    //   var petTemplate = $('#petTemplate');
    //
    //   for (i = 0; i < data.length; i ++) {
    //     petTemplate.find('.panel-title').text(data[i].name);
    //     petTemplate.find('img').attr('src', data[i].picture);
    //     petTemplate.find('.pet-breed').text(data[i].breed);
    //     petTemplate.find('.pet-age').text(data[i].age);
    //     petTemplate.find('.pet-location').text(data[i].location);
    //     petTemplate.find('.btn-adopt').attr('data-id', data[i].id);
    //
    //     petsRow.append(petTemplate.html());
    //   }
    // });

>>>>>>> develop
    return App.initWeb3();
  },

  initWeb3: function() {
<<<<<<< HEAD

    console.log("Loading Web3 instance...")

    // Is there is an injected web3 instance?
=======
      // Is there is an injected web3 instance?
>>>>>>> develop
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
<<<<<<< HEAD

    console.log("Loading contract...")

    $.getJSON('Plant.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var PlantArtifact = data;
      App.contracts.Plant = TruffleContract(PlantArtifact);

      // Set the provider for our contract
      App.contracts.Plant.setProvider(App.web3Provider);

      // Use our contract to retrieve and mark the adopted pets
      return App.SetContractValues();
=======
    $.getJSON('Adoption.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var AdoptionArtifact = data;
      App.contracts.Adoption = TruffleContract(AdoptionArtifact);

      // Set the provider for our contract
      App.contracts.Adoption.setProvider(App.web3Provider);

      // Use our contract to retrieve and mark the adopted pets
      return App.markAdopted();
>>>>>>> develop
    });

    return App.bindEvents();
  },

  bindEvents: function() {
<<<<<<< HEAD
    // $(document).on('click', '.btn-submit', App.handlePicking);
    $(document).ready(function() {
        $('.btn-submit').click(function(event) {
          var term = $('#search').val();
          App.handlePicking(term);
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

      for(i = 0; i < stat.length;i++){
        status.push(stat[i].c);
      }

      // Update the UI below

      var markup = "<tr><td>" + status[0] + "</td>\
      <td>" + status[1] + "</td>\
      <td>" + status[2] + "</td>\
      <td>" + status[3] + "</td></tr>";
      $("table tbody").append(markup);
      
      
    }).catch(function(err) {
      console.log(err.message);
    });

  },

  handlePicking: function(leafNum) {

    console.log("Handling leaf picking...")
    
    if(isNaN(leafNum)){
      alert("\"" + String(leafNum) + "\" is not a number, please try again.")
    } else {


      web3.eth.getAccounts(function(error, accounts) {
        if (error) {
        console.log(error);
        }

        var account = accounts[0];
        console.log(account);

        App.contracts.Plant.deployed().then(function(instance) {
          plantInstance = instance;

          // Execute leaf picking function
          return plantInstance.leafPicked(parseInt(leafNum), {from: account});
        }).then(function(result) {
          console.log(result);
          return App.SetContractValues();
        }).catch(function(err) {
          console.log(err.message);
        });
      });

    }

=======
    $(document).on('click', '.btn-adopt', App.handleAdopt);
  },

  markAdopted: function(adopters, account) {
    var adoptionInstance;

    App.contracts.Adoption.deployed().then(function(instance) {
      adoptionInstance = instance;

      return adoptionInstance.getAdopters.call();
    }).then(function(adopters) {
      for (i = 0; i < adopters.length; i++) {
        if (adopters[i] !== '0x0000000000000000000000000000000000000000') {
          $('.panel-pet').eq(i).find('button').text('Success').attr('disabled', true);
        }
      }
    }).catch(function(err) {
      console.log(err.message);
    });
  },

  handleAdopt: function() {
    event.preventDefault();

    var petId = parseInt($(event.target).data('id'));
    var adoptionInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Adoption.deployed().then(function(instance) {
        adoptionInstance = instance;

        // Execute adopt as a transaction by sending account
        return adoptionInstance.adopt(petId, {from: account});
      }).then(function(result) {
        return App.markAdopted();
      }).catch(function(err) {
        console.log(err.message);
      });
    });
>>>>>>> develop
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
<<<<<<< HEAD

=======
>>>>>>> develop
