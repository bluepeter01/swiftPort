import PocketBase from 'pocketbase';
import type { Handle, HandleFetch } from '@sveltejs/kit';
import { POCKETBASE_URL } from '$env/static/private';

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.pb = new PocketBase(POCKETBASE_URL);

	// load the store data from the request cookie string
	event.locals.pb.authStore.loadFromCookie(event.request.headers.get('cookie') || '');

	try {
		// get an up-to-date auth store state by verifying and refreshing the loaded auth token (if any)
		if (event.locals.pb.authStore.isValid) {
			await event.locals.pb.collection('admin_users').authRefresh();
			event.locals.user = structuredClone(event.locals.pb.authStore.model);
		}
	} catch (err) {
		// clear the auth store on failed refresh
		event.locals.pb.authStore.clear();
		event.locals.user = undefined;
	}

	const response = await resolve(event);

	// send back the default 'pb_auth' cookie to the client with the latest store state
	// but only if it's not already set by an endpoint
	if (!response.headers.has('set-cookie')) {
		response.headers.append(
			'set-cookie',
			event.locals.pb.authStore.exportToCookie({ httpOnly: true, secure: false, sameSite: 'Lax' })
		);
	}

	return response;
};

export const handleFetch: HandleFetch = async ({ event, request, fetch }) => {
	request.headers.set('cookie', event.request.headers.get('cookie') || '');

	return fetch(request);
};
