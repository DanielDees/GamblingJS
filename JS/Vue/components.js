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
		//Why are props used if you can just set the values manually in mounted() ?
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
	template: 
		`<div class="card" style="width: 18rem;">
			<div class="card-body">
				<h5 class="card-title text-center">{{ title }}</h5>
				
				<ul class="list-group list-group-flush">
					<slot></slot>
				</ul>
			</div>
		</div>`
});

Vue.component('card-item', {
	template: `<li class="list-group-item"><slot></slot></li>`
});