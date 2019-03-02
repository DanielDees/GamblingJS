var gameDisplay = new Casino_DOM_Updater;

function Casino_DOM_Updater() {

	//Get Gambling Info
	this.setGambleInfo = () => {
		$("#bank").html("Bank: " + player.bank.toFixed(2));
		$("#multiplier").html("Bet Multi: " + player.betMulti + "x");
		$("#avg-return").html("Avg Profit: " + ((player.bank - 100) / casino.round).toFixed(2));
		$("#max-safe-bets").html("Safe Bets: " + player.getSafeBets());
		$("#max-safe-bets-odds").html("Safe Bets Odds: " + player.getSafeBetOdds() + "%");
	};

	//Get Player Info
	this.setPlayerInfo = () => {
		$("#bet").html("Bet Amount: " + player.bet.toFixed(2) + " (Payout: " +  (player.bet + (player.bet * casino.payoutRate)).toFixed(2) + ")");
		$("#investment").html("Investment: " + player.investment.toFixed(2));
		$("#highestBet").html("Highest Bet: " + player.highestBet.toFixed(2));
	};

	this.updateGraph = () => {
		new Chart(
			document.querySelector("#graph").getContext('2d'), 
			{
				type: 'line',
				data: {
					labels: player.bankHistory,

					datasets: [{
						label: "Player Bank",
						data: player.bankHistory
					}]
				},
				options: {
					title: {
					}
				}
			}
		);
	}

	// We need to convert this to vue.js databinding
	this.update = () => {

		$("#round").html("Round: " + casino.round);

		this.setGambleInfo();

		this.setPlayerInfo();

		this.updateGraph();
	};

	this.resetAll = () => {

		player.reset();
		casino.reset();

		//Update the DOM Info
		this.update();
	};
}