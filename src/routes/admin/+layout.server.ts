import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, cookies, url }) => {
	const token = cookies.get('pb_auth');
	const pathname = url.pathname;
	const isAdminLoginPage = pathname === '/login';

	// 🧠 Require login for admin pages
	// FIX: The redirect URL must be a string: '/login'
	if (!token && !isAdminLoginPage) {
		throw redirect(302, '/login');
	}

	// 🧠 Require admin rights
	// If the user model is present but they are not an admin, log them out.
	if (locals.user && !locals.user.isAdmin && !isAdminLoginPage) {
		// Log out from PocketBase and clear the cookie
		locals.pb.authStore.clear();
		cookies.delete('pb_auth', { path: '/' });
		// FIX: The redirect URL must be a string: '/login'
		throw redirect(303, '/login');
	}

	return {
		user: locals.user
	};
};