import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals, cookies }) => {
    // Clear the auth store on the server
    locals.pb.authStore.clear();
    locals.user = null;

    // Clear the cookie by deleting it
    cookies.delete('pb_auth', { path: '/' });

    return json({ success: true, message: 'Logged out successfully.' });
};