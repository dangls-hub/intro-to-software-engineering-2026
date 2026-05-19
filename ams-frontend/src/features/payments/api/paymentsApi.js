import { apiClient, asArray, unwrapData } from '../../../lib/apiClient';

export async function fetchPayments() {
  return asArray(await apiClient('/payments'));
}

export async function createPayment(payment) {
  return unwrapData(await apiClient('/payments', { method: 'POST', body: payment }));
}

export async function deletePayment(id) {
  return apiClient(`/payments/${id}`, { method: 'DELETE' });
}
