import { Car, Info, Plus, X } from 'lucide-react';
import { VEHICLE_TYPES, formatVnd } from '../constants';

const SERIF = { fontFamily: "'Playfair Display', Georgia, serif" };
const GOLD = '#c9a96e';

const BILLING_RULE_HINT =
  'Phí được tính trọn tháng bất kể ngày đăng ký trong tháng. ' +
  'Xe thứ 1 và 2 của căn hộ: 100.000đ/tháng. Xe thứ 3 trở đi: 120.000đ/tháng.';

/**
 * VehicleForm — panel form đăng ký / cập nhật xe.
 * Thuần trình bày: toàn bộ state & handler do VehiclesPage sở hữu và truyền xuống.
 */
function VehicleForm({
  form,
  editingId,
  residents = [],
  apartments = [],
  isSubmitting = false,
  fee = null,
  onFieldChange,
  onSubmit,
  onCancelEdit,
}) {
  return (
    <form
      className="workspace-panel form-grid"
      onSubmit={onSubmit}
      style={editingId ? { borderColor: 'rgba(201,169,110,0.28)' } : undefined}
    >
      <div className="panel-heading">
        <div>
          <p className="eyebrow" style={{ marginBottom: '4px' }}>
            {editingId ? 'Chỉnh sửa' : 'Thêm mới'}
          </p>
          <h2 style={SERIF}>{editingId ? 'Cập nhật thông tin xe' : 'Đăng ký xe mới'}</h2>
        </div>
        {editingId && (
          <button
            className="pm-btn-circle"
            onClick={onCancelEdit}
            title="Hủy chỉnh sửa"
            type="button"
            aria-label="Hủy chỉnh sửa"
          >
            <X size={15} strokeWidth={2.5} />
          </button>
        )}
      </div>

      <label>
        Biển số xe
        <input
          name="licensePlate"
          onChange={onFieldChange}
          required
          type="text"
          value={form.licensePlate}
          placeholder="VD: 30A-123.45"
          style={{ textTransform: 'uppercase' }}
        />
      </label>

      <label>
        Loại xe
        <select name="vehicleType" onChange={onFieldChange} value={form.vehicleType} required>
          {VEHICLE_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </label>

      <label>
        Hãng xe
        <input
          name="brand"
          onChange={onFieldChange}
          type="text"
          value={form.brand}
          placeholder="VD: Honda, Toyota…"
        />
      </label>

      <label>
        Màu sắc
        <input
          name="color"
          onChange={onFieldChange}
          type="text"
          value={form.color}
          placeholder="VD: Đen, Trắng…"
        />
      </label>

      <label>
        Cư dân sở hữu
        <select name="residentId" onChange={onFieldChange} value={form.residentId} required>
          <option value="">— Chọn cư dân —</option>
          {residents.map((r) => (
            <option key={r.id} value={r.id}>
              {r.fullName}{r.phoneNumber ? ` · ${r.phoneNumber}` : ''}
            </option>
          ))}
        </select>
      </label>

      <label>
        Căn hộ
        <select name="apartmentId" onChange={onFieldChange} value={form.apartmentId} required>
          <option value="">— Chọn căn hộ —</option>
          {apartments.map((a) => (
            <option key={a.id} value={a.id}>
              {a.roomNumber}{a.floor != null ? ` · Tầng ${a.floor}` : ''}
            </option>
          ))}
        </select>
      </label>

      {/* ── Dynamic fee preview ─────────────────────── */}
      <FeePreview fee={fee} hasApartment={Boolean(form.apartmentId)} editingId={editingId} />

      <button className="primary-button" disabled={isSubmitting} type="submit">
        <Plus size={17} aria-hidden="true" />
        {isSubmitting ? 'Đang lưu…' : editingId ? 'Lưu thay đổi' : 'Đăng ký xe'}
      </button>
    </form>
  );
}

/**
 * FeePreview — khối hiển thị phí dự kiến, nổi bật bằng tông màu accent.
 * - Tạo mới: tính theo số xe hiện có của căn hộ.
 * - Chỉnh sửa: hiển thị phí đã chốt tại thời điểm đăng ký (backend không tính lại).
 */
function FeePreview({ fee, hasApartment, editingId }) {
  // Chưa chọn căn hộ (chế độ tạo mới) → nhắc người dùng chọn để xem phí.
  if (!hasApartment && !editingId) {
    return (
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '12px 14px', borderRadius: '12px',
          background: 'rgba(201,169,110,0.05)',
          border: '1px dashed rgba(201,169,110,0.25)',
          color: 'var(--text-muted)', fontSize: '0.82rem',
        }}
      >
        <Info size={15} strokeWidth={2} style={{ flexShrink: 0, color: GOLD }} />
        Chọn căn hộ để xem phí đỗ xe dự kiến hàng tháng.
      </div>
    );
  }

  const amountText = fee?.loading ? 'Đang tính…' : formatVnd(fee?.amount);

  return (
    <div
      style={{
        position: 'relative',
        padding: '14px 16px',
        borderRadius: '14px',
        background: 'linear-gradient(135deg, rgba(201,169,110,0.14), rgba(201,169,110,0.05))',
        border: '1px solid rgba(201,169,110,0.3)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
        <span style={{
          fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em',
          textTransform: 'uppercase', color: 'var(--text-secondary)',
        }}>
          {editingId ? 'Phí hàng tháng (đã chốt)' : 'Phí dự kiến hàng tháng'}
        </span>
        <Info
          size={13}
          strokeWidth={2}
          style={{ color: GOLD, cursor: 'help', flexShrink: 0 }}
          title={BILLING_RULE_HINT}
          aria-label={BILLING_RULE_HINT}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
        <span style={{ ...SERIF, fontSize: '1.55rem', fontWeight: 800, color: GOLD, lineHeight: 1 }}>
          {amountText}
        </span>
        {!editingId && fee?.position != null && !fee.loading && (
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            xe thứ {fee.position} của căn hộ
          </span>
        )}
      </div>

      {fee?.error && (
        <p style={{ margin: '8px 0 0', fontSize: '0.76rem', color: 'var(--danger)' }}>
          {fee.error}
        </p>
      )}
    </div>
  );
}

export default VehicleForm;
