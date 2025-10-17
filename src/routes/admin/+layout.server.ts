import PocketBase from 'pocketbase';
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies, url }) => {
	const pb = new PocketBase('https://jpi.sophnexacademy.com.ng');
	const token = cookies.get('pb_auth');
	const pathname = url.pathname;
	const isLoginPage = pathname === '/login';
	const isAdminPage = pathname.startsWith('/admin');

	// ✅ Step 1: If logged in cookie exists, load it (no refresh)
	if (token) {
		try {
			pb.authStore.loadFromCookie(token, false);
			pb.autoCancellation(false);
			pb.beforeSend = () => {
				throw new Error('SSR network disabled');
			};
		} catch (err) {
			console.error('Auth load failed:', err);
			cookies.delete('pb_auth', { path: '/' });
			throw redirect(303, '/login');
		}
	}

	const model = pb.authStore.model;
	const isAdmin = pb.authStore.isValid && model?.collectionName === 'admin_users';

	// 🚫 Step 2: Not logged in and trying to view an admin page → go to login
	if (!token || !isAdmin) {
		if (isAdminPage && !isLoginPage) {
			throw redirect(302, '/login');
		}
	}

	// 🚀 Step 3: Already logged in as admin and visiting login page → go to admin dashboard
	if (isAdmin && isLoginPage) {
		throw redirect(303, '/admin');
	}

	// ✅ Step 4: Return admin info to layouts/pages
	return {
		admin: isAdmin ? model : null
	};
};
