var gameDisplay = new Casino_DOM_Updater;

function Casino_DOM_Updater() {

	//Get the Casino Info
	this.setCasinoInfo = function() {
		
		$("#odds").html("Win Odds: " + casino.odds + "%");
		$("#min-bet").html("Min Bet: " + casino.minBet);
		$("#payout-rate").html("Payout Rate: " + casino.payoutRate.toFixed(1) + "x");
	};

	//Get Gambling Info
	this.setGambleInfo = function() {
		
		$("#bank").html("Bank: " + player.bank.toFixed(2));
		$("#multiplier").html("Bet Multi: " + player.betMulti + "x");
		$("#avg-return").html("Avg Profit: " + ((player.bank - 100) / casino.round).toFixed(2));
		$("#max-safe-bets").html("Safe Bets: " + getMaxSafeBets());
		$("#max-safe-bets-odds").html("Safe Bets Odds: " + getMaxSafeBetsOdds() + "%");
	};

	//Get Player Info
	this.setPlayerInfo = function() {

		$("#bet").html("Bet Amount: " + player.bet.toFixed(2) + " (Payout: " +  (player.bet + (player.bet * casino.payoutRate)).toFixed(2) + ")");
		$("#investment").html("Investment: " + player.investment.toFixed(2));
		$("#highestBet").html("Highest Bet: " + player.highestBet.toFixed(2));
	};

	//Update buttons
	this.setButtonInfo = function() {
		
		$("#rollRate").html("Roll " + casino.rollRate + "x");
	};

	//Update the DOM Info
	this.update = function() {

		$("#day").html("Round: " + casino.round);

		//Get Casino Info
		this.setCasinoInfo();

		//Get Gambling Info
		this.setGambleInfo();

		//Get Player Info
		this.setPlayerInfo();
	};

	//Reset page to default values
	this.resetAll = function() {

		//Reset to defaults
		player.reset();
		casino.reset();

		//Update the DOM Info
		this.update();
	};
}