import { getToken } from '../utils/storage';
//const API_URL = 'https://api.mogym.ir';
const API_URL = 'https://localhost:7088';
export async function apiFetch(path, opts = {}) {
  const token = await getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(opts.headers || {}),
  };
  const res = await fetch(`${API_URL}${path}`, { ...opts, headers });
  const text = await res.text();
  if (!res.ok)
     throw new Error(text || 'Request failed');
  try { 
    return JSON.parse(text); 
} catch { 
    return text;
 }
}
