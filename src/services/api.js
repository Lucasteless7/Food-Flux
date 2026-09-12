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
    if (data && data.error) {
      throw new Error(data.error);
    }
    if (response.status === 404 || response.status === 500 || response.status === 502 || response.status === 504) {
      throw new Error(`Erro de comunicação com o servidor (${response.status}). Verifique se o servidor backend (npm run dev) está rodando na porta 3001.`);
    }
    throw new Error(`Erro de comunicação com o servidor (${response.status}).`);
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
  updatePrato: (id, data) => request(`/pratos/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
};

export const ingredientesApi = {
  getIngredientes: () => request('/ingredientes'),
};

export const clienteApi = {
  getMeusPedidos: () => request('/cliente/pedidos'),
  avaliarPrato: (data) => request('/cliente/avaliar', { method: 'POST', body: JSON.stringify(data) }),
};
