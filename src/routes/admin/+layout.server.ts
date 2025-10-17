import PocketBase from 'pocketbase';
import { redirect } from '@sveltejs/kit';

export async function load({ cookies }) {
	const pb = new PocketBase('https://jpi.sophnexacademy.com.ng');
	const cookie = cookies.get('pb_auth');

	if (!cookie) throw redirect(303, '/login');

	try {
		pb.authStore.loadFromCookie(cookie);

		// Ensure the logged-in user belongs to admin_users
		if (!pb.authStore.isValid || pb.authStore.model?.collectionName !== 'admin_users') {
			throw redirect(303, '/login');
		}
	} catch {
		throw redirect(303, '/login');
	}

	return { admin: pb.authStore.model };
}
