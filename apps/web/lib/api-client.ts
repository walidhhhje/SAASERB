// Local type definitions to avoid workspace dependencies
interface AuthResponse {
  user: { id: string; email: string; full_name: string };
  token: string;
  tenant_id?: string;
}

interface SchemaModule {
  id: string;
  name: string;
  table_name: string;
}

interface Report {
  id: string;
  name: string;
  description?: string;
}

interface Integration {
  id: string;
  integration_type: string;
  config: Record<string, any>;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

let authToken: string | null = null;

export function setAuthToken(token: string) {
  authToken = token;
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token);
  }
}

export function getAuthToken(): string | null {
  if (authToken) return authToken;
  if (typeof window !== 'undefined') {
    authToken = localStorage.getItem('auth_token');
  }
  return authToken;
}

export function clearAuthToken() {
  authToken = null;
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
  }
}

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
}

async function apiFetch<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { skipAuth = false, headers = {}, ...rest } = options;

  const finalHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (!skipAuth) {
    const token = getAuthToken();
    if (token) {
      finalHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...rest,
    headers: finalHeaders,
  });

  if (!response.ok) {
    if (response.status === 401) {
      clearAuthToken();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `API error: ${response.statusText}`);
  }

  return response.json();
}

// Auth APIs
export const authAPI = {
  register: (data: { email: string; password: string; fullName: string; tenantName: string }) =>
    apiFetch<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
      skipAuth: true,
    }),

  login: (data: { email: string; password: string }) =>
    apiFetch<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
      skipAuth: true,
    }),

  getMe: () => apiFetch('/auth/me', { method: 'GET' }),
};

// Schema Builder APIs
export const schemaAPI = {
  getModules: () => apiFetch<{ data: SchemaModule[] }>('/schema/modules'),

  getModule: (id: string) => apiFetch<{ data: SchemaModule }>(`/schema/modules/${id}`),

  createModule: (data: any) =>
    apiFetch('/schema/modules', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateModule: (id: string, data: any) =>
    apiFetch(`/schema/modules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteModule: (id: string) =>
    apiFetch(`/schema/modules/${id}`, {
      method: 'DELETE',
    }),
};

// Reports APIs
export const reportAPI = {
  getReports: () => apiFetch<{ data: Report[] }>('/reports'),

  getReport: (id: string) => apiFetch<{ data: Report }>(`/reports/${id}`),

  createReport: (data: any) =>
    apiFetch('/reports', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateReport: (id: string, data: any) =>
    apiFetch(`/reports/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteReport: (id: string) =>
    apiFetch(`/reports/${id}`, {
      method: 'DELETE',
    }),

  executeReport: (id: string) =>
    apiFetch(`/reports/${id}/execute`, {
      method: 'POST',
    }),
};

// Integrations APIs
export const integrationAPI = {
  getIntegrations: () => apiFetch<{ data: Integration[] }>('/integrations'),

  getIntegration: (type: string) =>
    apiFetch<{ data: Integration }>(`/integrations/${type}`),

  createIntegration: (type: string, config: Record<string, any>) =>
    apiFetch(`/integrations/${type}`, {
      method: 'POST',
      body: JSON.stringify({ config }),
    }),

  updateIntegration: (type: string, config: Record<string, any>) =>
    apiFetch(`/integrations/${type}`, {
      method: 'POST',
      body: JSON.stringify({ config }),
    }),

  deleteIntegration: (type: string) =>
    apiFetch(`/integrations/${type}`, {
      method: 'DELETE',
    }),

  syncNotion: () =>
    apiFetch('/integrations/notion/sync', {
      method: 'POST',
    }),

  getFreshdeskTickets: () =>
    apiFetch('/integrations/freshdesk/tickets', {
      method: 'GET',
    }),
};

// Audit APIs
export const auditAPI = {
  getLogs: (params?: Record<string, any>) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query.append(key, String(value));
        }
      });
    }
    return apiFetch(`/audit?${query}`, { method: 'GET' });
  },

  getLog: (id: string) => apiFetch(`/audit/${id}`, { method: 'GET' }),
};
