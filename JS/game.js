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
				
				plotStartBankDataSetSize: 50,
				//plotBetMultiDataSetSize: 20,
				
				plotPointDataSetSize: 3000,

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
				/**
				 * Calculate the maximum number of safe bets a player can make based on their current bank and bet amount.
				 * @return {number} The maximum number of safe bets.
				 */
				safeBetCount() {
					var max = 0;
					while(this.player_current_bet * Math.pow(this.player_bet_multi, max + 1) < this.player_bank) { max++; }
					return max;
				},

				/**
				 * Calculate the odds of making a safe bet.
				 * @return {string} The odds as a string in the format "~1/X (Y%)".
				 */
				safeBetOdds() {
					var odds = Math.pow(1 - (this.casino_win_odds / 100), this.safeBetCount) * 100;
					return "~1/" + (100 / odds).toFixed(0) + " (" + odds.toFixed(4) + "%)";
				},

				/**
				 * Calculate the profitability ratio of the player's betting strategy.
				 * @return {number} The profitability ratio.
				 */
				bet_profitability_ratio() {
					// Initialize the investment with the minimum bet required by the casino
					var investment = this.casino_min_bet;

					// Calculate the maximum winnings from the initial bet
					var max_winnings = this.casino_min_bet * (this.casino_payout_rate + 1);

					// Loop from 1 to 10 (exclusive)
					for (var i = 1; i < 10; i++) {
						// Increment the investment by the amount the player would bet after <i> losses
						investment += Math.pow(this.player_bet_multi, i);

						// Update the maximum winnings to the amount the player would win after <i> losses and a win
						max_winnings = Math.pow(this.player_bet_multi, i) * (this.casino_payout_rate + 1);
					}

					// Calculate the profitability ratio as the ratio of maximum winnings to investment
					var profit_ratio = max_winnings / investment;

					// Return the profitability ratio
					return profit_ratio;
				},

				/**
				 * Calculate the payout for the player's current bet.
				 * @return {number} The payout amount.
				 */
				payout() {
					return this.player_current_bet + (this.player_current_bet * this.casino_payout_rate);
				},

				/**
				 * Calculate the average profit per win for the player.
				 * If no wins have been recorded yet, returns a string message.
				 * @return {number|string} The average profit per win, or a string indicating no wins have been recorded.
				 */
				avgProfit() {
					if (this.wins === 0) {
						return "No wins yet";
					}
					return ((this.player_bank + this.player_take_home - this.player_start_bank) / this.wins).toFixed(2);
				},

				/**
				 * Calculate the rate of auto-rolling based on the roll rate.
				 * @return {number} The auto-roll rate.
				 */
				autoRollRate() {
					return this.roll_rate > 0 ? 1000 / this.roll_rate : 500;
				},

				/**
				 * Calculate the win rate for the player.
				 * If no games have been played yet, returns 0.
				 * @return {number} The win rate as a percentage, or 0 if no games have been played.
				 */
				winRate() {
					if (this.total_rolls === 0) {
						return 0;
					}
					return (this.wins / this.total_rolls) * 100;
				},

				/**
				 * Calculate the average number of rolls saved.
				 * @return {number} The average number of saved rolls.
				 */
				savedAverageRolls() {
					return this.savedRolls.reduce((sum, n) => sum + n, 0) / this.savedRolls.length;
				},

				/**
				 * Calculate the average net profit saved.
				 * @return {number} The average net profit saved.
				 */
				savedAverageNetProfit() {
					return this.savedNetProfit.reduce((sum, n) => sum + n, 0) / this.savedNetProfit.length;
				},

				/**
				 * Calculate the average net profit saved as a percentage of the player's starting bank.
				 * @return {number} The average net profit saved as a percentage.
				 */
				savedAverageNetProfitPercent() {
					return (this.savedAverageNetProfit / this.player_start_bank) * 100;
				},

				/**
				 * Calculate the size of the saved dataset.
				 * @return {number} The size of the saved dataset.
				 */
				savedDatasetSize() {
					return this.savedRolls.length;
				},
				/**
				 * Calculate the rate of positive net profits in the saved data.
				 * @return {number} The rate of non-negative net profits as a fraction of the total number of net profits.
				 */
				savedDataPositiveRate() {
					return this.savedNetProfit.filter(profit => profit >= 0).length / this.savedNetProfit.length;
				}
			},
			methods: {
				/**
				 * Calculate and place the player's bet.
				 */
				bet() {
					// Calculate the player's current bet, ensuring it's not less than the casino's minimum bet
					// and not more than the player's current bank
					this.player_current_bet = Math.max(this.casino_min_bet, this.player_current_bet * this.player_bet_multi);
					this.player_current_bet = Math.min(this.player_current_bet, this.player_bank);

					// Deduct the current bet from the player's bank and add it to the player's investment
					this.player_bank -= this.player_current_bet;
					this.player_investment += this.player_current_bet;

					// Update the player's highest bet if necessary
					this.player_highest_bet = Math.max(this.player_current_bet, this.player_highest_bet);
				},

				/**
				 * Handle the player winning a bet.
				 */
				win() {
					// If the chart is enabled, update the chart's data and colors to reflect the win
					if (this.chart_enabled) {
						chart.data.labels.push("Win Bet: " + this.player_current_bet.toFixed(0));
						chart.data.datasets[0].pointBorderColor.push("#4B5");
						chart.data.datasets[0].pointBackgroundColor.push("#4B5");
					}

					// Add the payout to the player's bank and update the player's highest payout if necessary
					this.player_bank += this.payout;
					this.player_highest_payout = Math.max(this.payout, this.player_highest_payout);

					// Calculate any overflow if the player's bank exceeds their maximum bank
					var overflow = Math.max(this.player_bank - this.player_max_bank, 0);

					// Add the overflow to the player's take-home amount and subtract it from their bank
					this.player_take_home += overflow;
					this.player_bank -= overflow;

					// Reset the player's current bet to the casino's minimum bet and their investment to 0
					this.player_current_bet = this.casino_min_bet;
					this.player_investment = 0;

					// Increment the player's win count
					this.wins++;
				},

				/**
				 * Handle the player losing a bet.
				 */
				lose() {
					// If the chart is enabled, update the chart's data and colors to reflect the loss
					if (this.chart_enabled) {
						chart.data.labels.push("Lose Bet: " + this.player_current_bet.toFixed(0));
						chart.data.datasets[0].pointBorderColor.push("#B22");
						chart.data.datasets[0].pointBackgroundColor.push("#B22");
					}

					// If the player's bank is negative after the loss, refill the bank to the player's starting bank amount,
					// deduct the refill amount from the player's take-home amount, and reset the player's current bet to the casino's minimum bet
					if (this.bank < 0) {
						var refill = this.player_start_bank - this.player_bank;
						this.player_bank += refill;
						this.player_take_home -= refill;
						this.player_current_bet = this.casino_min_bet;
					}
				},
				/**
				 * Simulate a roll of the dice in the casino game.
				 * If the roll is a win according to the casino's odds, call the win() method.
				 * If the roll is a loss, call the lose() method.
				 */
				roll() {
					// Increment the total number of rolls
					this.total_rolls++;

					// Generate a random number between 0 and 100
					// If the number is greater than or equal to the casino's win odds, the player loses
					if (Math.random() * 100 >= this.casino_win_odds) {
						this.lose();
						return;
					}

					// If the number is less than the casino's win odds, the player wins
					this.win();
				},
				/**
				 * Simulate a round of the casino game.
				 * If the player has chosen to only roll safe bets and they have no safe bets left, end the round.
				 * Otherwise, place a bet and roll the dice.
				 * If the chart is enabled, update the chart.
				 * If the round has ended, save the total number of rolls and net profit for this round, and reset the game.
				 *
				 * The simulation continues until our long term return rate drops below the threshold, which is the win rate subtracted from 50, and then made negative.
				 * This ensures we do not log a positive return rate on losing betting strategies.
				 * A cap is set at 50000 for the size of the saved dataset to prevent the simulation from running indefinitely in case a betting strategy is found
				 * that beats the buffer.
				 * We take 50 - win rate as our threshold average net profit percent to continue until the softlocked cap is reached.
				 * This is so we can get a more accurate average net profit percent for a betting strategy that beats the expected return rate.
				 */
				playRound() {
					var endRound = false;

					// If the player has chosen to only roll safe bets and they have no safe bets left, end the round
					if (this.roll_only_safe && this.safeBetCount < 1) {
						endRound = true;
					}

					if (!endRound) {
						// Place a bet and roll the dice
						this.bet();
						this.roll();

						// If the chart is enabled, update the chart
						if (this.chart_enabled) {
							this.updateChart();
						}
					}

					if (endRound) {
						// Save the total number of rolls and net profit for this round
						this.savedRolls.push(this.total_rolls);
						this.savedNetProfit.push(this.player_take_home + this.player_bank - this.player_start_bank);

						// Reset the game
						this.softReset();
					}

					// Continue running simulation until our long term return rate drops below the threshold, which is the win rate subtracted from 50, and then made negative
					if ((this.savedDatasetSize >= this.plotPointDataSetSize && this.savedAverageNetProfitPercent < -(50 - this.winRate)) || this.savedDatasetSize > 50000) {
						this.saveDataPoint();
						this.hardReset();
					}
				},
				/**
				 * Save a data point for the current game state.
				 * This method is called when the simulation reaches a certain threshold, which can be adjusted for data granularity.
				 * The data point includes the average net profit (Z-axis), the player's bet multiplier (X-axis), and the player's starting and maximum bank (Y-axis).
				 *
				 * The Z-axis represents the average net profit as a percentage of the starting bank.
				 * The X-axis represents the player's bet multiplier.
				 * The Y-axis represents the player's starting and maximum bank.
				 *
				 * The method first saves the average net profit.
				 * It then increments the player's starting and maximum bank for the next Y coordinate.
				 * If the current Y coordinate has reached the designated size for a plot point, it creates a new X coordinate and resets the Y coordinate.
				 * Finally, if the plot is enabled, it updates the plot with the new data point.
				 */
				saveDataPoint() {
					var y = this.plot_z_data.length - 1;

					// Save Z-Axis data at current X/Y Coordinate (Will be saved as a percent of the starting bank)
					this.plot_z_data[y].push(this.savedAverageNetProfitPercent);

					// Update for next Y Coordinate
					this.player_start_bank += this.player_start_bank_increment;
					this.player_max_bank += this.player_start_bank_increment;

					// Go to next X-Axis Coordinate if current Y coordinate has reached the designated size for a plot point
					if (this.plot_z_data[y].length >= this.plotStartBankDataSetSize) {
						
						// Creates new X-Axis row to hold data along the Y-Axis
						this.plot_z_data.push([]);

						// Update for next X Coordinate
						this.player_bet_multi += this.player_bet_multi_increment;

						// Reset Y-Axis Coordinate
						this.player_start_bank = this.player_start_bank_increment;
						this.player_max_bank = this.player_start_bank_increment;
					}

					// Update Plot if plot is enabled
					if (this.plot_enabled) {
						this.updatePlot();
					}
				},
				updatePlot() {
					// Prepare the title for the plot, which includes the current bet multiplier, starting bank, and Z set size
					var title = "Bet Multi: " + this.plot_z_data.length 
								+ " | Start Bank: " + this.plot_z_data[this.plot_z_data.length - 1].length 
								+ " | Z-Set: " + this.plotPointDataSetSize;

					// Define the layout for the plot, including the title, size, and margins
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

					// Create a new plot with the current Z data (average net profit) and the defined layout
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
					// Clear the saved rolls and net profit data
					this.savedRolls = [];
					this.savedNetProfit = [];

					// If the plot is enabled, update the plot
					if (this.plot_enabled) {
						this.updatePlot();
					}
				},
				//exportCSV is called from our HTML button
				exportCSV() {
					/* 
						Create a CSV file in the same directory as our index.html file
						CSV data will be our X/Y/Z cordinates in the plot (X = Bet Multi, Y = Start Bank, Z = Average Net Profit)

						Example CSV:
						Bet Multi,Start Bank,Average Net Profit
						1,1,0.5
						1,2,0.6
						1,3,0.7
						2,1,0.8
						2,2,0.9
						2,3,1.0
					*/
					var csv = "Bet Multi,Start Bank,Average Net Profit\n";
					for (var betMulti = 0; betMulti < this.plot_z_data.length; betMulti++) {
						for (var startBank = 0; startBank < this.plot_z_data[betMulti].length; startBank++) {
							csv += (betMulti + 1) + "," + (startBank + 1) + "," + this.plot_z_data[betMulti][startBank] + "\n";
						}
					}

					//Filename will be a timestamp
					var filename = "plot_data_" + new Date().getTime() + ".csv";
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
				/**
				 * Import CSV data from a file.
				 * This function is triggered by a button in the HTML.
				 * It opens a file select prompt, reads the selected file, and updates the plot with the imported data.
				 */
				importCSV() {
					// Create a file input element
					let input = document.createElement('input');
					input.type = 'file';

					// Set up an event listener for when a file is selected
					input.onchange = e => {
						// Get the selected file
						let file = e.target.files[0];

						// Create a new FileReader to read this file
						let reader = new FileReader();

						// Start reading the file. When it's done, the `onload` event will be triggered
						reader.readAsText(file, 'UTF-8');

						// Set up the `onload` event. When the file is read, this event is triggered
						reader.onload = e => {
							// Get the file contents
							let content = e.target.result;

							// Update the plot with the imported data
							this.parseCSV(content);
						}
					}

					// Trigger the file select prompt
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
				/**
				 * Update the chart with the current game state.
				 * This method is called after each game round.
				 * It adds the current player bank and take home values to the chart, and removes old data points if the chart has more than the specified history length.
				 * Finally, it updates the chart display.
				 */
				updateChart() {
					// Add the current player bank and take home values to the chart
					chart.data.datasets[0].data.push(this.player_bank.toFixed(2));
					chart.data.datasets[1].data.push(this.player_take_home);

					// Reset the player's highest bank
					this.player_highest_bank = 0;

					// If the chart has more data points than the specified history length, remove the oldest data points
					while (chart.data.datasets[0].data.length > this.history) {
						chart.data.datasets[0].data.shift();
						chart.data.datasets[1].data.shift();
						chart.data.datasets[2].data.shift();
						chart.data.datasets[0].pointBorderColor.shift();
						chart.data.datasets[0].pointBackgroundColor.shift();
						chart.data.labels.shift();
					}

					// Update the chart display
					chart.update({ duration: Math.min(this.autoRollRate * 2, 4000) });
				},

				/**
				 * Clear the chart data.
				 * This method is called when the game is reset.
				 * It clears all data and color settings from the chart.
				 */
				clearChart() {
					chart.data.labels = [];
					chart.data.datasets[0].data = [];
					chart.data.datasets[1].data = [];
					chart.data.datasets[2].data = [];
					chart.data.datasets[0].pointBorderColor = [];
					chart.data.datasets[0].pointBackgroundColor = [];
				},

				/**
				 * Show the chart.
				 * This method is called when the "Show Chart" button is clicked.
				 * If the chart is currently hidden, it shows the chart.
				 */
				showChart() {
					if($('#chart').is(':hidden')) {
						$('#chart').show();
					}
				},

				/**
				 * Hide the chart.
				 * This method is called when the "Hide Chart" button is clicked.
				 * If the chart is currently visible, it hides the chart.
				 */
				hideChart() {
					if($('#chart').is(':visible')) {
						$('#chart').hide();
					}
				},

				/**
				 * Show the plot.
				 * This method is called when the "Show Plot" button is clicked.
				 * If the plot is currently hidden, it shows the plot.
				 */
				showPlot() {
					if($('#heatmap').is(':hidden')) {
						$('#heatmap').show();
					}
				},

				/**
				 * Hide the plot.
				 * This method is called when the "Hide Plot" button is clicked.
				 * If the plot is currently visible, it hides the plot.
				 */
				hidePlot() {
					if($('#heatmap').is(':visible')) {
						$('#heatmap').hide();
					}
				},
				/**
				 * Perform a soft reset of the game.
				 * This method is used when you want to start a new game but retain the plot data.
				 * It resets most game variables, handles chart and plot visibility based on their enabled status, and retains the plot data.
				 */
				softReset() {
					// If the chart is enabled, show and clear the chart
					if (this.chart_enabled) {
						this.showChart();
						this.clearChart();
					}
					// If the chart is not enabled, clear the chart and hide it
					if (!this.chart_enabled) {
						this.clearChart();
						this.hideChart();
					}

					// If the plot is enabled, show the plot
					if (this.plot_enabled) {
						this.showPlot();
					}
					// If the plot is not enabled, hide the plot
					if (!this.plot_enabled) {
						this.hidePlot();
					}

					// Reset game variables
					this.player_current_bet = this.casino_min_bet;
					this.player_take_home = 0;
					this.player_bank = this.player_start_bank
					this.wins = 0;
					this.total_rolls = 0;
					this.player_highest_bet = 0;
					this.player_investment = 0;

					// Retain Plot data...
				},

				/**
				 * Perform a hard reset of the game.
				 * This method is used when you want to completely start over, with no data from previous games.
				 * It first performs a soft reset, and then clears the plot data.
				 */
				hardReset() {
					// Perform a soft reset
					this.softReset();

					// Clear the plot data
					this.clearPlotData();
				},
			}
		});