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

/** Extract an array from a response that could be [], { key: [] }, or nested. */
function extractList(data, ...keys) {
  if (Array.isArray(data)) return data;
  for (const k of keys) {
    if (Array.isArray(data?.[k])) return data[k];
  }
  // Last resort: find first array value
  if (data && typeof data === 'object') {
    for (const v of Object.values(data)) {
      if (Array.isArray(v)) return v;
    }
  }
  return [];
}

export { extractList };

export const api = {
  // ─── Auth ─────────────────────────────────────────
  login: (email, password) =>
    request('/nm/account/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (email, fullName, password,type) =>
    request('/nm/account/register', {
      method: 'POST',
      body: JSON.stringify({ email, full_name: fullName, password,type }),
    }),

  me: () => request('/nm/account/me'),

  // ─── Internship ───────────────────────────────────
  getRoles: () => request('/nm/internship/roles'),

  getTasks: (roleId, duration) =>
    request(`/nm/internship/tasks?RoleID=${encodeURIComponent(roleId)}&Duration=${encodeURIComponent(duration)}`),

  enroll: (roleId, duration) =>
    request('/nm/internship/enroll', {
      method: 'POST',
      body: JSON.stringify({ RoleID: roleId, Duration: duration }),
    }),

  submitTask: (githubLink, roleId, duration, taskNumber) =>
    request('/nm/internship/submit-task', {
      method: 'POST',
      body: JSON.stringify({ GitHubLink: githubLink, RoleID: roleId, Duration: duration, TaskNumber: taskNumber }),
    }),

  // ─── Certificates ─────────────────────────────────
  getCertificate: (roleId, duration) =>
    request(`/nm/internship/certificate?RoleID=${encodeURIComponent(roleId)}&Duration=${encodeURIComponent(duration)}`),

  listCertificates: () => request('/nm/internship/certificates'),

  // ─── Offer Letters ────────────────────────────────
  getOfferLetter: (roleId, duration) =>
    request(`/nm/internship/offer-letter?RoleID=${encodeURIComponent(roleId)}&Duration=${encodeURIComponent(duration)}`),

  listOfferLetters: () => request('/nm/internship/offer-letters'),
};
