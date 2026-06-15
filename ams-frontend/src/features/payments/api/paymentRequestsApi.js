import { apiClient, asArray, unwrapData } from '../../../lib/apiClient';

/**
 * Cư dân gửi yêu cầu thanh toán kèm ảnh biên lai.
 * @param {FormData} formData — feeId, amount, paymentMethod, note, proofImage
 */
export async function submitPaymentRequest(formData) {
  return unwrapData(
    await apiClient('/payment-requests', {
      method: 'POST',
      body: formData, // apiClient detects FormData and skips JSON stringify
    }),
  );
}

/** Admin/Staff — lấy tất cả payment requests (có thể filter theo ?status=PENDING) */
export async function fetchPaymentRequests(status) {
  const query = status ? `?status=${encodeURIComponent(status)}` : '';
  return asArray(await apiClient(`/payment-requests${query}`));
}

/** Cư dân — lấy payment requests của mình */
export async function fetchMyPaymentRequests() {
  return asArray(await apiClient('/payment-requests/my-requests'));
}

/** Lấy requests theo căn hộ */
export async function fetchPaymentRequestsByApartment(apartmentId) {
  return asArray(await apiClient(`/payment-requests/by-apartment/${apartmentId}`));
}

/** Đếm số pending requests */
export async function fetchPendingRequestCount() {
  const res = await apiClient('/payment-requests/pending/count');
  const data = unwrapData(res);
  return data?.count ?? 0;
}

/** Admin duyệt payment request */
export async function approvePaymentRequest(id, reviewNote) {
  return unwrapData(
    await apiClient(`/payment-requests/${id}/approve`, {
      method: 'PUT',
      body: { reviewNote: reviewNote || null },
    }),
  );
}

/** Admin từ chối payment request */
export async function rejectPaymentRequest(id, reviewNote) {
  return unwrapData(
    await apiClient(`/payment-requests/${id}/reject`, {
      method: 'PUT',
      body: { reviewNote: reviewNote || null },
    }),
  );
}
