import { apiClient, asArray, unwrapData } from '../../../lib/apiClient';

export async function fetchApartments() {
  return asArray(await apiClient('/apartments?size=1000'));
}

export async function createApartment(apartment) {
  return unwrapData(
    await apiClient('/apartments', {
      method: 'POST',
      body: apartment,
    }),
  );
}

export async function updateApartment(id, apartment) {
  return unwrapData(
    await apiClient(`/apartments/${id}`, {
      method: 'PUT',
      body: apartment,
    }),
  );
}

export async function deleteApartment(id) {
  return apiClient(`/apartments/${id}`, {
    method: 'DELETE',
  });
}
