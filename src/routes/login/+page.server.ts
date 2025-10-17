import PocketBase from 'pocketbase';
import { redirect } from '@sveltejs/kit';

export const load = async ({ cookies }) => {
	const pb = new PocketBase('https://jpi.sophnexacademy.com.ng');
	const token = cookies.get('pb_auth');

	if (token) {
		pb.authStore.loadFromCookie(token, false);
		const model = pb.authStore.model;
		const isAdmin = pb.authStore.isValid && model?.collectionName === 'admin_users';

		// ✅ Already logged in → redirect to /admin
		if (isAdmin) {
			throw redirect(303, '/admin');
		}
	}

	// otherwise, show login page
	return {};
};
