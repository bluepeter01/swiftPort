import { json } from '@sveltejs/kit';
import PocketBase from 'pocketbase';

export const POST = async ({ request, cookies, url }) => {
    try {
        const { email, password } = await request.json();

        const pb = new PocketBase('https://jpi.sophnexacademy.com.ng');
        const authData = await pb.collection('admin_users').authWithPassword(email, password)

        // 💥 FIX: Change sameSite to 'Lax' for local HTTP development.
        // 'SameSite: None' requires 'Secure: true' (HTTPS), which is not met here.
        const cookieString = pb.authStore.exportToCookie({
            httpOnly: true,
            secure: false, // Keep false for local HTTP
            sameSite: 'Lax', // Changed from 'None'
            path: '/'
        });

        const response = json({
            success: true,
            message: 'Admin login successful.'
        });

        // Use response.headers.set for the primary cookie export
        response.headers.set('set-cookie', cookieString);
        return response;

    } catch (err: any) {
        return json(
            {
                error: true,
                message: err?.response?.data?.message || err?.message || 'Invalid email or password'
            },
            { status: 401 }
        );
    }
};
