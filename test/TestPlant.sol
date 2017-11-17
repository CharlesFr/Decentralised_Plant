pragma solidity ^0.4.11;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Plant.sol";

contract TestPlant {
  Plant plant = Plant(DeployedAddresses.Plant());

  // Testing the adopt() function
	function testPickingLeaf() {
	  uint remainingLeaves = plant.leafPicked(1);

	  uint expected = 99;

	  Assert.equal(remainingLeaves, expected, "If we pick one leaf we should have 99 left.");
	}

}