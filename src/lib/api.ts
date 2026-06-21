/**
 * INGOT API Client
 * Replaces Supabase client for PHP/MySQL backend
 */

const API_BASE = '/api';

interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE}${endpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>,
  };

  const csrfToken = getCsrfToken();
  if (csrfToken && options.method && options.method !== 'GET') {
    headers['X-CSRF-Token'] = csrfToken;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(url, {
      credentials: 'include',
      headers,
      signal: controller.signal,
      ...options,
    });

    clearTimeout(timeoutId);

    // Store CSRF token from response header if present
    const csrfHeader = response.headers.get('X-CSRF-Token');
    if (csrfHeader) {
      setCsrfToken(csrfHeader);
    }

    if (!response.ok) {
      let errorMessage = `Request failed with status ${response.status}`;
      try {
        const errorBody = await response.json();
        errorMessage = errorBody.error || errorBody.message || errorMessage;
      } catch {
      }
      return { success: false, error: errorMessage };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof DOMException && error.name === 'AbortError') {
      return { success: false, error: 'Request timed out' };
    }
    return {
      success: false,
      error: 'Network error. Please check your connection.',
    };
  }
}

function getCsrfToken(): string | null {
  try {
    return sessionStorage.getItem('csrf_token');
  } catch {
    return null;
  }
}

export function setCsrfToken(token: string): void {
  try {
    sessionStorage.setItem('csrf_token', token);
  } catch {
  }
}

export const api = {
  auth: {
    login: (username: string, password: string) =>
      fetchApi('/auth.php?action=login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      }),

    register: (email: string, password: string, display_name: string) =>
      fetchApi('/auth.php?action=register', {
        method: 'POST',
        body: JSON.stringify({ email, password, display_name }),
      }),

    logout: () =>
      fetchApi('/auth.php?action=logout', { method: 'POST' }),

    session: () =>
      fetchApi<{ user: any; profile: any; roles: string[]; mustChangePassword?: boolean }>('/auth.php?action=session'),

    changePassword: (currentPassword: string, newPassword: string) =>
      fetchApi('/auth.php?action=change_password', {
        method: 'POST',
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
      }),

    requestPasswordReset: (username: string) =>
      fetchApi('/auth.php?action=request_password_reset', {
        method: 'POST',
        body: JSON.stringify({ username }),
      }),
  },

  activities: {
    list: (params?: { completed?: boolean; limit?: number; offset?: number }) => {
      const query = new URLSearchParams();
      if (params?.completed !== undefined) query.set('completed', String(params.completed));
      if (params?.limit) query.set('limit', String(params.limit));
      if (params?.offset) query.set('offset', String(params.offset));
      return fetchApi<any[]>(`/activities.php?${query}`);
    },

    get: (id: number) =>
      fetchApi(`/activities.php?id=${id}`),

    create: (data: any) =>
      fetchApi('/activities.php', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    update: (id: number, data: any) =>
      fetchApi(`/activities.php?id=${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    delete: (id: number) =>
      fetchApi(`/activities.php?id=${id}`, { method: 'DELETE' }),

    complete: (id: number) =>
      fetchApi(`/activities.php?action=complete&id=${id}`, { method: 'POST' }),

    search: (query: string) =>
      fetchApi(`/activities.php?action=search&q=${encodeURIComponent(query)}`),
  },

  deadlines: {
    list: (params?: { status?: string }) => {
      const query = params?.status ? `?status=${params.status}` : '';
      return fetchApi(`/deadlines.php${query}`);
    },

    getForActivity: (activityId: number) =>
      fetchApi(`/deadlines.php?activity=${activityId}`),

    update: (id: number, data: { status: string }) =>
      fetchApi(`/deadlines.php?id=${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  },

  profiles: {
    get: () => fetchApi('/profiles.php'),

    update: (data: { display_name?: string }) =>
      fetchApi('/profiles.php', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  },

  organizations: {
    list: (params?: { limit?: number; offset?: number }) => {
      const query = new URLSearchParams();
      if (params?.limit) query.set('limit', String(params.limit));
      if (params?.offset) query.set('offset', String(params.offset));
      return fetchApi<{ organizations: any[]; total: number }>(`/organizations.php?${query}`);
    },

    get: (orgSiteId: string) =>
      fetchApi<{ organization: any }>(`/organizations.php?id=${encodeURIComponent(orgSiteId)}`),

    search: (query: string) =>
      fetchApi<{ organizations: any[]; count: number }>(`/organizations.php?search=${encodeURIComponent(query)}`),

    count: () =>
      fetchApi<{ total: number }>('/organizations.php?action=count'),

    importBatch: (records: Array<{ org_site_id: string; organization_name: string; address: string; phone_number: string }>) =>
      fetchApi<{ imported: number; skipped: number }>('/organizations.php?action=import', {
        method: 'POST',
        body: JSON.stringify({ organizations: records }),
      }),
  },

  cso: {
    getByOrgSite: (orgSiteId: string) =>
      fetchApi<{ contacts: any[]; count: number }>(`/cso.php?org_site_id=${encodeURIComponent(orgSiteId)}`),

    search: (query: string) =>
      fetchApi<{ contacts: any[]; count: number }>(`/cso.php?search=${encodeURIComponent(query)}`),

    count: () =>
      fetchApi<{ total: number; by_role: Record<string, number> }>('/cso.php?action=count'),

    importBatch: (contacts: Array<{ org_site_id: string; role: string; full_name: string; email?: string; acso_index?: number }>) =>
      fetchApi<{ imported: number; skipped: number }>('/cso.php?action=import', {
        method: 'POST',
        body: JSON.stringify({ contacts }),
      }),
  },

  roles: {
    list: () => fetchApi('/roles.php'),

    getUserRoles: (userId: number) =>
      fetchApi(`/roles.php?user=${userId}`),

    assign: (userId: number, role: string) =>
      fetchApi('/roles.php', {
        method: 'POST',
        body: JSON.stringify({ user_id: userId, role }),
      }),

    remove: (userId: number, role: string) =>
      fetchApi(`/roles.php?user=${userId}&role=${role}`, { method: 'DELETE' }),
  },

  users: {
    list: () => fetchApi<{ users: any[] }>('/users.php'),

    get: (userId: number) =>
      fetchApi<{ user: any }>(`/users.php?id=${userId}`),

    create: (data: { email: string; password: string; display_name?: string; role?: string }) =>
      fetchApi<{ user: any }>('/users.php', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    update: (userId: number, data: { email?: string; display_name?: string; role?: string }) =>
      fetchApi<{ user: any }>(`/users.php?id=${userId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    delete: (userId: number) =>
      fetchApi(`/users.php?id=${userId}`, { method: 'DELETE' }),

    resetPassword: (userId: number, newPassword: string) =>
      fetchApi(`/users.php?action=reset_password&id=${userId}`, {
        method: 'POST',
        body: JSON.stringify({ new_password: newPassword }),
      }),
  },

  passwordResets: {
    list: (status: string = 'pending') =>
      fetchApi<{ requests: any[]; counts: Record<string, number> }>(`/password-resets.php?status=${status}`),

    approve: (requestId: number) =>
      fetchApi<{ request_id: number; user_id: number; username: string; display_name: string }>(`/password-resets.php?action=approve&id=${requestId}`, {
        method: 'POST',
      }),

    reject: (requestId: number) =>
      fetchApi(`/password-resets.php?action=reject&id=${requestId}`, {
        method: 'POST',
      }),
  },
};

export default api;
