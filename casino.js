

//Player
var bet = 1;
var day = 1;
var bank = 1000;
var winnings = 0;
var betMultiplier = 2.1;
var highestBet = 0;

//Casino
var odds = 30;
var minBet = 1;
var payoutRate = 2;

//Random Gen
function roll() {
	
	return Math.random() * 100;
}

//Get the Casino Info
function getCasinoInfo() {
	
	document.getElementById("odds").innerHTML = "Odds: " + odds + "%";
	document.getElementById("min-bet").innerHTML = "Min Bet: " + minBet;
	document.getElementById("payout-rate").innerHTML = "Payout Rate: " + payoutRate + "x";
}

function getGambleInfo() {
	
	document.getElementById("bet").innerHTML = "Bet: " + bet.toFixed(2);
	document.getElementById("bank").innerHTML = "Bank: " + bank.toFixed(2);
}

function getPlayerInfo() {

	document.getElementById("winnings").innerHTML = "Winnings: " + winnings.toFixed(2);
	document.getElementById("multiplier").innerHTML = "Bet Multi: " + betMultiplier.toFixed(2) + "x";
	document.getElementById("highestBet").innerHTML = "Highest Bet: " + highestBet.toFixed(2);
}

//Update the DOM Info
function pageUpdate() {

	document.getElementById("day").innerHTML = "Round: " + day;

	//Get Casino Info
	getCasinoInfo();

	//Get Gambling Info
	getGambleInfo();

	//Get Player Info
	getPlayerInfo();
	
	//Run Casino Game
	game();
}

//Casino game
function game() {

	//Use bank for gambling
	winnings = bank;

	//Winning roll
	if(roll() < odds) {

		//Pay winnings to player
		winnings += ((bet * payoutRate) - bet);

		//Reset to min bet
		bet = minBet;
	}
	//Losing roll
	else {

		//Pay bet to casino
		winnings -= bet;

		//Multiply bet
		bet *= betMultiplier;

		//Check for highest bet
		if (bet >= highestBet) { highestBet = bet; }
	}

	//Return money to bank
	bank = winnings;

	//Go to next day
	day++;
}