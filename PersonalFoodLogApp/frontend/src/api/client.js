import { API_URL } from '../config/apiConfig';

let authToken = null;
let onUnauthorized = null;

export const setAuthToken = (token) => { authToken = token; };
/** Called when the server rejects the saved login (expired or revoked). */
export const setUnauthorizedHandler = (handler) => { onUnauthorized = handler; };

export class ApiError extends Error {
    constructor(message, status) {
        super(message);
        this.status = status;
    }
}

/** JSON request to the backend. Throws ApiError with the server's message on failure. */
export async function apiRequest(path, { method = 'GET', body, query } = {}) {
    const qs = query
        ? `?${Object.entries(query).filter(([, v]) => v != null).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&')}`
        : '';
    const headers = { Accept: 'application/json' };
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    if (authToken) headers.Authorization = `Bearer ${authToken}`;

    let response;
    try {
        response = await fetch(`${API_URL}${path}${qs}`, {
            method,
            headers,
            body: body === undefined ? undefined : JSON.stringify(body),
        });
    } catch {
        throw new ApiError(`Can't reach the server (${API_URL}). Check your connection.`, 0);
    }

    if (response.status === 204) return null;
    const data = await response.json().catch(() => null);
    if (!response.ok) {
        if (response.status === 401 && authToken && onUnauthorized) onUnauthorized();
        throw new ApiError(data?.message || `Request failed (${response.status})`, response.status);
    }
    return data;
}

export const api = {
    get: (path, query) => apiRequest(path, { query }),
    post: (path, body) => apiRequest(path, { method: 'POST', body }),
    put: (path, body) => apiRequest(path, { method: 'PUT', body }),
    patch: (path, body) => apiRequest(path, { method: 'PATCH', body }),
    delete: (path) => apiRequest(path, { method: 'DELETE' }),
};
