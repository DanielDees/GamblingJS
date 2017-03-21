//Player
var bet = 1;
var day = 1;
var bank = 0;
var dailyGamble = 1000;
var winnings = 0;
var betMultiplier = 2;
var highestBet = 0;

//Casino
var odds = 30;
var minBet = 1;
var payoutRate = 2;

//Random Gen
function roll() {
	
	return Math.random() * 100;
}

//Update the DOM Info
function pageUpdate() {

	document.getElementById("payout-rate").innerHTML = "Payout Rate: " + payoutRate + "x";
	document.getElementById("min-bet").innerHTML = "Min Bet: " + minBet;
	document.getElementById("odds").innerHTML = "Odds: " + odds;
	document.getElementById("day").innerHTML = "Day: " + day;
	document.getElementById("bet").innerHTML = "Bet: " + bet;
	document.getElementById("bank").innerHTML = "Bank: " + bank;
	document.getElementById("winnings").innerHTML = "Winnings: " + winnings;
	document.getElementById("multiplier").innerHTML = "Bet Multi: " + betMultiplier;
	document.getElementById("highestBet").innerHTML = "Highest Bet: " + highestBet;
	document.getElementById("dailyGamble").innerHTML = "Today's Money: " + dailyGamble;

	game();
}

//Casino game
function game() {

	//Use 1k saved for gambling
	winnings = dailyGamble;

	//Winning roll
	if(roll() < odds) {

		//Pay winnings to player
		winnings += ((bet * payoutRate) - bet);

		//Player resets to minimum bet
		bet = minBet;
	}
	//Losing roll
	else {

		//Pay bet to casino
		winnings -= bet;

		//Double bet amount for next roll
		bet *= betMultiplier;

		//Check for highest bet
		if (bet >= highestBet) { highestBet = bet; }
	}

	//Save 1k for next day
	winnings -= dailyGamble;

	//Add difference to bank
	bank += winnings;

	//Go to next day
	day++;
}