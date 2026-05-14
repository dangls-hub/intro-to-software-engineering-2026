const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api/v1';
const AUTH_STORAGE_KEY = 'bluemoon_auth_token';

export class ApiError extends Error {
  constructor(message, status, payload) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

export function getAuthToken() {
  return localStorage.getItem(AUTH_STORAGE_KEY);
}

export function setAuthToken(token) {
  localStorage.setItem(AUTH_STORAGE_KEY, token);
}

export function clearAuthToken() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function unwrapData(payload) {
  if (payload && typeof payload === 'object' && Object.hasOwn(payload, 'data')) {
    return payload.data;
  }

  return payload;
}

export function asArray(payload) {
  const data = unwrapData(payload);

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.content)) {
    return data.content;
  }

  if (Array.isArray(data?.items)) {
    return data.items;
  }

  return [];
}

export async function apiClient(path, options = {}) {
  const { body, headers, token = getAuthToken(), ...requestOptions } = options;
  const requestHeaders = {
    Accept: 'application/json',
    ...headers,
  };

  let requestBody = body;
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;

  if (body !== undefined && body !== null && !isFormData && typeof body !== 'string') {
    requestBody = JSON.stringify(body);
    requestHeaders['Content-Type'] = 'application/json';
  }

  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...requestOptions,
    headers: requestHeaders,
    body: requestBody,
  });

  if (response.status === 204) {
    return null;
  }

  const responseText = await response.text();
  const contentType = response.headers.get('content-type') ?? '';
  let payload = responseText;

  if (responseText && contentType.includes('application/json')) {
    try {
      payload = JSON.parse(responseText);
    } catch {
      payload = responseText;
    }
  }

  if (!response.ok) {
    const message =
      payload?.message ||
      payload?.error ||
      response.statusText ||
      `API request failed with status ${response.status}`;

    throw new ApiError(message, response.status, payload);
  }

  return payload;
}
