import { defineInterface } from '@directus/extensions-sdk';
import InterfaceComponent from './interface.vue';

export default defineInterface({
	// Use an underscore-only id so auto-generated field keys start from a
	// GraphQL-safe base (hyphenated keys break GraphQL field validation).
	id: 'custom_save_as_copy',
	name: 'Custom Save as Copy',
	icon: 'content_copy',
	description: 'This interface adds a custom save as copy button avoiding the need to menu dive.',
	component: InterfaceComponent,
	hideLabel: true,
	options: null,
	types: ['string'],
	autoKey: true,
});
