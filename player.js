var player = new Casino_Player();

function Casino_Player() {
	
	//Cash
	this.bank = 100;
	this.losses = 0;
	
	//Betting
	this.bet = 1;
	this.betMulti = 2.1;
	this.highestBet = 1;
}