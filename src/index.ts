import { defineInterface } from '@directus/extensions-sdk';
import InterfaceComponent from './interface.vue';

export default defineInterface({
	id: 'custom-save-as-copy',
	name: 'Custom Save as Copy',
	icon: 'content_copy',
	description: 'This interface adds a custom save as copy button avoiding the need to menu dive.',
	component: InterfaceComponent,
	hideLabel: true,
	options: null,
	types: ['string'],
	autoKey: true,
});
