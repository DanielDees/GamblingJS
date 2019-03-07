var casino = new Vue({
			el: '#wrapper',
			data: {
				// Casino
				round: 1,
				payout: 2,
				winOdds: 0.3,
				minBet: 1,

				// Player
				bankHistory: [],
				bank: 100,
				maxBank: 100,
				safeBetLimit: 1,
				takeHome: 0,
				currentBet: 1,
				betMulti: 1.5,
				highestBet: 1,
				investment: 0,
				rollRate: 1
			},
			computed: {
				bet() {
					this.currentBet = Math.max(this.minBet, this.currentBet);
					return this.currentBet;
				},
				safeBetCount() {
					var max = 0;
					while(this.bet * Math.pow(this.betMulti, max + 1) < this.bank) { max++; }
					return max;
				},
				safeBetOdds() {
					var max = 0;
					while(this.bet * Math.pow(this.betMulti, max + 1) < this.bank) { max++; }

					var odds = (Math.pow(1 - this.winOdds, max) * 100);

					return "~1/" + (100 / odds).toFixed(0) + " (" + odds.toFixed(6) + "%)";
				},
				winPayout() {
					return "(Payout: " + (this.bet * this.payout).toFixed(2) + ")";
				},
				avgProfit() {
					return ((this.bank - 100) / this.round).toFixed(2);
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
					this.investment += this.bet;
					this.highestBet = Math.max(this.bet, this.highestBet).toFixed(2);
					
					if (this.bank <= 0) {

						var replenishAmount = (this.maxBank - this.bank);

						if (replenishAmount > this.takeHome) {
							replenishAmount = this.takeHome;
						}

						this.bank += replenishAmount;
						this.takeHome -= replenishAmount;
						this.currentBet = this.minBet;
					}
				},
				roll() {
					return Math.random();
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
				gameLoop() {
					for (var i = 0; i < this.rollRate; i++) { this.game(); }

					chart.update();
				},
				updateChart() {
					chart.data.labels.push("Round " + this.round);
					chart.data.datasets[0].data.push(this.bank);
					chart.data.datasets[1].data.push(this.takeHome);
				}
			}
		});