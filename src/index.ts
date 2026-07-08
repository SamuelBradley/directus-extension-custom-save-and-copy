import { defineInterface } from '@directus/extensions-sdk';
import InterfaceComponent from './interface.vue';

export default defineInterface({
	// Directus only supports boolean autoKey for interfaces, and its generated
	// key format still appends a hyphenated suffix, which breaks GraphQL field
	// validation for this helper field. Disable auto generation so operators can
	// provide a safe key such as `custom_save_as_copy` explicitly.
	id: 'custom_save_as_copy',
	name: 'Custom Save as Copy',
	icon: 'content_copy',
	description: 'This interface adds a custom save as copy button avoiding the need to menu dive.',
	component: InterfaceComponent,
	hideLabel: true,
	options: null,
	types: ['string'],
	autoKey: false,
});
