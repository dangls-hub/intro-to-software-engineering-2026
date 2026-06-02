import { apiClient, unwrapData } from '../../../lib/apiClient';

/**
 * Fetch dashboard statistics from the backend.
 * Falls back to counting individual resources if the dashboard endpoint is not available.
 */
export async function fetchDashboardStats() {
  try {
    const payload = await apiClient('/dashboard/stats');
    return unwrapData(payload);
  } catch (err) {
    // Nếu backend chưa có /dashboard/stats, trả null để fallback
    if (err.status === 404 || err.status === 403) {
      return null;
    }
    throw err;
  }
}
