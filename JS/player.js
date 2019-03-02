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

	this.bankHistory = [];

	this.getSafeBets = () => {
		var max = 0;

		while(this.bet * Math.pow(this.betMulti, max + 1) < this.bank) { max++; }

		return max;
	}

	this.getSafeBetOdds = () => {
		return (Math.pow((100 - casino.odds) / 100, this.getSafeBets()) * 100).toFixed(8);
	}

	this.win = () => {

		//Player has already been paid here
		this.bankHistory.push(this.bank);

		this.bet = casino.minBet;

		//Update round investment
		this.investment = this.bet;
	};

	this.lose = () => {

		//Pay bet to casino
		this.bank -= this.bet;
		this.bankHistory.push(this.bank);

		this.bet *= this.betMulti;

		//Update round investment
		this.investment += this.bet;

		if (this.bet >= this.highestBet) { this.highestBet = this.bet; }
	};

	this.reset = () => {

		this.bank = 100;
		this.bankHistory = [];
		this.losses = 0;
		this.investment = 0;
		
		this.bet = 1;
		this.betMulti = 1.5;
		this.highestBet = 1;

		this.betSafetyRate = 0;
	};
}