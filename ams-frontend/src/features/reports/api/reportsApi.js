import { apiClient, asArray, unwrapData } from '../../../lib/apiClient';

export async function fetchMyReports() {
  return asArray(await apiClient('/reports/my'));
}

export async function fetchReports(status) {
  const query = status ? `?status=${status}` : '';
  return asArray(await apiClient(`/reports${query}`));
}

export async function submitReport(report) {
  return unwrapData(await apiClient('/reports', { method: 'POST', body: report }));
}

export async function reviewReport(id, review) {
  return unwrapData(await apiClient(`/reports/${id}/review`, { method: 'PUT', body: review }));
}
