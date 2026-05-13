import { apiClient, unwrapData } from '../../../lib/apiClient';

export async function login(credentials) {
  const payload = await apiClient('/auth/login', {
    method: 'POST',
    body: credentials,
    token: null,
  });

  return unwrapData(payload);
}
