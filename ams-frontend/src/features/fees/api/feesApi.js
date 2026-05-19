import { apiClient, asArray, unwrapData } from '../../../lib/apiClient';

export async function fetchFees() {
  return asArray(await apiClient('/fees'));
}

export async function createFee(fee) {
  return unwrapData(await apiClient('/fees', { method: 'POST', body: fee }));
}

export async function updateFee(id, fee) {
  return unwrapData(await apiClient(`/fees/${id}`, { method: 'PUT', body: fee }));
}

export async function deleteFee(id) {
  return apiClient(`/fees/${id}`, { method: 'DELETE' });
}
