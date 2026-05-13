import { apiClient, asArray, unwrapData } from '../../../lib/apiClient';

export async function fetchResidents() {
  return asArray(await apiClient('/residents'));
}

export async function createResident(resident) {
  return unwrapData(
    await apiClient('/residents', {
      method: 'POST',
      body: resident,
    }),
  );
}

export async function updateResident(id, resident) {
  return unwrapData(
    await apiClient(`/residents/${id}`, {
      method: 'PUT',
      body: resident,
    }),
  );
}

export async function deleteResident(id) {
  return apiClient(`/residents/${id}`, {
    method: 'DELETE',
  });
}
