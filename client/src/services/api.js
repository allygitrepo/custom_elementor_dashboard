// client/src/services/api.js

/**
 * Resolves the dynamic backend API URL with 100% path-independence
 */
export function getApiBaseUrl() {
  if (import.meta.env.VITE_API_BASE) {
    return import.meta.env.VITE_API_BASE.replace(/\/$/, '');
  }

  // If in dev mode on vite port (5173), point to local XAMPP backend
  if (window.location.port === '5173') {
    return 'http://localhost/Elementor_Dashboard/server/index.php';
  }

  // In production: dynamically resolve root path, stripping index.html, /admin, and /download subpaths
  let currentPath = window.location.pathname.replace(/\/index\.html$/i, '').replace(/\/+$/, '');
  currentPath = currentPath.replace(/\/(admin|download)(\/.*)?$/i, '');

  return `${window.location.origin}${currentPath}/server/index.php`;
}

export const api = {
  async request(route, options = {}) {
    const baseUrl = getApiBaseUrl();
    
    // Split route and query parameters cleanly
    let path = route;
    let queryParams = '';

    if (route.includes('?')) {
      const [cleanPath, queryString] = route.split('?');
      path = cleanPath;
      queryParams = '&' + queryString;
    }

    const url = `${baseUrl}?route=${encodeURIComponent(path)}${queryParams}`;

    const token = localStorage.getItem('elem_admin_token');
    const headers = {
      ...(options.headers || {}),
    };

    if (token && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    try {
      const res = await fetch(url, {
        ...options,
        headers,
      });

      const data = await res.json().catch(() => ({ success: false, error: 'Invalid JSON response from server' }));

      if (res.status === 401) {
        localStorage.removeItem('elem_admin_token');
        localStorage.removeItem('elem_admin_user');
        if (window.location.hash.startsWith('#/admin') && !window.location.hash.includes('login')) {
          window.location.hash = '#/admin/login';
        }
      }

      return data;
    } catch (err) {
      console.error('API Request Error:', err);
      return { success: false, error: err.message || 'Network connection failed' };
    }
  },

  get(route) {
    return this.request(route, { method: 'GET' });
  },

  post(route, data = {}) {
    return this.request(route, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  upload(route, formData) {
    return this.request(route, {
      method: 'POST',
      body: formData,
    });
  },
};
