/**
 * INGOT API Client
 * Replaces Supabase client for PHP/MySQL backend
 */

const API_BASE = '/api';

interface ApiResponse<T = any> {
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
  
  const defaultOptions: RequestInit = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, { ...defaultOptions, ...options });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      fetchApi('/auth.php?action=login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),

    register: (email: string, password: string, display_name: string) =>
      fetchApi('/auth.php?action=register', {
        method: 'POST',
        body: JSON.stringify({ email, password, display_name }),
      }),

    logout: () =>
      fetchApi('/auth.php?action=logout', { method: 'POST' }),

    session: () =>
      fetchApi('/auth.php?action=session'),
  },

  activities: {
    list: (params?: { completed?: boolean; limit?: number; offset?: number }) => {
      const query = new URLSearchParams();
      if (params?.completed !== undefined) query.set('completed', String(params.completed));
      if (params?.limit) query.set('limit', String(params.limit));
      if (params?.offset) query.set('offset', String(params.offset));
      return fetchApi(`/activities.php?${query}`);
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
      return fetchApi(`/organizations.php?${query}`);
    },

    get: (orgSiteId: string) =>
      fetchApi(`/organizations.php?id=${encodeURIComponent(orgSiteId)}`),

    search: (query: string) =>
      fetchApi(`/organizations.php?search=${encodeURIComponent(query)}`),

    import: (organizations: any[]) =>
      fetchApi('/organizations.php?action=import', {
        method: 'POST',
        body: JSON.stringify({ organizations }),
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
};

export default api;
