// const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:5000/api';
const BACKEND_API_URL = process.env.BACKEND_API_URL || 'https://backend-sdzh.onrender.com/api';

export async function backendRequest(path, options = {}) {
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const response = await fetch(`${BACKEND_API_URL}${path}`, {
    ...options,
    headers: {
      ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {}),
    },
    cache: 'no-store',
  });

  const data = await response.json().catch(() => ({}));
  return { response, data };
}

export function authHeadersFromToken(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}
