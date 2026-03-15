const API_BASE = 'https://headless.tebex.io/api';
const TOKEN = import.meta.env.VITE_TEBEX_PUBLIC_TOKEN;

export async function getWebstore() {
  const res = await fetch(`${API_BASE}/accounts/${TOKEN}`);
  if (!res.ok) throw new Error('Failed to fetch webstore');
  const json = await res.json();
  return json.data;
}

export async function getCategories(includePackages = true) {
  const url = `${API_BASE}/accounts/${TOKEN}/categories${includePackages ? '?includePackages=1' : ''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch categories');
  const json = await res.json();
  return json.data || [];
}

export async function getCategory(id) {
  const res = await fetch(`${API_BASE}/accounts/${TOKEN}/categories/${id}?includePackages=1`);
  if (!res.ok) throw new Error('Failed to fetch category');
  const json = await res.json();
  const data = json.data;
  if (!data) return null;
  return Array.isArray(data) ? data[0] : data;
}

export async function getPackages() {
  const res = await fetch(`${API_BASE}/accounts/${TOKEN}/packages`);
  if (!res.ok) throw new Error('Failed to fetch packages');
  const json = await res.json();
  return json.data || [];
}

export async function getSidebar() {
  const res = await fetch(`${API_BASE}/accounts/${TOKEN}/sidebar`);
  if (!res.ok) throw new Error('Failed to fetch sidebar');
  const json = await res.json();
  return json.data || [];
}

export function getRecentPayments(sidebar) {
  const module = sidebar?.find(m => m.type === 'recent_payments');
  return module?.data?.payments || [];
}
