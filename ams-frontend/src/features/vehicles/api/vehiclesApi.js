import { apiClient, asArray, unwrapData } from '../../../lib/apiClient';

/**
 * Vehicle Management API
 * Backend: /api/v1/vehicles (ADMIN, STAFF only)
 * The shared apiClient prepends the /api/v1 base URL and attaches the bearer token.
 */

/** Lấy danh sách xe (backend trả về dạng phân trang -> asArray bóc .content). */
export async function fetchVehicles() {
  return asArray(await apiClient('/vehicles'));
}

/** Lấy danh sách xe đang hoạt động theo căn hộ — dùng để tính phí dự kiến. */
export async function fetchVehiclesByApartment(apartmentId) {
  return asArray(await apiClient(`/vehicles/apartment/${apartmentId}`));
}

export async function createVehicle(vehicle) {
  return unwrapData(
    await apiClient('/vehicles', {
      method: 'POST',
      body: vehicle,
    }),
  );
}

export async function updateVehicle(id, vehicle) {
  return unwrapData(
    await apiClient(`/vehicles/${id}`, {
      method: 'PUT',
      body: vehicle,
    }),
  );
}

export async function deleteVehicle(id) {
  return apiClient(`/vehicles/${id}`, {
    method: 'DELETE',
  });
}
