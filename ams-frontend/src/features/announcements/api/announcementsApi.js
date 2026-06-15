import { apiClient, asArray, unwrapData } from '../../../lib/apiClient';

export async function fetchAnnouncements() {
  return asArray(await apiClient('/announcements'));
}

export async function fetchAnnouncementById(id) {
  return unwrapData(await apiClient(`/announcements/${id}`));
}

export async function createAnnouncement(data) {
  return unwrapData(await apiClient('/announcements', { method: 'POST', body: data }));
}

export async function updateAnnouncement(id, data) {
  return unwrapData(await apiClient(`/announcements/${id}`, { method: 'PUT', body: data }));
}

export async function deleteAnnouncement(id) {
  return unwrapData(await apiClient(`/announcements/${id}`, { method: 'DELETE' }));
}
