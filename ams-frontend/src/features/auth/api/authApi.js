import { apiClient, unwrapData } from '../../../lib/apiClient';

export async function login(credentials) {
  const payload = await apiClient('/auth/login', {
    method: 'POST',
    body: credentials,
    token: null,
  });

  return unwrapData(payload);
}

export async function register(data) {
  const payload = await apiClient('/auth/register', {
    method: 'POST',
    body: data,
    token: null,
  });

  return unwrapData(payload);
}

export async function forgotPassword(email) {
  const payload = await apiClient('/auth/forgot-password', {
    method: 'POST',
    body: { email },
    token: null,
  });

  return unwrapData(payload);
}

export async function resetPassword(token, newPassword) {
  const payload = await apiClient('/auth/reset-password', {
    method: 'POST',
    body: { token, newPassword },
    token: null,
  });

  return unwrapData(payload);
}

export async function changePassword(currentPassword, newPassword) {
  const payload = await apiClient('/auth/change-password', {
    method: 'POST',
    body: { currentPassword, newPassword },
  });

  return unwrapData(payload);
}

export async function fetchMe() {
  const payload = await apiClient('/auth/me');
  return unwrapData(payload);
}
