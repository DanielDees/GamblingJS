var casino = new Casino();

function Casino() {

	this.round = 1;

	//Casino
	this.odds = 30;
	this.minBet = 1;
	this.payoutRate = 2;

	//Casino game
	this.game = function() {

		//Winning roll
		if(roll() < this.odds) {

			//Pay winnings to player
			player.bank += ((player.bet * this.payoutRate) - player.bet);

			//Reset to min bet
			player.bet = this.minBet;

			//Next betting round
			this.round++;
		}
		//Losing roll
		else {

			//Pay bet to casino
			player.bank -= player.bet;

			//Multiply bet
			player.bet *= player.betMulti;

			//Check for highest bet
			if (player.bet >= player.highestBet) { player.highestBet = player.bet; }
		}
	}

	//For fast running the game.
	this.gameLoop = function(rounds) {

		for (var i = 0; i < rounds; i++) { this.game(); }

		gameDisplay.update();
	}
}