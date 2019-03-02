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

	this.pay = (person) => {
		person.bank += person.bet * this.payoutRate;
	};

	this.setRollRate = (rolls) => {
		this.rollRate = rolls;
	};

	this.setPayoutRate = (rate) => {
		this.payoutRate = rate;
	};

	this.setOdds = (percent) => {
		this.odds = percent;
	};

	this.roll = () => {
		return Math.random() * 100;
	}

	this.game = () => {

		if(this.roll() >= this.odds) {
			player.lose();
			return;			
		}
		
		this.pay(player);

		player.win();

		this.round++;
	};

	this.gameLoop = () => {

		for (var i = 0; i < this.rollRate; i++) { this.game(); }

		gameDisplay.update();
	};

	this.reset = () => {

		this.round = 1;

		//Table rules
		this.odds = 30;
		this.minBet = 1;
		this.payoutRate = 2;
	};
}