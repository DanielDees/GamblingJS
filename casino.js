//Player
var bet = 1;
var round = 1;
var bank = 100;
var losses = 0;
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

//Get max bets that can be made before going negative in the bank
function getMaxSafeBets() {
	
	var max = 0;

	//Get max times bet can occur before going over bank limit
	while(bet * Math.pow(betMultiplier, max) < bank) { max++; }

	return max;
}

//Get the odds of exceeding the max bet if continued betting occurs
function getMaxSafeBetsOdds() {
	
	return (Math.pow((100 - odds) / 100, getMaxSafeBets()) * 100).toFixed(2)
}

//Get the Casino Info
function getCasinoInfo() {
	
	document.getElementById("odds").innerHTML = "Odds: " + odds + "%";
	document.getElementById("min-bet").innerHTML = "Min Bet: " + minBet;
	document.getElementById("payout-rate").innerHTML = "Payout Rate: " + payoutRate + "x";
}

//Get Gambling Info
function getGambleInfo() {
	
	document.getElementById("bet").innerHTML = "Bet: " + bet.toFixed(2);
	document.getElementById("bank").innerHTML = "Bank: " + bank.toFixed(2);
	document.getElementById("max-safe-bets").innerHTML = "Max Safe Bets: " + getMaxSafeBets();
	document.getElementById("max-safe-bets-odds").innerHTML = "Max Safe Bets Odds: " + getMaxSafeBetsOdds() + "%";
}

//Get Player Info
function getPlayerInfo() {

	document.getElementById("multiplier").innerHTML = "Bet Multi: " + betMultiplier.toFixed(2) + "x";
	document.getElementById("highestBet").innerHTML = "Highest Bet: " + highestBet.toFixed(2);
}

//Update the DOM Info
function pageUpdate() {

	document.getElementById("day").innerHTML = "Round: " + round;

	//Get Casino Info
	getCasinoInfo();

	//Get Gambling Info
	getGambleInfo();

	//Get Player Info
	getPlayerInfo();
}

//Casino game
function game() {

	//Winning roll
	if(roll() < odds) {

		//Pay winnings to player
		bank += ((bet * payoutRate) - bet);

		//Reset to min bet
		bet = minBet;

		//Next betting round
		round++;
	}
	//Losing roll
	else {

		//Pay bet to casino
		bank -= bet;

		//Multiply bet
		bet *= betMultiplier;

		//Check for highest bet
		if (bet >= highestBet) { highestBet = bet; }
	}
}

//For fast running the game.
function gameLoop(rounds) {

	for (var i = 0; i < rounds; i++) { game(); }

	pageUpdate();
}