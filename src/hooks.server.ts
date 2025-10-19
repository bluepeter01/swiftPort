// // src/hooks.server.js
// import PocketBase from 'pocketbase';

// /** @type {import('@sveltejs/kit').Handle} */
// export async function handle({ event, resolve }) {
// 	event.locals.pb = new PocketBase('https://jpi.sophnexacademy.com.ng');

// 	// Load auth cookie
// 	event.locals.pb.authStore.loadFromCookie(event.request.headers.get('cookie') || '');

// 	try {
// 		// Refresh auth if valid
// 		if (event.locals.pb.authStore.isValid) {
// 			const authData = await event.locals.pb.collection('admin_users').authRefresh();
// 			event.locals.user = authData.record;
// 		} else {
// 			event.locals.user = null;
// 		}
// 	} catch (err) {
// 		console.error('Auth refresh failed:', err);
// 		event.locals.pb.authStore.clear();
// 		event.locals.user = null;
// 	}

// 	const response = await resolve(event);

// 	// Sync cookie back to browser
// 	response.headers.append('set-cookie', event.locals.pb.authStore.exportToCookie({
// 		httpOnly: true,
// 		secure: false, // set true in production
// 		sameSite: 'lax',
// 		path: '/'
// 	}));

// 	return response;
// }



import PocketBase from 'pocketbase';
import type { Handle } from '@sveltejs/kit';

const PB_URL = 'https://jpi.sophnexacademy.com.ng';

export const handle: Handle = async ({ event, resolve }) => {
    // 1. Initialize PocketBase
    event.locals.pb = new PocketBase(PB_URL);

    // 2. Load cookie data into PocketBase's authStore
    // The name of the cookie must match the one set in api/admin-login/+server.ts
    const pbAuthCookie = event.cookies.get('pb_auth');
    if (pbAuthCookie) {
        event.locals.pb.authStore.loadFromCookie(pbAuthCookie);
    }
    
    // 3. Populate locals.user if authenticated
    if (event.locals.pb.authStore.isValid) {
        try {
            // Get an up-to-date auth store state (optional, but good practice)
            await event.locals.pb.collection('admin_users').authRefresh();
        } catch (_) {
            // authRefresh failed (e.g., token expired) - clear the store
            event.locals.pb.authStore.clear();
        }
    }

    // 4. Set locals.user for use in layout/page loads
    event.locals.user = structuredClone(event.locals.pb.authStore.model);

    // 5. Respond to the request
    const response = await resolve(event);

    // 6. Send back the updated cookie (important for authRefresh or token expiration)
    response.headers.set('set-cookie', event.locals.pb.authStore.exportToCookie());

    return response;
};