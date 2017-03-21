var player = new Casino_Player();

function Casino_Player() {
	
	//Cash
	this.bank = 100;
	this.losses = 0;
	this.investment = 0;
	
	//Betting
	this.bet = 1;
	this.betMulti = 1.5;
	this.highestBet = 1;

	//Betting safety checks
	this.betSafetyRate = 0;

	//When player wins
	this.win = function() {

		//Reset bet
		this.bet = casino.minBet;

		//Update round investment
		this.investment = this.bet;
	};

	//When player loses
	this.lose = function() {

		//Pay bet to casino
		this.bank -= this.bet;

		//Multiply bet
		this.bet *= this.betMulti;

		//Update round investment
		this.investment += this.bet;

		//Check for highest bet
		if (this.bet >= this.highestBet) { this.highestBet = this.bet; }
	};
}