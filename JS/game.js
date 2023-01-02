var casino = new Vue({
			el: '#wrapper',
			data: {
				//Game Settings
				history: 80,
				chart_enabled: false,
				plot_enabled: false,

				//Autoroller
				default_roll_rate: 200,
				roll_rate: 200,
				min_bank_percent: 0,
				roll_only_safe: true,

				//SaveData
				savedRolls: [],
				savedNetProfit: [],

				//For Plotly 3D model
				plot_z_data: [
					[]
				],
				
				plotStartBankGranularity: 5,
				plotStartBankDataSetSize: 100,

				plotBetMultiGranularity: 0.01,
				//plotBetMultiDataSetSize: 20,
				
				plotPointDataSetSize: 5000,

				// Casino
				payout_rate: 1,
				win_odds: 48.6,
				//win_odds: 31.58,
				min_bet: 1,
				// TODO implement after splitting up the code properly into multiple vue classes
				//max_bet: 25000

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
					var max = 0;
					//@todo Edit to calculate without while loop
					while(this.current_bet * Math.pow(this.bet_multi, max + 1) < this.bank) { max++; }
					return max;
				},
				safeBetOdds() {
					var odds = Math.pow(1 - (this.win_odds / 100), this.safeBetCount) * 100;

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
					return this.savedRolls.reduce((sum, n) => sum + n, 0) / this.savedRolls.length;
				},
				savedAverageNetProfit() {
					return this.savedNetProfit.reduce((sum, n) => sum + n, 0) / this.savedNetProfit.length;
				},
				savedAverageNetProfitPercent() {
					return (this.savedAverageNetProfit / this.start_bank) * 100;
				},
				savedDatasetSize() {
					return this.savedRolls.length;
				},
				savedDataPositiveRate() {
					return this.savedNetProfit.filter(profit => profit >= 0).length / this.savedNetProfit.length;
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
					if (this.chart_enabled) {
						chart.data.labels.push("Win Bet: " + this.current_bet.toFixed(0));
						chart.data.datasets[0].pointBorderColor.push("#4B5");
						chart.data.datasets[0].pointBackgroundColor.push("#4B5");
					}

					this.bank += this.payout;
					this.highest_payout = Math.max(this.payout, this.highest_payout);

					var overflow = Math.max(this.bank - this.max_bank, 0);

					this.take_home += overflow;
					this.bank -= overflow;

					this.current_bet = this.min_bet;
					this.investment = 0;
					this.wins++;
				},
				lose() {
					if (this.chart_enabled) {
						chart.data.labels.push("Lose Bet: " + this.current_bet.toFixed(0));
						chart.data.datasets[0].pointBorderColor.push("#B22");
						chart.data.datasets[0].pointBackgroundColor.push("#B22");
					}					

					if (this.bank < 0) {
						var refill = this.start_bank - this.bank;
						this.bank += refill;
						this.take_home -= refill;
						this.current_bet = this.min_bet;
					}
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

					if (!endRound) {
						this.bet();
						this.roll();

						if (this.chart_enabled) {
							this.updateChart();
						}
					}

					if (endRound) {
						this.savedRolls.push(this.total_rolls);
						this.savedNetProfit.push(this.take_home + this.bank - this.start_bank);
						this.softReset();
					}

					//Automation for 3D model
					//Continue running simulation until our long term return rate is negative by more than the designated % value 
					//This ensures we do not log a positive return rate on losing betting strategies
					if (this.savedDatasetSize >= this.plotPointDataSetSize && this.savedAverageNetProfitPercent < -2) {
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

					//Save Z-Axis data at current X/Y Coordinate (Will be saved as a percent of the starting bank.
					this.plot_z_data[y].push(this.savedAverageNetProfitPercent);

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
					if (this.plot_enabled) {
						this.updatePlot();
					}
				},
				updatePlot() {
					//For export/import tool
					//https://stackoverflow.com/questions/14964035/how-to-export-javascript-array-info-to-csv-on-client-side

					var title = "Bet Multi: " + this.plot_z_data.length + " | Start Bank: " + this.plot_z_data[this.plot_z_data.length - 1].length + " | Z-Set: " + this.plotPointDataSetSize;

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
					this.updatePlot();
				},
				exportCSV() {
					// Create a CSV file in the same directory as our index.html file
					// CSV headers will include our betting strategy and the number of rounds played
					// CSV data rows will include the number of rolls and the net profit for each round
					var csv = 'Bet Multiplier,Start Bank,End Bank,Net Profit,Payout,Min Bet,Win%\n';
					csv += this.bet_multi + ',' + this.start_bank + ',' + this.max_bank + ',' + this.take_home + ',' + this.payout + ',' + this.min_bet + ',' + this.win_odds + '\n';
				},
				importCSV() {
					
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
				showChart() {
					//if the chart is hidden, then show it
					if($('#chart').is(':hidden')) {
						$('#chart').show();
					}
				},
				hideChart() {
					//if the chart is showing, then hide it
					if($('#chart').is(':visible')) {
						$('#chart').hide();
					}
				},
				showPlot() {
					//if the plot is hidden, then show it
					if($('#heatmap').is(':hidden')) {
						$('#heatmap').show();
					}
				},
				hidePlot() {
					//if the plot is showing, then hide it
					if($('#heatmap').is(':visible')) {
						$('#heatmap').hide();
					}
				},
				softReset() {
					if (this.chart_enabled) {
						this.showChart();
						this.clearChart();
					}
					if (!this.chart_enabled) {
						this.clearChart();
						this.hideChart();
					}

					if (this.plot_enabled) {
						this.showPlot();
					}
					if (!this.plot_enabled) {
						this.hidePlot();
					}

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
					this.softReset();
					this.clearPlotData();
				},
			}
		});