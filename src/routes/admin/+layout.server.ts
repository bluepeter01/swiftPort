// import PocketBase from 'pocketbase';
// import { redirect } from '@sveltejs/kit';

// export async function load({ cookies }) {
// 	const pb = new PocketBase('https://jpi.sophnexacademy.com.ng');
// 	const cookie = cookies.get('pb_auth');

// 	// 🚫 No cookie at all → redirect
// 	if (!cookie) throw redirect(303, '/login');

// 	try {
// 		// ✅ Load cookie without triggering any verification or refresh
// 		pb.authStore.loadFromCookie(cookie, false);
// 		pb.autoCancellation(false);

// 		// ✅ Block network calls during SSR (no /users/auth-refresh ever)
// 		pb.beforeSend = function () {
// 			throw new Error('Network disabled in admin SSR auth check');
// 		};

// 		const model = pb.authStore.model;
// 		const hasValidToken = Boolean(pb.authStore.token);
// 		const fromAdminCollection = model?.collectionName === 'admin_users';

// 		// 🚫 Invalid or wrong collection
// 		if (!hasValidToken || !fromAdminCollection) {
// 			throw redirect(303, '/login');
// 		}

// 		// ✅ Return current admin info
// 		return { admin: model };
// 	} catch (err) {
// 		// Only log real unexpected errors (not redirects)
// 		if (!(err instanceof Response)) {
// 			console.error('Admin auth check failed:', err?.message || err);
// 		}
// 		throw redirect(303, '/login');
// 	}
// }

