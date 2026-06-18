import { Car, Edit3, Search, Trash2 } from 'lucide-react';
import { formatVnd, vehicleTypeLabel } from '../constants';

const SERIF = { fontFamily: "'Playfair Display', Georgia, serif" };
const GOLD = '#c9a96e';

const COLUMNS = ['Biển số', 'Loại xe', 'Cư dân', 'Căn hộ', 'Phí/tháng', 'Trạng thái', ''];

function SkeletonRows() {
  return [...Array(6)].map((_, i) => (
    <tr key={i}>
      {COLUMNS.map((_, c) => (
        <td key={c}>
          <div
            className="pm-skeleton"
            style={{
              height: c === 5 ? '22px' : '18px',
              width: c === 6 ? '64px' : c === 5 ? '92px' : `${50 + ((i + c) % 4) * 14}px`,
              borderRadius: c === 5 ? '999px' : '6px',
              marginLeft: c === 6 ? 'auto' : 0,
              animationDelay: `${i * 55 + c * 18}ms`,
            }}
          />
        </td>
      ))}
    </tr>
  ));
}

/**
 * VehicleTable — danh sách xe với tìm kiếm, skeleton, empty state và thao tác.
 * Thuần trình bày; dữ liệu đã lọc + handler do VehiclesPage truyền xuống.
 */
function VehicleTable({
  vehicles = [],
  isLoading = false,
  editingId = null,
  search = '',
  onSearchChange,
  onEdit,
  onDelete,
}) {
  return (
    <section className="workspace-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow" style={{ marginBottom: '4px' }}>Danh sách</p>
          <h2 style={SERIF}>Phương tiện</h2>
        </div>
        <span className="count-badge" title={`${vehicles.length} xe`}>
          {isLoading ? '…' : vehicles.length}
        </span>
      </div>

      <div className="toolbar">
        <div style={{ position: 'relative', flex: 1, maxWidth: '420px' }}>
          <Search
            size={15}
            strokeWidth={2}
            style={{
              position: 'absolute', left: '12px', top: '50%',
              transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none',
            }}
          />
          <input
            className="search-input"
            placeholder="Tìm theo biển số, hãng, cư dân, căn hộ…"
            value={search}
            onChange={(e) => onSearchChange?.(e.target.value)}
            style={{ paddingLeft: '36px' }}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>{COLUMNS.map((c, i) => <th key={i} aria-label={c || 'Thao tác'}>{c}</th>)}</tr>
            </thead>
            <tbody><SkeletonRows /></tbody>
          </table>
        </div>
      ) : vehicles.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 24px' }}>
          <Car
            size={48}
            strokeWidth={1}
            style={{ margin: '0 auto 16px', color: 'rgba(201,169,110,0.22)', display: 'block' }}
          />
          <p style={{ ...SERIF, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-secondary)', margin: '0 0 8px' }}>
            {search ? 'Không tìm thấy kết quả' : 'Chưa có xe nào'}
          </p>
          <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)', margin: 0 }}>
            {search ? 'Thử tìm kiếm với từ khóa khác' : 'Bắt đầu bằng cách đăng ký xe mới ở bên trái'}
          </p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>{COLUMNS.map((c, i) => <th key={i} aria-label={c || 'Thao tác'}>{c}</th>)}</tr>
            </thead>
            <tbody>
              {vehicles.map((v) => {
                const isEditing = editingId === v.id;
                const isActive = v.active !== false;
                return (
                  <tr
                    key={v.id}
                    style={isEditing ? { boxShadow: `inset 3px 0 0 ${GOLD}`, background: 'rgba(201,169,110,0.04)' } : undefined}
                  >
                    <td>
                      <span style={{ fontWeight: 700, fontFamily: "'Inter', sans-serif", letterSpacing: '0.02em' }}>
                        {v.licensePlate || '—'}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{vehicleTypeLabel(v.vehicleType)}</td>
                    <td>{v.residentName || '—'}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{v.roomNumber || '—'}</td>
                    <td style={{ fontWeight: 700, color: GOLD }}>{formatVnd(v.monthlyFee)}</td>
                    <td>
                      <span className={`status-badge ${isActive ? 'active' : 'inactive'}`}>
                        {isActive ? 'Đang hoạt động' : 'Ngừng'}
                      </span>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button
                          className="icon-button"
                          onClick={() => onEdit?.(v)}
                          title="Chỉnh sửa xe"
                          type="button"
                          style={isEditing ? { color: GOLD, borderColor: 'rgba(201,169,110,0.3)' } : undefined}
                        >
                          <Edit3 size={15} aria-hidden="true" />
                        </button>
                        <button
                          className="icon-button danger"
                          onClick={() => onDelete?.(v)}
                          title="Ngừng sử dụng xe"
                          type="button"
                        >
                          <Trash2 size={15} aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default VehicleTable;
