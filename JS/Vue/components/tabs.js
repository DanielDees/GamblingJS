export default {
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
};