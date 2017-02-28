//Player
var bet = 1;
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

//Casino game
function game(day) {
	
	//Default the values
	var turn = 0;

	//Use 1k saved for gambling
	winnings = dailyGamble;

	//Start day at min bet
	bet = minBet;

	//Play 100x or until loss
	while(turn < 100 && winnings > 0) {

		//Winning roll
		if(roll() < odds) {

			//Pay winnings to player
			winnings += ((bet * payoutRate) - bet);

			console.log("Bet: " + bet + " | Won: " + (bet * payoutRate));

			//Player resets to minimum bet
			bet = minBet;
		}
		//Losing roll
		else {

			//Pay bet to casino
			winnings -= bet;

			console.log("Bet: " + bet + " | Lost: " + bet);

			//Double bet amount for next roll
			bet *= betMultiplier;

			if (bet >= highestBet) { 

				highestBet = bet;
				//console.log("Day: " + (day + 1) + " | bet: " + bet); 
			}
		}

		turn++;
	}

	//Save 1k for next day
	winnings -= dailyGamble;

	//Add difference to bank
	bank += winnings;

	console.log("DAY: " + (day + 1));
	console.log("Winnings: " + winnings);
	console.log("Bank account: " + bank);
}

//Spend x days gambling
function daysGambling(days) {

	//Visit the casino every day
	for (var i = 0; i < days; i++) { game(i); }
}