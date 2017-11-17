var Plant = artifacts.require("Plant");

module.exports = function(deployer, network, accounts) {
  deployer.deploy(Plant, 100, 100000, { from: accounts[0], value: 1e17 } ); // 1e17 is 100 Finney
};
