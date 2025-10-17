// src/hooks.server.js
import PocketBase from 'pocketbase';

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
	const pb = new PocketBase('https://jpi.sophnexacademy.com.ng');
	event.locals.pb = pb;

	// ✅ Load cookie but disable auto-refresh
	const cookie = event.request.headers.get('cookie') || '';
	pb.authStore.loadFromCookie(cookie, false);
	pb.autoCancellation(false);

	try {
		// ✅ Check if cookie is still valid
		if (pb.authStore.isValid) {
			const model = pb.authStore.model;
			event.locals.user = model;

			// Optional: Ensure it’s an admin
			if (model?.collectionName !== 'admin_users') {
				pb.authStore.clear();
				event.locals.user = null;
			}
		} else {
			event.locals.user = null;
		}
	} catch (err) {
		console.error('Auth validation failed:', err);
		pb.authStore.clear();
		event.locals.user = null;
	}

	// 🚫 Disable any unwanted SSR refresh requests
	pb.beforeSend = () => {
		throw new Error('SSR network disabled');
	};

	const response = await resolve(event);

	// ✅ Send back the same auth cookie (no refresh)
	response.headers.append('set-cookie', pb.authStore.exportToCookie());

	return response;
}
