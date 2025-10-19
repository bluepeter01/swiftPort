import { json } from '@sveltejs/kit';
import PocketBase from 'pocketbase';

export const POST = async ({ request, cookies, url }) => {
	try {
		const { email, password } = await request.json();
		const redirectTo = url.searchParams.get('redirectTo') || '/admin';

		const pb = new PocketBase('https://jpi.sophnexacademy.com.ng');

		const authData = await pb.collection('admin_users').authWithPassword(email, password);

		// Make sure it's actually an admin
		if (!authData.record?.isAdmin) {
			pb.authStore.clear();
			return json({ error: true, message: 'Access denied. Admins only.' }, { status: 403 });
		}

		// ✅ Save cookie
		cookies.set('pb_auth', pb.authStore.exportToCookie(), {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: false, // true in production
			maxAge: 60 * 60 * 24 * 7
		});

		return json({
			success: true,
			message: 'Admin login successful.',
			redirectTo
		});
	} catch (err) {
		console.error('Admin login failed:', err);
		return json({
			error: true,
			message: err?.response?.data?.message || 'Invalid email or password.'
		}, { status: 401 });
	}
};
