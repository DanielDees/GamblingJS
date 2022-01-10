var casino = new Vue({
			el: '#wrapper',
			data: {
				//Game Settings
				history: 80,
				roll_rate: 10,

				// Casino
				payout_rate: 2,
				win_odds: 31.58,
				min_bet: 1,

				// Player
				wins: 0,
				total_rolls: 0,
				start_bank: 40,
				max_bank: 40,
				bank: 0,
				//safe_bet_limit: 1,
				take_home: 0,
				bet_multi: 3,
				current_bet: 0,
				highest_bet: 0,
				highest_payout: 0,
				investment: 0
			},
			computed: {
				safeBetCount() {
					if (this.bet_multi <= 1) {
						return;
					}

					var max = 0;
					//@todo Edit to calculate without while loop
					while(this.current_bet * Math.pow(this.bet_multi, max + 1) < this.bank) { max++; }
					return max;
				},
				safeBetOdds() {
					if (this.bet_multi <= 1) {
						return;
					}

					var max = 0;
					while(this.current_bet * Math.pow(this.bet_multi, max + 1) < this.bank) { max++; }

					var odds = Math.pow(1 - (this.win_odds / 100), max) * 100;

					return "~1/" + (100 / odds).toFixed(0) + " (" + odds.toFixed(4) + "%)";
				},
				bet_profitability_ratio() {
					//So we want to start at 1 as our base bet, then pretend we lose and mutliply by bet multi. repeat the process in our betting moethod. Calculate profit % after total investment.
					var investment = this.min_bet;
					var max_winnings = this.min_bet * (this.payout_rate + 1);

					//@todo move this to be a param of payout() so payout can be called with <i> rounds to similuate winnings
					for (var i = 1; i < 10; i++) {
						//Increase theoretical investment by amount that would be bet after <i> lost bets
						investment += Math.pow(this.bet_multi, i);

						//Calculate theoretical winnings after losing <i> bets based on betting strategy
						max_winnings = Math.pow(this.bet_multi, i + 1) * (this.payout_rate + 1);
					}

					var profit_ratio = max_winnings / investment;

					return profit_ratio;
				},
				payout() {
					return this.current_bet + (this.current_bet * this.payout_rate);
				},
				avgProfit() {
					return ((this.bank + this.take_home - this.start_bank) / this.wins).toFixed(2);
				},
				autoRollRate() {
					return this.roll_rate > 0 ? 1000 / this.roll_rate : 2147483647 /* int32 max */;
				},
				winRate() {
					return (this.wins / this.total_rolls) * 100;
				}
			},
			methods: {
				bet() {
					this.current_bet = Math.max(this.min_bet, this.current_bet * this.bet_multi);
					this.current_bet = Math.min(this.current_bet, this.bank);

					this.bank -= this.current_bet;
					this.investment += this.current_bet;
					this.highest_bet = Math.max(this.current_bet, this.highest_bet);
				},
				win() {
					chart.data.labels.push("Win Bet: " + this.current_bet.toFixed(0));

					this.bank += this.payout;
					this.highest_payout = Math.max(this.payout, this.highest_payout);

					var overflow = Math.max(this.bank - this.max_bank, 0);

					this.take_home += overflow;
					this.bank -= overflow;

					this.current_bet = this.min_bet;
					this.investment = 0;
					this.wins++;

					chart.data.datasets[0].pointBorderColor.push("#4B5");
					chart.data.datasets[0].pointBackgroundColor.push("#4B5");
				},
				lose() {
					chart.data.labels.push("Loss Bet: " + this.current_bet.toFixed(0));

					if (this.bank < this.min_bet) {
						var refill = this.start_bank - this.bank;
						this.bank += refill;
						this.take_home -= refill;
						this.current_bet = this.min_bet;
					}

					chart.data.datasets[0].pointBorderColor.push("#B22");
					chart.data.datasets[0].pointBackgroundColor.push("#B22");
				},
				roll() {
					this.total_rolls++;

					if (Math.random() * 100 >= this.win_odds) {
						this.lose();
						return;
					}

					this.win();
				},
				playRound() {
					this.bet();
					this.roll();
					this.updateChart();
				},
				updateChart() {
					chart.data.datasets[0].data.push(this.bank.toFixed(2));
					chart.data.datasets[1].data.push(this.take_home);
					chart.data.datasets[2].data.push((this.bank + this.take_home).toFixed(2));

					while (chart.data.datasets[0].data.length > this.history) {
						chart.data.datasets[0].data.shift();
						chart.data.datasets[1].data.shift();
						chart.data.datasets[2].data.shift();
						chart.data.datasets[0].pointBorderColor.shift();
						chart.data.datasets[0].pointBackgroundColor.shift();
						chart.data.labels.shift();
					}

					chart.update({ duration: Math.min(this.autoRollRate * 2, 4000) });
				},
				reset(manual) {

					if ((this.bank >= this.min_bet || this.take_home > 0) && !manual) {
						return false;
					}

					chart.data.labels = [];
					chart.data.datasets[0].data = [];
					chart.data.datasets[1].data = [];
					chart.data.datasets[2].data = [];
					chart.data.datasets[0].pointBorderColor = [];
					chart.data.datasets[0].pointBackgroundColor = [];

					this.current_bet = this.min_bet;
					this.take_home = 0;
					this.bank = this.start_bank;
					this.highest_bet = 0;
					this.investment = 0;
					this.wins = 0;
					this.total_rolls = 0;
					return true;
				},
				manualReset() {
					this.reset(true);
				}
			}
		});