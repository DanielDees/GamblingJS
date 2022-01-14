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
				plotBetMulti: [],
				plotStartBank: [],
				plotAverageNetProfit: [],

				// Casino
				payout_rate: 1,
				win_odds: 48.6,
				//win_odds: 31.58,
				min_bet: 1,

				// Player
				wins: 0,
				total_rolls: 0,
				start_bank: 50,
				max_bank: 50,
				bank: 50,
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

					//Min Bank Percent
					if (this.bank / this.max_bank < (this.min_bank_percent / 100)) {
						this.roll_rate = 0;
					}

					//Safe Bets
					else if (this.roll_only_safe && this.safeBetCount < 1) {
						this.roll_rate = 0;
					}

					else {

						//Revert Roll Rate if criteria stopping rolls are no longer being met.
						if (this.roll_rate < 1) {
							this.roll_rate = this.default_roll_rate;
						}

						this.bet();
						this.roll();
						this.updateChart();
					}

					if (this.roll_rate < 1) {
						this.savedRolls.push(this.total_rolls);

						
						this.savedNetProfit.push(this.take_home + this.bank - this.start_bank);
						this.savedBetMulti = this.bet_multi;
						this.savedMinBet = this.min_bet;
						this.savedWinOdds = this.win_odds;
						this.savedPayoutRate = this.payout_rate;
						this.savedStartMaxBank = this.start_bank;
					}

					if (this.roll_rate < 1 && this.restart_on_complete) {
						this.softReset();
					}

					//Automation for 3D model
					if (this.savedDatasetSize >= 100) {
						this.saveDataPoint();
						this.hardReset();
					}
				},
				saveDataPoint() {
					//Update to check against how granular we want the data to be when automated
					//Plot data points to chart once granularity threshold is met
					//z-axis: Average net profit (vertical component)

					//x-axis: bet_multi
					var xStep = 0.05;
					//y-axis: start_bank & max_bank
					var y = this.plot_z_data.length - 1;
					var yStep = 50;
					var yGranularity = 10;

					//Save Z-Axis data at current X/Y Coordinate
					this.plot_z_data[y].push(this.savedAverageNetProfit);

					//Update for next Y Coordinate
					this.start_bank += yStep;
					this.max_bank += yStep;

					//Go to next X-Axis Coordinate after 5 Y-Axis Coordinates
					if (this.plot_z_data[y].length >= yGranularity) {
						
						//Create new X-Axis Coordinate, Recreate Plot Render
						this.plotDataPoints();

						//Update for next X Coordinate
						this.bet_multi += xStep;

						//Reset Y-Axis Coordinate
						this.start_bank = 100;
						this.max_bank = 100;
					}
				},
				plotDataPoints() {
					//For export/import tool
					//https://stackoverflow.com/questions/14964035/how-to-export-javascript-array-info-to-csv-on-client-side

					//Creates new X-Axis row to hold data along the Y-Axis.
					this.plot_z_data.push([]);
					//console.log(this.plot_z_data);

					var layout = {
					  title: 'Test Plot',
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
				softReset() {
					chart.data.labels = [];
					chart.data.datasets[0].data = [];
					chart.data.datasets[1].data = [];
					chart.data.datasets[2].data = [];
					chart.data.datasets[0].pointBorderColor = [];
					chart.data.datasets[0].pointBackgroundColor = [];

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
					
					//Clear Plot data as well...
					this.savedRolls = [];
					this.savedNetProfit = [];
				},
				//In case we want special logic for users resetting.
				//There used to be a difference that I've forgotten the purpose of so I removed it.
				manualReset() {
					this.hardReset();
				}
			}
		});