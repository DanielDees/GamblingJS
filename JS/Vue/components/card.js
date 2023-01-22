export default {
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
}