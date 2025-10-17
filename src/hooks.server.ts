// src/hooks.server.js
import PocketBase from 'pocketbase';

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
	event.locals.pb = new PocketBase('https://jpi.sophnexacademy.com.ng');

	// load the store data from the request cookie string
	event.locals.pb.authStore.loadFromCookie(event.request.headers.get('cookie') || '');

	try {
		// verify and refresh the user
		if (event.locals.pb.authStore.isValid) {
			const authData = await event.locals.pb.collection('users').authRefresh();
			event.locals.user = authData.record; // ✅ assign the user to locals
		} else {
			event.locals.user = null;
		}
	} catch (_) {
		// clear the auth store on failed refresh
		event.locals.pb.authStore.clear();
		event.locals.user = null; // ❗ set user to null on error
	}

	const response = await resolve(event);

	// send updated cookie back
	response.headers.append('set-cookie', event.locals.pb.authStore.exportToCookie());

	return response;
}