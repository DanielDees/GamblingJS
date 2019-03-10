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
	template: `
		<div class="card text-center">
			<div class="card-header">
				<ul class="nav nav-tabs card-header-tabs">
					<li v-for="div in tabs" class="nav-item">{{ div.name }}</li>
				</ul>
			</div>
			<div class="card-body">
				<slot></slot>
			</div>
		</div>
	`
});

Vue.component('card', {
	props: {
		title: { required: true }
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