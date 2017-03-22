var gameDisplay = new Casino_DOM_Updater;

function Casino_DOM_Updater() {

	//Get the Casino Info
	this.setCasinoInfo = function() {
		
		$("#odds").html("Odds: " + casino.odds + "%");
		$("#min-bet").html("Min Bet: " + casino.minBet);
		$("#payout-rate").html("Payout Rate: " + casino.payoutRate + "x");
	};

	//Get Gambling Info
	this.setGambleInfo = function() {
		
		$("#bank").html("Bank: " + player.bank.toFixed(2));
		$("#multiplier").html("Bet Multi: " + player.betMulti + "x");
		$("#max-safe-bets").html("Max Safe Bets: " + getMaxSafeBets());
		$("#max-safe-bets-odds").html("Max Safe Bets Odds: " + getMaxSafeBetsOdds() + "%");
	};

	//Get Player Info
	this.setPlayerInfo = function() {

		$("#bet").html("Bet: " + player.bet.toFixed(2) + " (Payout: " +  (player.bet + (player.bet * casino.payoutRate)).toFixed(2) + ")");
		$("#investment").html("Round Investment: " + player.investment.toFixed(2));
		$("#highestBet").html("Highest Bet: " + player.highestBet.toFixed(2));
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
}