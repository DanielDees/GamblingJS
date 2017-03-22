var casino = new Casino();

function Casino() {

	//Number of times player has won
	this.round = 1;

	//Times rolled per game loop
	this.rollRate = 1;
	this.MAX_ROLL_RATE = 10000000;
	this.MIN_ROLL_RATE = 1;

	//Table rules
	this.odds = 30;
	this.minBet = 1;
	this.payoutRate = 2;

	//Pay winnings
	this.pay = function(person) {

		//Don't subtract initial bet because it is included in the payout.
		person.bank += person.bet * this.payoutRate;
	};

	//Change roll rate per game loop
	this.rollRateMulti = function(mod) {

		if (this.rollRate * mod <= this.MAX_ROLL_RATE && this.rollRate * mod >= this.MIN_ROLL_RATE) {

			this.rollRate *= mod;
		};

		//Update Roll button
		gameDisplay.setButtonInfo();
	};

	//Change payout rate
	this.payoutRateMod = function(mod) {

		if (this.payoutRate + mod >= 0) { this.payoutRate += mod; }

		//Update Casino Info
		gameDisplay.setCasinoInfo();
	};

	this.oddsMod = function(mod) {
		
		if(this.odds + mod >= 0 && this.odds + mod <= 100) { this.odds += mod; }

		//Update Casino Info
		gameDisplay.setCasinoInfo();
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
	this.gameLoop = function(rounds) {

		//Play once for every roll
		for (var i = 0; i < this.rollRate; i++) { this.game(); }

		//Update page info
		gameDisplay.update();
	};

	//Reset to defaults
	this.reset = function() {

		this.round = 1;

		//Table rules
		this.odds = 30;
		this.minBet = 1;
		this.payoutRate = 2;
	};
}