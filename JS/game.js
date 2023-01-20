var casino = new Vue({
			el: '#wrapper',
			data: {
				//Game Settings
				history: 80,
				chart_enabled: false,
				plot_enabled: false,

				//Autoroller
				default_roll_rate: 200,
				total_rolls: 0,
				wins: 0,
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
				
				plotStartBankDataSetSize: 150,
				//plotBetMultiDataSetSize: 20,
				
				plotPointDataSetSize: 5000,

				// Casino
				casino_payout_rate: 1,
				casino_win_odds: 48.6,
				//win_odds: 31.58,
				casino_min_bet: 1,
				// TODO implement after splitting up the code properly into multiple vue classes
				casino_max_bet: 25000,

				// Player
				player_start_bank: 10,
				player_max_bank: 10,
				player_start_bank_increment: 5,
				player_bet_multi_increment: 0.01,

				player_bank: 10,
				//safe_bet_limit: 1,
				player_take_home: 0,
				player_bet_multi: 2.70,
				player_current_bet: 0,
				player_highest_bet: 0,
				player_highest_payout: 0,
				player_investment: 0
			},
			computed: {
				safeBetCount() {
					var max = 0;
					//@todo Edit to calculate without while loop
					while(this.player_current_bet * Math.pow(this.player_bet_multi, max + 1) < this.player_bank) { max++; }
					return max;
				},
				safeBetOdds() {
					var odds = Math.pow(1 - (this.casino_win_odds / 100), this.safeBetCount) * 100;

					return "~1/" + (100 / odds).toFixed(0) + " (" + odds.toFixed(4) + "%)";
				},
				bet_profitability_ratio() {
					var investment = this.casino_min_bet;
					var max_winnings = this.casino_min_bet * (this.casino_payout_rate + 1);

					//@TODO move this to be a param of payout() so payout can be called with <i> rounds to similuate winnings
					for (var i = 1; i < 10; i++) {
						//Increase theoretical investment by amount that would be bet after <i> lost bets
						investment += Math.pow(this.player_bet_multi, i);

						//Calculate theoretical winnings after losing <i> bets based on betting strategy
						max_winnings = Math.pow(this.player_bet_multi, i) * (this.casino_payout_rate + 1);
					}

					var profit_ratio = max_winnings / investment;

					return profit_ratio;
				},
				payout() {
					return this.player_current_bet + (this.player_current_bet * this.casino_payout_rate);
				},
				avgProfit() {
					return ((this.player_bank + this.player_take_home - this.player_start_bank) / this.wins).toFixed(2);
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
					return (this.savedAverageNetProfit / this.player_start_bank) * 100;
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
					this.player_current_bet = Math.max(this.casino_min_bet, this.player_current_bet * this.player_bet_multi);
					this.player_current_bet = Math.min(this.player_current_bet, this.player_bank);

					this.player_bank -= this.player_current_bet;
					this.player_investment += this.player_current_bet;
					this.player_highest_bet = Math.max(this.player_current_bet, this.player_highest_bet);
				},
				win() {
					if (this.chart_enabled) {
						chart.data.labels.push("Win Bet: " + this.player_current_bet.toFixed(0));
						chart.data.datasets[0].pointBorderColor.push("#4B5");
						chart.data.datasets[0].pointBackgroundColor.push("#4B5");
					}

					this.player_bank += this.payout;
					this.player_highest_payout = Math.max(this.payout, this.player_highest_payout);

					var overflow = Math.max(this.player_bank - this.player_max_bank, 0);

					this.player_take_home += overflow;
					this.player_bank -= overflow;

					this.player_current_bet = this.casino_min_bet;
					this.player_investment = 0;
					this.wins++;
				},
				lose() {
					if (this.chart_enabled) {
						chart.data.labels.push("Lose Bet: " + this.player_current_bet.toFixed(0));
						chart.data.datasets[0].pointBorderColor.push("#B22");
						chart.data.datasets[0].pointBackgroundColor.push("#B22");
					}					

					if (this.bank < 0) {
						var refill = this.player_start_bank - this.player_bank;
						this.player_bank += refill;
						this.player_take_home -= refill;
						this.player_current_bet = this.casino_min_bet;
					}
				},
				roll() {
					this.total_rolls++;

					if (Math.random() * 100 >= this.casino_win_odds) {
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
						this.savedNetProfit.push(this.player_take_home + this.player_bank - this.player_start_bank);
						this.softReset();
					}

					//Automation for 3D model
					//Continue running simulation until our long term return rate is negative by more than the designated % value 
					//This ensures we do not log a positive return rate on losing betting strategies
					//A cap is set at 100,000 in the case that a betting strategy that beats the buffer is found so we don't get softlocked
					if ((this.savedDatasetSize >= this.plotPointDataSetSize && this.savedAverageNetProfitPercent < -2) || this.savedDatasetSize > 50000) {
						this.saveDataPoint();
						this.hardReset();
					}
				},
				saveDataPoint() {
					//Update to check against how granular we want the data to be when automated
					//Plot data points to chart once increment threshold is met
					//z-axis: Average net profit (vertical component)

					//x-axis: player_bet_multi
					//y-axis: player_start_bank & player_max_bank
					var y = this.plot_z_data.length - 1;

					//Save Z-Axis data at current X/Y Coordinate (Will be saved as a percent of the starting bank)
					this.plot_z_data[y].push(this.savedAverageNetProfitPercent);

					//Update for next Y Coordinate
					this.player_start_bank += this.player_start_bank_increment;
					this.player_max_bank += this.player_start_bank_increment;

					//Go to next X-Axis Coordinate
					if (this.plot_z_data[y].length >= this.plotStartBankDataSetSize) {
						
						//Creates new X-Axis row to hold data along the Y-Axis.
						this.plot_z_data.push([]);

						//Update for next X Coordinate
						this.player_bet_multi += this.player_bet_multi_increment;

						//Reset Y-Axis Coordinate
						this.player_start_bank = this.player_start_bank_increment;
						this.player_max_bank = this.player_start_bank_increment;
					}

					//Update Plot
					if (this.plot_enabled) {
						this.updatePlot();
					}
				},
				updatePlot() {
					//For export/import tool
					//https://stackoverflow.com/questions/14964035/how-to-export-javascript-array-info-to-csv-on-client-side

					var title = "Bet Multi: " + this.plot_z_data.length 
								+ " | Start Bank: " + this.plot_z_data[this.plot_z_data.length - 1].length 
								+ " | Z-Set: " + this.plotPointDataSetSize;

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

					if (this.plot_enabled) {
						this.updatePlot();
					}
				},
				//exportCSV is called from our HTML button
				exportCSV() {
					// Create a CSV file in the same directory as our index.html file
					// CSV headers will be our X/Y cordinates in the plot (X = Bet Multi, Y = Start Bank)
					// CSV data will be our Z cordinates in the plot (Z = Average Net Profit)
					var csv = "Bet Multi,Start Bank,Average Net Profit\n";
					for (var i = 0; i < this.plot_z_data.length; i++) {
						for (var j = 0; j < this.plot_z_data[i].length; j++) {
							csv += (i + 1) + "," + (j + 1) + "," + this.plot_z_data[i][j] + "\n";
						}
					}

					var filename = "data.csv";
					var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
					
					//Create file | No IE support because if you use IE you're a fucking idiot <- Copilot wrote that comment. 
					var link = document.createElement("a");
					var url = URL.createObjectURL(blob);
					link.setAttribute("href", url);
					link.setAttribute("download", filename);
					link.style.visibility = 'hidden';
					document.body.appendChild(link);
					link.click();
					document.body.removeChild(link);
				},
				//importCSV is called from our HTML button
				importCSV() {
					//Open a file select prompt
					var input = document.createElement('input');
					input.type = 'file';
					//When a file is selected, read it and update the plot
					input.onchange = e => {
						var file = e.target.files[0];
						var reader = new FileReader();
						reader.readAsText(file,'UTF-8');
						reader.onload = readerEvent => {
							var content = readerEvent.target.result;
							//Update plot with imported data
							this.parseCSV(content);
						}
					}
					input.click();
				},
				//parseCSV is called from importCSV
				parseCSV(content) {
					//Take the csv content and parse it into an array for our plot data
					var lines = content.split("\n");
					var rows  = [];
					for (var i=0; i < lines.length; i++) {
						var data = lines[i].split(',');
						if (data.length == 3) {
							rows.push(data);
						}
					}
					//Remove headers
					rows.shift();

					//Create a new array to hold our plot data
					var plotData = [
						[]
					];

					//Iterate through the CSV data and replace our existing plot data
					for (var i = 0; i < rows.length; i++) {
						var row = rows[i];
						var betMulti = parseInt(row[0]);
						var startBank = parseInt(row[1]);
						var avgNetProfit = parseFloat(row[2]);

						//We need to build the plotData array out the same way we build our plot_z_data array in saveDataPoint()
						//Example plotData array:
						//[
						//	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
						//	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
						//	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
						//	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
						//	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
						//	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
						//	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
						//	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
						//	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
						//	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
						//]

						for (var j = 0; j < betMulti; j++) {
							//If we don't have an array for this betMulti yet, create it
							if (plotData[j] == undefined) {
								plotData[j] = [];
							}
							//If we don't have an averageNetProfit for this startBank yet, create it
							if (plotData[j][startBank - 1] == undefined) {
								plotData[j][startBank - 1] = avgNetProfit;
							}
						}
					}

					//Update the plot with our new data
					this.clearPlotData();
					this.plot_z_data = plotData;

					//Set our player settings to the last row in the CSV
					this.player_start_bank = 10 + (plotData[0].length * this.player_start_bank_increment);
					this.player_max_bank = this.player_start_bank;
					this.player_bet_multi = 2.70 + (plotData.length * this.player_bet_multi_increment);

					//Soft reset to remove any pre-import junk data
					this.softReset();
					this.updatePlot();
				},
				updateChart() {
					chart.data.datasets[0].data.push(this.player_bank.toFixed(2));
					chart.data.datasets[1].data.push(this.player_take_home);
					this.player_highest_bank = 0;

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

					this.player_current_bet = this.casino_min_bet;
					this.player_take_home = 0;
					this.player_bank = this.player_start_bank
					this.wins = 0;
					this.total_rolls = 0;
					this.player_highest_bet = 0;
					this.player_investment = 0;

					//Retain Plot data...
				},
				hardReset() {
					this.softReset();
					this.clearPlotData();
				},
			}
		});