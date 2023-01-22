Vue.component('tabs', {
	data() {
		return { tabs: [] };
	},
	created() {
		this.tabs = this.$children;
	},
	mounted() {
		console.log(this.$children);
	},
	methods: {
		select(selectedTab) {
			this.tabs.forEach((tab) => {
				tab.selected = (tab.name == selectedTab.name);
				tab.viewing = ((tab.selected || selectedTab.name == "All") && tab.name != "All");
			});
		}
	},
	template: `
		<div class="card text-center">
			<div class="card-header">
				<ul class="nav nav-tabs card-header-tabs justify-content-center">
					<li v-for="tab in tabs" class="nav-item">
						<a 	class="nav-link" 
							:class="{ 'active': tab.selected }"
							@click="select(tab)">{{ tab.name }}</a>
					</li>
				</ul>
			</div>

			<div class="card-body">
				<div class="row justify-content-center">
					<slot></slot>
				</div>
			</div>
		</div>
	`
});

Vue.component('tab', {
	props: {
		content_visible: { default: false },
		active: { default: false },
		name: { required: true }
	},
	data() {
		return { 
			selected: false,
			viewing: false
		};
	},
	mounted() {
		this.selected = this.active;
		this.viewing = this.content_visible;
	},
	template: `<div v-show="viewing"><slot>{{ name }}</slot></div>`
})

Vue.component('card', {
	props: {
		title: { required: false }
	},
	template: `
		<div class="card" style="width: 18rem;">
			<div class="card-body">
				<h5 class="card-title text-center">{{ title }}</h5>
				
				<ul class="list-group list-group-flush">
					<slot></slot>
				</ul>
			</div>
		</div>
	`
});

Vue.component('card-item', {
	template: `<li class="list-group-item"><slot></slot></li>`
});

Vue.component('chart-updater', {
	template: `<canvas id="chart" style="display:none"><!-- Our gambling chart data will be shown here --></canvas>`,
	created() {
		this.initializeChart();
	},
	data() {
		return {
			chart_enabled: false,
			chart: null
		};
	},
	methods: {
		win(winBet) {
			if (this.chart_enabled) {
				this.chart.data.labels.push("Win Bet: " + winBet.toFixed(0));
				this.chart.data.datasets[0].pointBorderColor.push("#4B5");
				this.chart.data.datasets[0].pointBackgroundColor.push("#4B5");
			}
		},
		lose(loseBet) {
			if (this.chart_enabled) {
				this.chart.data.labels.push("Lose Bet: " + loseBet.toFixed(2));
				this.chart.data.datasets[0].pointBorderColor.push("#B22");
				this.chart.data.datasets[0].pointBackgroundColor.push("#B22");
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
		},
		initializeChart() {
			this.chart = new Chart(
				$("#chart")[0].getContext('2d'), 
				{
					type: 'line',
					data: {
						labels: [],
						datasets: [
						{
							label: "Bank",
							borderColor: "#000",
							pointRadius: 8,
							pointHoverRadius: 16,
							pointBorderColor: [],
							pointBackgroundColor: [],
							data: []
						},
						{
							label: "Take Home",
							borderColor: "#58B",
							pointRadius: 0,
							data: []
						},
						{
							label: "Net Profit",
							borderColor: "#BB3",
							pointRadius: 0,
							data: []
						}]
					},
					options: {
						elements: {
							line: {
								tension: 0,
							}
						},
						scales: {
	            			yAxes: [{
	            				beginAtZero: true,
	                			stacked: false
	            			}]
	        			}
					}
				}
			);
		},
		updateChart() {
			if (this.chart_enabled) {
				this.chart.data.datasets[0].data.push(casino.player_bank.toFixed(2));
				this.chart.data.datasets[1].data.push(casino.player_take_home);
				casino.player_highest_bank = 0;

				while (this.chart.data.datasets[0].data.length > casino.history) {
					this.chart.data.datasets[0].data.shift();
					this.chart.data.datasets[1].data.shift();
					this.chart.data.datasets[2].data.shift();
					this.chart.data.datasets[0].pointBorderColor.shift();
					this.chart.data.datasets[0].pointBackgroundColor.shift();
					this.chart.data.labels.shift();
				}

				//Chart animation will last for 4 seconds, or twice the auto roll rate, whichever is less
				this.chart.update({ duration: Math.min(casino.autoRollRate * 2, 4000) });
			}
		},
		clearChart() {
			this.chart.data.labels = [];
			this.chart.data.datasets[0].data = [];
			this.chart.data.datasets[1].data = [];
			this.chart.data.datasets[2].data = [];
			this.chart.data.datasets[0].pointBorderColor = [];
			this.chart.data.datasets[0].pointBackgroundColor = [];
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
	},
});
