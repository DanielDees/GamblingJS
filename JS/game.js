var casino = new Vue({
			el: '#wrapper',
			data: {
				// Casino
				wins: 0,
				totalRolls: 0,
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
					var min = Math.max(this.minBet, this.currentBet);
					var max = Math.min(min, this.bank);

					this.currentBet = max;
					this.investment += max;
					this.highestBet = Math.max(max, this.highestBet);

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
					return ((this.bank + this.takeHome - this.startingBank) / this.wins).toFixed(2);
				},
				autoRollRate() {
					//Set delay to 32 bit int max if rate is 0. (~24.8 days)
					return this.rollRate > 0 ? 1000 / this.rollRate : 2147483647;
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

					this.currentBet = 0;
					this.investment = 0;
					this.wins++;
				},
				lose() {
					this.bank -= this.bet;

					if (this.reset()) {
						return;
					}

					if (this.bank <= 0) {
						var replenish = Math.min(this.maxBank, this.takeHome);

						this.bank = replenish;
						this.takeHome -= replenish;
						this.currentBet = 0;
					}

					this.currentBet *= this.betMulti;
				},
				roll() {
					return Math.random() * 100;
				},
				game() {
					this.totalRolls++;
					
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
					chart.data.labels.push("Win " + this.wins);
					chart.data.datasets[0].data.push(this.bank.toFixed(2));
					chart.data.datasets[1].data.push(this.takeHome);

					if (chart.data.datasets[0].data.length > this.maxHistoryLength) {
						chart.data.datasets[0].data.shift();
						chart.data.datasets[1].data.shift();
						chart.data.labels.shift();
					}
				},
				reset(manual) {

					if ((this.bank > 0 || this.takeHome > 0) && !manual) {
						return false;
					}

					chart.data.labels = [];
					chart.data.datasets[0].data = [];
					chart.data.datasets[1].data = [];

					this.currentBet = 0;
					this.takeHome = 0;
					this.bank = this.startingBank;
					this.highestBet = 0;
					this.investment = 0;
					this.wins = 0;
					return true;
				},
				manualReset() {
					this.reset(true);
				}
			}
		});