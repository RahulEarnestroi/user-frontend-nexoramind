const API_URL = import.meta.env.VITE_API_URL;

function getToken() {
  return localStorage.getItem('nexoramind_token');
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'X-JWT-Token': token }),
    ...options.headers,
  };

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || data.detail || data.error || 'Request failed');
  }

  return data;
}

export const api = {
  login: (email, password) =>
    request('/nm/account/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (email, fullName, password) =>
    request('/nm/account/register', {
      method: 'POST',
      body: JSON.stringify({ email, full_name: fullName, password }),
    }),

  me: () => request('/nm/account/me'),
};
