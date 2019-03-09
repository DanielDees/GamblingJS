var casino = new Vue({
			el: '#wrapper',
			data: {
				// Casino
				round: 1,
				payout: 2,
				winOdds: 31.58,
				minBet: 1,

				// Player
				maxHistoryLength: 200,
				startingBank: 500,
				bank: 500,
				maxBank: 1000,
				safeBetLimit: 1,
				takeHome: 0,
				currentBet: 0,
				betMulti: 1.6,
				highestBet: 0,
				investment: 0,
				rollRate: 20
			},
			computed: {
				bet() {
					this.currentBet = Math.max(this.minBet, this.currentBet);
					return this.currentBet;
				},
				//Modify to calculate directly without using while loop to prevent infinite loops on <1.0 multi
				safeBetCount() {
					if (this.betMulti <= 1) {
						return;
					}

					var max = 0;
					while(this.bet * Math.pow(this.betMulti, max + 1) < this.bank) { max++; }
					return max;
				},
				safeBetOdds() {
					if (this.betMulti <= 1) {
						return;
					}

					var max = 0;
					while(this.bet * Math.pow(this.betMulti, max + 1) < this.bank) { max++; }

					var odds = (Math.pow(1 - (this.winOdds / 100), max) * 100);

					return "~1/" + (100 / odds).toFixed(0) + " (" + odds.toFixed(6) + "%)";
				},
				winPayout() {
					return "(Payout: " + (this.bet * this.payout).toFixed(2) + ")";
				},
				avgProfit() {
					return ((this.bank + this.takeHome) / this.round).toFixed(2);
				},
				autoRollRate() {
					//Set delay to 32 bit int max if rate is 0. (~24.8 days)
					return this.rollRate > 0 ? 2000 / this.rollRate : 2147483647;
				}
			},
			methods: {
				win() {
					this.bank += this.bet * this.payout;

					var overflow = (this.bank - this.maxBank);

					if (overflow > 0) {
						this.takeHome += overflow;
						this.bank -= overflow;
					}

					this.currentBet = this.minBet;
					this.investment = 0;
					this.round++;
				},
				lose() {
					this.bank -= this.bet;
					this.currentBet *= this.betMulti;

					//Prevent going into debt
					if (this.currentBet > this.bank) {
						this.currentBet = this.bank;
					}

					this.investment += this.bet;
					this.highestBet = Math.max(this.bet, this.highestBet).toFixed(2);
					
					if (this.bank <= 0 && this.takeHome > 0 || this.currentBet == 0) {

						if (this.currentBet > this.takeHome) {
							this.currentBet = this.takeHome;
						}

						this.bank += this.currentBet;
						this.takeHome -= this.currentBet;
						this.currentBet = this.minBet;
						return;
					}

					if (this.bank <= 0 && this.takeHome <= 0) {
						this.resetAll();
						return;
					}
				},
				roll() {
					return Math.random() * 100;
				},
				game() {
					if (this.roll() >= this.winOdds) {
						this.lose();
						this.updateChart();
						return;			
					}

					this.win();
					this.updateChart();
				},
				autoRoll() {
					this.game();

					chart.update({ duration: this.autoRollRate * 4 });
				},
				updateChart() {
					chart.data.labels.push("Round " + this.round);
					chart.data.datasets[0].data.push(this.bank);
					chart.data.datasets[1].data.push(this.takeHome);

					if (chart.data.datasets[0].data.length > this.maxHistoryLength) {
						chart.data.datasets[0].data.shift();
						chart.data.datasets[1].data.shift();
						chart.data.labels.shift();
					}
				},
				resetAll() {
					chart.data.labels = [];
					chart.data.datasets[0].data = [];
					chart.data.datasets[1].data = [];

					this.currentBet = this.minBet;
					this.takeHome = 0;
					this.bank = this.startingBank;
					this.highestBet = 0;
					this.investment = 0;
					this.round = 0;
				}
			}
		});