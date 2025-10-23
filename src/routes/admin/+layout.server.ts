import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, cookies, url }) => {
	const token = cookies.get('pb_auth');
	const pathname = url.pathname;
	const isAdminLoginPage = pathname === '/admin/login';

	// If the user is not logged in (neither by cookie nor by validated locals.user) and not on the login page, redirect them.
	if (!token && !locals.user && !isAdminLoginPage) {
		throw redirect(302, '/admin/login');
	}

	// If the user is logged in but is not an admin, log them out and redirect.
	if (locals.user && locals.user.collectionName !== 'admin_users' && !isAdminLoginPage) {
		// Log out from PocketBase and clear the cookie
		locals.pb.authStore.clear();
		cookies.delete('pb_auth', { path: '/' });
		throw redirect(303, '/admin/login');
	}

	return {
		user: locals.user
	};
};