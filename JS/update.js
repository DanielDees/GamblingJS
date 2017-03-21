var gameDisplay = new Casino_DOM_Updater;

function Casino_DOM_Updater() {

	//Get the Casino Info
	this.setCasinoInfo = function() {
		
		document.getElementById("odds").innerHTML = "Odds: " + casino.odds + "%";
		document.getElementById("min-bet").innerHTML = "Min Bet: " + casino.minBet;
		document.getElementById("payout-rate").innerHTML = "Payout Rate: " + casino.payoutRate + "x";
	};

	//Get Gambling Info
	this.setGambleInfo = function() {
		
		document.getElementById("bank").innerHTML = "Bank: " + player.bank.toFixed(2);
		document.getElementById("multiplier").innerHTML = "Bet Multi: " + player.betMulti + "x";
		document.getElementById("max-safe-bets").innerHTML = "Max Safe Bets: " + getMaxSafeBets();
		document.getElementById("max-safe-bets-odds").innerHTML = "Max Safe Bets Odds: " + getMaxSafeBetsOdds() + "%";
	};

	//Get Player Info
	this.setPlayerInfo = function() {

		document.getElementById("bet").innerHTML = "Bet: " + player.bet.toFixed(2) + " (Payout: " +  (player.bet + (player.bet * casino.payoutRate)).toFixed(2) + ")";
		document.getElementById("investment").innerHTML = "Round Investment: " + player.investment.toFixed(2);
		document.getElementById("highestBet").innerHTML = "Highest Bet: " + player.highestBet.toFixed(2);
	};

	//Update the DOM Info
	this.update = function() {

		document.getElementById("day").innerHTML = "Round: " + casino.round;

		//Get Casino Info
		this.setCasinoInfo();

		//Get Gambling Info
		this.setGambleInfo();

		//Get Player Info
		this.setPlayerInfo();
	};
}