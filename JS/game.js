var casino = new Vue({
			el: '#wrapper',
			data: {
				//Game Settings
				history: 80,

				//Autoroller
				default_roll_rate: 200,
				roll_rate: 200,
				min_bank_percent: 0,
				roll_only_safe: true,
				restart_on_complete: true,

				//SaveData
				savedRolls: [],
				savedNetProfit: [],

				//For Plotly 3D model
				plot_z_data: [
					[]
				],
				
				plotStartBankGranularity: 10,
				plotStartBankDataSetSize: 15,

				plotBetMultiGranularity: 0.05,
				plotBetMultiDataSetSize: 20,
				
				plotPointDataSetSize: 20,

				// Casino
				payout_rate: 1,
				win_odds: 48.6,
				//win_odds: 31.58,
				min_bet: 1,

				// Player
				wins: 0,
				total_rolls: 0,
				start_bank: 10,
				max_bank: 10,
				bank: 10,
				//safe_bet_limit: 1,
				take_home: 0,
				bet_multi: 2,
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
					var investment = this.min_bet;
					var max_winnings = this.min_bet * (this.payout_rate + 1);

					//@todo move this to be a param of payout() so payout can be called with <i> rounds to similuate winnings
					for (var i = 1; i < 10; i++) {
						//Increase theoretical investment by amount that would be bet after <i> lost bets
						investment += Math.pow(this.bet_multi, i);

						//Calculate theoretical winnings after losing <i> bets based on betting strategy
						max_winnings = Math.pow(this.bet_multi, i) * (this.payout_rate + 1);
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
					return this.roll_rate > 0 ? 1000 / this.roll_rate : 500;
				},
				winRate() {
					return (this.wins / this.total_rolls) * 100;
				},
				savedAverageRolls() {
					var total = 0;

					for (var i = 0; i < this.savedRolls.length; i++) {
						total += this.savedRolls[i];
					}

					return total / this.savedRolls.length;
				},
				savedAverageNetProfit() {
					var total = 0;

					for (var i = 0; i < this.savedNetProfit.length; i++) {
						total += this.savedNetProfit[i];
					}

					return total / this.savedNetProfit.length;
				},
				savedDatasetSize() {
					return this.savedRolls.length;
				},
				savedDataPositiveRate() {
					var wins = 0;

					for (var i = this.savedNetProfit.length - 1; i >= 0; i--) {
						if (this.savedNetProfit[i] >= 0) {
							wins++;
						}
					}

					return wins / this.savedNetProfit.length;
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

					if (this.bank < 0) {
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

					var endRound = false;
					//Safe Bets
					if (this.roll_only_safe && this.safeBetCount < 1) {
						endRound = true;
					}
					
					//Min Bank Percent
					//else if (this.bank / this.max_bank < (this.min_bank_percent / 100)) {
					//	this.roll_rate = 0;
					//}

					if (!endRound) {
						this.bet();
						this.roll();
						this.updateChart();
					}

					if (endRound) {
						this.roll_rate = this.default_roll_rate;
						this.savedRolls.push(this.total_rolls);
						this.savedNetProfit.push(this.take_home + this.bank - this.start_bank);
						this.savedBetMulti = this.bet_multi;
						this.savedMinBet = this.min_bet;
						this.savedWinOdds = this.win_odds;
						this.savedPayoutRate = this.payout_rate;
						this.savedStartMaxBank = this.start_bank;
					}

					if (endRound && this.restart_on_complete) {
						this.softReset();
					}

					//Automation for 3D model
					if (this.savedDatasetSize >= this.plotPointDataSetSize) {
						this.saveDataPoint();
						this.hardReset();
					}
				},
				saveDataPoint() {
					//Update to check against how granular we want the data to be when automated
					//Plot data points to chart once granularity threshold is met
					//z-axis: Average net profit (vertical component)

					//x-axis: bet_multi
					//y-axis: start_bank & max_bank
					var y = this.plot_z_data.length - 1;

					//Save Z-Axis data at current X/Y Coordinate
					this.plot_z_data[y].push(this.savedAverageNetProfit);

					//Update for next Y Coordinate
					this.start_bank += this.plotStartBankGranularity;
					this.max_bank += this.plotStartBankGranularity;

					//Go to next X-Axis Coordinate
					if (this.plot_z_data[y].length >= this.plotStartBankDataSetSize) {
						
						//Creates new X-Axis row to hold data along the Y-Axis.
						this.plot_z_data.push([]);

						//Update for next X Coordinate
						this.bet_multi += this.plotBetMultiGranularity;

						//Reset Y-Axis Coordinate
						this.start_bank = this.plotStartBankGranularity;
						this.max_bank = this.plotStartBankGranularity;
					}

					//Update Plot
					this.plotDataPoints();
				},
				plotDataPoints() {
					//For export/import tool
					//https://stackoverflow.com/questions/14964035/how-to-export-javascript-array-info-to-csv-on-client-side

					var title = "X: " + this.plot_z_data.length + " | Y: " + this.plot_z_data[this.plot_z_data.length - 1].length;

					var layout = {
					  title: title,
					  autosize: false,
					  width: 800,
					  height: 800,
					  margin: {
					    l: 90,
					    r: 90,
					    b: 90,
					    t: 90,
					  }
					};
					Plotly.newPlot(
						'heatmap', 
						[{
				           z: this.plot_z_data,
				           type: 'surface'
				        }], 
					    layout
					);
				},
				clearPlotData() {
					this.savedRolls = [];
					this.savedNetProfit = [];
					this.plotDataPoints();
				},
				importCSV() {
					//TBD
				},
				updateChart() {
					chart.data.datasets[0].data.push(this.bank.toFixed(2));
					chart.data.datasets[1].data.push(this.take_home);
					chart.data.datasets[2].data.push((this.bank + this.take_home - this.start_bank).toFixed(2));

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
				clearChart() {
					chart.data.labels = [];
					chart.data.datasets[0].data = [];
					chart.data.datasets[1].data = [];
					chart.data.datasets[2].data = [];
					chart.data.datasets[0].pointBorderColor = [];
					chart.data.datasets[0].pointBackgroundColor = [];
				},
				softReset() {
					this.clearChart();

					this.current_bet = this.min_bet;
					this.take_home = 0;
					this.bank = this.start_bank
					this.wins = 0;
					this.total_rolls = 0;
					this.highest_bet = 0;
					this.investment = 0;

					//Retain Plot data...
				},
				hardReset() {
					this.clearChart();

					this.current_bet = this.min_bet;
					this.take_home = 0;
					this.bank = this.start_bank;
					this.wins = 0;
					this.total_rolls = 0;
					this.highest_bet = 0;
					this.investment = 0;
					//Clear Plot data as well...
					this.clearPlotData();
				},
				//In case we want special logic for users resetting.
				//There used to be a difference that I've forgotten the purpose of so I removed it.
				manualReset() {
					this.hardReset();
				}
			}
		});