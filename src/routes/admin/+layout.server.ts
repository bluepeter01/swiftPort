import PocketBase from 'pocketbase';
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies, url }) => {
  const pb = new PocketBase('https://jpi.sophnexacademy.com.ng');
  const token = cookies.get('pb_auth');
  const pathname = url.pathname;
  const isLoginPage = pathname === '/login';
  const isAdminPage = pathname.startsWith('/admin');

  let isAdmin = false;

  if (token) {
    pb.authStore.loadFromCookie(`pb_auth=${token}`);
    isAdmin = pb.authStore.isValid && pb.authStore.model?.collectionName === 'admin_users';
  }

  if (isAdmin && isLoginPage) throw redirect(303, '/admin');
  if (!isAdmin && isAdminPage && !isLoginPage) throw redirect(302, '/login');

  return { admin: isAdmin ? pb.authStore.model : null };
};
