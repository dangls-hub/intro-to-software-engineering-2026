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

// --- Approval workflow API ---

export async function fetchPendingResidents() {
  return asArray(await apiClient('/residents/pending'));
}

export async function fetchPendingCount() {
  const res = await apiClient('/residents/pending/count');
  return unwrapData(res);
}

export async function approveResident(id) {
  return unwrapData(
    await apiClient(`/residents/${id}/approve`, {
      method: 'POST',
      body: { action: 'APPROVE' },
    }),
  );
}

export async function rejectResident(id, rejectReason) {
  return unwrapData(
    await apiClient(`/residents/${id}/approve`, {
      method: 'POST',
      body: { action: 'REJECT', rejectReason },
    }),
  );
}

