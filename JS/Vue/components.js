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
				<slot></slot>
			</div>
		</div>
	`
});

Vue.component('tab', {
	props: {
		active: { default: false },
		name: { required: true }
	},
	data() {
		return { selected: false };
	},
	mounted() {
		this.selected = this.active;
	},
	template: `<div v-show="selected"><slot>{{ name }}</slot></div>`
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