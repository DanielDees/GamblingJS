export default {
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
};