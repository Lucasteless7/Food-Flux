const API_BASE = '/api';

export async function request(endpoint, options = {}) {
  const userStr = localStorage.getItem('foodflux_user');
  let userId = null;
  if (userStr) {
    try {
      const u = JSON.parse(userStr);
      userId = u.id;
    } catch (e) {}
  }

  const headers = {
    'Content-Type': 'application/json',
    ...(userId ? { 'x-user-id': userId } : {}),
    ...options.headers,
  };

  let response;
  try {
    response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (err) {
    throw new Error('Não foi possível conectar ao servidor de API do Food Flux.');
  }

  let data = {};
  try {
    data = await response.json();
  } catch (e) {
    // Caso a resposta não seja um JSON válido
  }

  if (!response.ok) {
    throw new Error(data.error || `Erro de comunicação com o servidor (${response.status}).`);
  }

  return data;
}

export const authApi = {
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  getMe: () => request('/auth/me'),
};

export const dashboardApi = {
  getGestorDashboard: () => request('/dashboard/gestor'),
  getAtendenteDashboard: () => request('/dashboard/atendente'),
};

export const salesApi = {
  createSale: (saleData) => request('/vendas', { method: 'POST', body: JSON.stringify(saleData) }),
};

export const pratosApi = {
  getPratos: () => request('/pratos'),
  createPrato: (data) => request('/pratos', { method: 'POST', body: JSON.stringify(data) }),
};

export const ingredientesApi = {
  getIngredientes: () => request('/ingredientes'),
};
