/**
 * Vehicle feature constants — single source of truth shared by the form,
 * the table, and the dynamic fee preview.
 */

/** Loại xe — khớp với enum VehicleType ở backend. */
export const VEHICLE_TYPES = [
  { value: 'CAR',           label: 'Ô tô' },
  { value: 'MOTORBIKE',     label: 'Xe máy' },
  { value: 'ELECTRIC_BIKE', label: 'Xe đạp điện' },
  { value: 'BICYCLE',       label: 'Xe đạp' },
  { value: 'TRUCK',         label: 'Xe tải' },
  { value: 'HELICOPTER',    label: 'Trực thăng'},
  { value: 'PLANE',         label: 'Máy bay'},
  { value: 'TANK',          label: 'Xe tăng'},
  { value: 'SHIP',         label: 'Tàu' },
  { value: 'OTHER',         label: 'Khác' },
];

const VEHICLE_TYPE_LABELS = Object.fromEntries(
  VEHICLE_TYPES.map((t) => [t.value, t.label]),
);

/** Trả về nhãn tiếng Việt cho một loại xe (fallback về chính giá trị gốc). */
export function vehicleTypeLabel(value) {
  return VEHICLE_TYPE_LABELS[value] || value || '—';
}

/**
 * Quy tắc phí đỗ xe hàng tháng (đồng bộ với VehicleServiceImpl.calculateMonthlyFee).
 * - Xe thứ 1 & 2 của căn hộ: 100.000đ/tháng
 * - Xe thứ 3 trở đi:          120.000đ/tháng
 * Phí tính trọn tháng bất kể ngày đăng ký trong tháng.
 */
export const STANDARD_FEE = 100_000;
export const SURCHARGE_FEE = 120_000;
export const STANDARD_THRESHOLD = 2; // số xe được hưởng phí tiêu chuẩn

/**
 * Tính phí dự kiến cho xe MỚI dựa trên số xe đang hoạt động hiện có của căn hộ.
 * @param {number} activeCount số xe đang hoạt động hiện tại của căn hộ
 * @returns {number} phí hàng tháng (VND)
 */
export function previewMonthlyFee(activeCount) {
  return activeCount < STANDARD_THRESHOLD ? STANDARD_FEE : SURCHARGE_FEE;
}

/** Định dạng tiền tệ VND theo chuẩn dự án: "100.000 đ". */
export function formatVnd(amount) {
  return amount != null ? `${Number(amount).toLocaleString('vi-VN')} đ` : '—';
}
