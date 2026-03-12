import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const TOKEN_COOKIE = 'auth_token';
const ROLE_COOKIE = 'auth_role';

export function requireAuth(nextPath) {
  const token = cookies().get(TOKEN_COOKIE)?.value;
  if (!token) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }
}

export function requireAdmin(nextPath = '/admin') {
  const store = cookies();
  const token = store.get(TOKEN_COOKIE)?.value;
  const role = store.get(ROLE_COOKIE)?.value;

  if (!token) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }

  if (role !== 'admin') {
    redirect('/');
  }
}
