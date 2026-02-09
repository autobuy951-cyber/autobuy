// API Helper Module
import apiConfig from './config.js';

/**
 * Perform a fetch request with centralized error handling
 * @param {string} url - The API endpoint URL
 * @param {object} options - Fetch options (method, headers, body, etc.)
 * @returns {Promise<object>} - The parsed response data
 */
export async function apiFetch(url, options = {}) {
  try {
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
    };

    // Add token to Authorization header if available
    const token = localStorage.getItem('token');
    if (token && !url.includes('/login') && !url.includes('/register')) {
      defaultOptions.headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, { ...defaultOptions, ...options });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `API Error: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

/**
 * GET request helper
 */
export function apiGet(endpoint, options = {}) {
  return apiFetch(endpoint, { method: 'GET', ...options });
}

/**
 * POST request helper
 */
export function apiPost(endpoint, body = {}, options = {}) {
  return apiFetch(endpoint, { 
    method: 'POST', 
    body: JSON.stringify(body),
    ...options 
  });
}

/**
 * PUT request helper
 */
export function apiPut(endpoint, body = {}, options = {}) {
  return apiFetch(endpoint, { 
    method: 'PUT', 
    body: JSON.stringify(body),
    ...options 
  });
}

/**
 * DELETE request helper
 */
export function apiDelete(endpoint, options = {}) {
  return apiFetch(endpoint, { method: 'DELETE', ...options });
}

export default {
  apiFetch,
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
  config: apiConfig
};
