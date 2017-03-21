var casino = new Casino();

function Casino() {

	this.round = 1;

	//Table rules
	this.odds = 30;
	this.minBet = 1;
	this.payoutRate = 2;

	//Pay winnings
	this.pay = function(person) {

		//Don't subtract initial bet because it is included in the payout.
		person.bank += person.bet * this.payoutRate;
	};

	//Betting Method
	this.game = function() {

		//Winning roll
		if(roll() < this.odds) {

			//Pay winnings
			this.pay(player);

			//Reset to min bet
			player.win();

			//Next betting round
			this.round++;
		}
		//Losing roll
		else { player.lose(); }
	};

	//For fast running the game.
	this.gameLoop = function(rolls, rounds) {

		//Play once for every roll
		for (var i = 0; i < rolls; i++) { this.game(); }

		//Update page info
		gameDisplay.update();
	};
}