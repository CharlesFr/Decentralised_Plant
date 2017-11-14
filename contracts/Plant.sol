pragma solidity ^0.4.18;

contract Plant {
    
    address public creator;

	// initial Variables
	uint public number_of_leaves;
	uint public leaves_picked = 1; // has to start on 1 otherewise it cancels price calculation
	uint public initial_coins;
	uint public total_supply;
	uint public finney_balance; // 1 Ether is 1,000 finney - see this converter -> https://converter.murkin.me/
	uint public plant_price = 60; // Price is in Finney $20 if approx 60 Finney
	uint public coin_value;
	uint public plant_moisture;
	uint public number_of_plants;

	// Modififer to check if there's enough money for a new plant without wasting gas
	modifier only_if_enough_money() {
		require(finney_balance+10 > plant_price); 
		_;
	}

	// only_creator can update price
	modifier only_creator() {
		require(msg.sender == creator);
		_;
	}

	function Plant (uint _number_of_leaves, uint _initial_coins) payable {
		number_of_leaves = _number_of_leaves;
		initial_coins = _initial_coins;
		total_supply = initial_coins;
		plant_moisture = 70; // Ideal moisture for mint is 70% so let's start with this
		finney_balance = msg.value/1000000000000000;
		creator = msg.sender;
		coin_value = (finney_balance*leaves_picked*plant_moisture)/total_supply;
		number_of_plants ++;
		depositedFunds(msg.value, finney_balance);
	}

	function updatePrice(uint _plant_moisture, uint _leaves_picked) only_creator {
	    plant_moisture = _plant_moisture;
	    leaves_picked += _leaves_picked;
		uint coin_value = (finney_balance*leaves_picked*plant_moisture)/total_supply;
		buy_new_plant();
		updatedPrice(coin_value);
	}

	function buy_new_plant() private only_if_enough_money {
		total_supply += initial_coins;
		coin_value -= plant_price;
		number_of_plants ++; 
		plantWasPurchased(coin_value, total_supply);
	}

	function () payable {
		coin_value += msg.value/1000000000000000;
		depositedFunds(msg.value, coin_value);
	}

	function terminate() only_creator{
		selfdestruct(creator);
	}

	event plantWasPurchased(uint newBalance, uint newTotalSupply); // Event
	event updatedPrice(uint newPrice); // Event
	event depositedFunds(uint amount, uint newBalance); // Event

}