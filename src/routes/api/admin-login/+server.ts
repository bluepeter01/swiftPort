import PocketBase from 'pocketbase';
import { json } from '@sveltejs/kit';

export const POST = async ({ request, cookies }) => {
  const { email, password } = await request.json();
  const pb = new PocketBase('https://jpi.sophnexacademy.com.ng');

  try {
    const authData = await pb.collection('admin_users').authWithPassword(email, password);

    // Save auth in cookie
    const cookie = pb.authStore.exportToCookie({
      httpOnly: false, // ✅ allow frontend scripts to read it (optional)
      path: '/',
      sameSite: 'lax',
      secure: false, // change to true in production with HTTPS
      maxAge: 60 * 60 * 24 * 7
    });

cookies.set('pb_auth', pb.authStore.exportToCookie(), {
  path: '/',
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production', // ✅ only secure in production
  maxAge: 60 * 60 * 24 * 7
});


    return json({ success: true });
  } catch (err) {
    console.error('Admin login failed:', err);
    return json({ success: false, error: 'Invalid email or password' }, { status: 401 });
  }
};
