pragma solidity ^0.4.18;

contract Plant {
    
    address public creator;

	// initial Variables
	uint public number_of_leaves;
	uint public remaining_leaves = 0; // has to start on 1 otherwise it cancels price calculation
	uint public initial_coins;
	uint public total_supply;
	uint public finney_balance; // 1 Ether is 1,000 finney - see this converter -> https://converter.murkin.me/
	uint public plant_price = 60; // Price is in Finney $20 if approx 60 Finney
	uint public number_of_plants;

	// Modififer to check if there's enough money for a new plant without wasting gas
	modifier onlyIfEnoughMoney() {
		require(finney_balance > plant_price); 
		_;
	}

	// only_creator can update price
	modifier onlyCreator() {
		require(msg.sender == creator);
		_;
	}
	
	// you need to send some money to initialise the contract
	modifier enoughToInitialise() {
		require(msg.value > 0);
		_;
	}

	function Plant(uint _number_of_leaves, uint _initial_coins) public payable enoughToInitialise {
		number_of_leaves = _number_of_leaves;
		remaining_leaves = number_of_leaves;
		initial_coins = _initial_coins;
		total_supply = initial_coins;
		finney_balance = msg.value/1000000000000000;
		creator = msg.sender;
		number_of_plants = 1;
		depositedFunds(msg.value, finney_balance);
	}

	function buy_new_plant() private onlyIfEnoughMoney {
	    
	    uint number_plants_to_buy = finney_balance / plant_price;
	    
		total_supply += (initial_coins*number_plants_to_buy);
		finney_balance -= (plant_price*number_plants_to_buy);
		number_of_plants += number_plants_to_buy; 
		plantWasPurchased(finney_balance, total_supply, number_of_plants);
	}

	function () payable public {
		finney_balance += msg.value/1000000000000000;
		buy_new_plant();
		depositedFunds(msg.value, finney_balance);
	}

	function terminate() private onlyCreator{
		selfdestruct(creator);
	}

	function getStatus() returns (uint leaves, uint outstandingTokens, uint balance, uint numberOfPlants){
		return(remaining_leaves, total_supply, finney_balance, number_of_plants);
	}
	
	function leafPicked(uint numPicked) public returns (uint, uint){
	    require(numPicked < remaining_leaves);
	    uint number_before_picking = remaining_leaves;
	    remaining_leaves -= numPicked;
	    leafWasPicked(remaining_leaves, numPicked);
	    return (remaining_leaves, number_before_picking);
	}
    
    event leafWasPicked(uint leavesLeft, uint numberTaken);
	event plantWasPurchased(uint newBalance, uint newTotalSupply, uint newPlantNumber); // Event
	event depositedFunds(uint amount, uint newBalance); // Event

}