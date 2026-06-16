import { useEffect, useState } from 'react';
import {
  AlertCircle,
  Building2,
  Edit3,
  Plus,
  RefreshCcw,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import {
  createApartment,
  deleteApartment,
  fetchApartments,
  updateApartment,
} from '../api/apartmentsApi';
import { useToast } from '../../../components/ui/Toast';

/* ── Design tokens ─────────────────────────────────── */
const SERIF = { fontFamily: "var(--font-display)" };
const GOLD  = '#c9a96e';

/* ── Premium status config (replaces old statusMap) ── */
const PM_STATUS = {
  AVAILABLE: { label: 'Còn trống',     color: '#34d399', bg: 'rgba(52,211,153,0.12)',   border: 'rgba(52,211,153,0.2)'   },
  OCCUPIED:  { label: 'Đang ở',        color: '#c9a96e', bg: 'rgba(201,169,110,0.12)',  border: 'rgba(201,169,110,0.22)' },
  INACTIVE:  { label: 'Ngưng sử dụng', color: '#f87171', bg: 'rgba(248,113,113,0.12)',  border: 'rgba(248,113,113,0.2)'  },
};

const emptyForm = {
  roomNumber: '',
  floor:      '',
  area:       '',
  status:     'AVAILABLE',
};

/* ── Skeleton rows for loading state ── */
function SkeletonRows() {
  return [...Array(6)].map((_, i) => (
    <tr key={i}>
      <td><div className="pm-skeleton" style={{ height: '18px', width: '80px', animationDelay: `${i * 55}ms` }} /></td>
      <td><div className="pm-skeleton" style={{ height: '18px', width: '32px', animationDelay: `${i * 55 + 25}ms` }} /></td>
      <td><div className="pm-skeleton" style={{ height: '18px', width: '58px', animationDelay: `${i * 55 + 50}ms` }} /></td>
      <td><div className="pm-skeleton" style={{ height: '22px', width: '90px', borderRadius: '999px', animationDelay: `${i * 55 + 75}ms` }} /></td>
      <td>
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
          <div className="pm-skeleton" style={{ height: '30px', width: '30px', borderRadius: '8px', animationDelay: `${i * 55 + 100}ms` }} />
          <div className="pm-skeleton" style={{ height: '30px', width: '30px', borderRadius: '8px', animationDelay: `${i * 55 + 130}ms` }} />
        </div>
      </td>
    </tr>
  ));
}

function ApartmentsPage() {
  /* ── Preserved logic — DO NOT MODIFY ────────────── */
  const [apartments,   setApartments]   = useState([]);
  const [form,         setForm]         = useState(emptyForm);
  const [editingId,    setEditingId]    = useState(null);
  const [isLoading,    setIsLoading]    = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error,        setError]        = useState('');
  const [search,       setSearch]       = useState('');
  const showToast = useToast();

  async function loadApartments() {
    setIsLoading(true);
    setError('');
    try {
      setApartments(await fetchApartments());
    } catch (apiError) {
      setError(apiError.message || 'Không tải được danh sách căn hộ.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { loadApartments(); }, []);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  function startEdit(apartment) {
    setEditingId(apartment.id);
    setForm({
      roomNumber: apartment.roomNumber ?? '',
      floor:      apartment.floor      ?? '',
      area:       apartment.area       ?? '',
      status:     apartment.status     ?? 'AVAILABLE',
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');
    const payload = { ...form, area: form.area === '' ? null : Number(form.area) };
    try {
      if (editingId) {
        await updateApartment(editingId, payload);
      } else {
        await createApartment(payload);
      }
      resetForm();
      await loadApartments();
      showToast(editingId ? 'Cập nhật căn hộ thành công!' : 'Thêm căn hộ thành công!', 'success');
    } catch (apiError) {
      setError(apiError.message || 'Không lưu được căn hộ.');
      showToast(apiError.message || 'Không lưu được căn hộ.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(apartment) {
    const confirmed = window.confirm(`Xóa hoặc vô hiệu hóa căn hộ ${apartment.roomNumber}?`);
    if (!confirmed) return;
    setError('');
    try {
      await deleteApartment(apartment.id);
      await loadApartments();
      showToast('Xóa căn hộ thành công!', 'success');
    } catch (apiError) {
      setError(apiError.message || 'Không xóa được căn hộ.');
      showToast(apiError.message || 'Không xóa được căn hộ.', 'error');
    }
  }

  const filtered = apartments.filter(
    (a) =>
      (a.roomNumber || '').toLowerCase().includes(search.toLowerCase()) ||
      (a.floor || '').toLowerCase().includes(search.toLowerCase())
  );
  /* ── End preserved logic ─────────────────────────── */

  return (
    <>
      {/* ── Page header ─────────────────────────────── */}
      <header className="page-header">
        <div>
          <p className="eyebrow">
            <Building2 size={12} strokeWidth={2.5} aria-hidden="true" />
            Bất động sản
          </p>
          <h1 style={{ ...SERIF, letterSpacing: '-0.025em' }}>Quản lý căn hộ</h1>
        </div>

        <button
          className="pm-btn-circle"
          onClick={loadApartments}
          type="button"
          title="Tải lại danh sách"
          aria-label="Tải lại"
          style={{ width: '44px', height: '44px' }}
        >
          <RefreshCcw size={17} strokeWidth={2} aria-hidden="true" />
        </button>
      </header>

      {/* ── Premium error banner ─────────────────────── */}
      {error && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'rgba(248,113,113,0.08)',
          border: '1px solid rgba(248,113,113,0.2)',
          borderRadius: '12px',
          padding: '12px 18px',
          color: '#f87171',
          marginBottom: '20px',
          fontSize: '0.88rem',
          fontWeight: 600,
        }}>
          <AlertCircle size={15} strokeWidth={2} style={{ flexShrink: 0 }} />
          <span style={{ flex: 1 }}>{error}</span>
          <button
            onClick={loadApartments}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '5px',
              background: 'rgba(248,113,113,0.12)', border: 'none', borderRadius: '8px',
              padding: '5px 12px', color: '#f87171', cursor: 'pointer',
              fontWeight: 700, fontSize: '0.8rem', flexShrink: 0,
            }}
          >
            <RefreshCcw size={12} strokeWidth={2.5} /> Thử lại
          </button>
        </div>
      )}

      {/* ── Two-column workspace ─────────────────────── */}
      <section className="workspace-grid">

        {/* ── LEFT: form panel ──────────────────────── */}
        <form
          className="workspace-panel form-grid"
          onSubmit={handleSubmit}
          style={editingId ? { borderColor: 'rgba(201,169,110,0.28)' } : undefined}
        >
          <div className="panel-heading">
            <div>
              <p className="eyebrow" style={{ marginBottom: '4px' }}>
                {editingId ? 'Chỉnh sửa' : 'Thêm mới'}
              </p>
              <h2 style={SERIF}>
                {editingId ? 'Cập nhật căn hộ' : 'Thêm căn hộ mới'}
              </h2>
            </div>
            {editingId && (
              <button
                className="pm-btn-circle"
                onClick={resetForm}
                title="Hủy chỉnh sửa"
                type="button"
                aria-label="Hủy chỉnh sửa"
              >
                <X size={15} strokeWidth={2.5} />
              </button>
            )}
          </div>

          <label>
            Mã căn hộ
            <input
              name="roomNumber"
              onChange={updateField}
              required
              type="text"
              value={form.roomNumber}
              placeholder="VD: A-101"
            />
          </label>

          <label>
            Tầng
            <input
              name="floor"
              onChange={updateField}
              type="text"
              value={form.floor}
              placeholder="VD: 10"
            />
          </label>

          <label>
            Diện tích (m²)
            <input
              min="0"
              name="area"
              onChange={updateField}
              step="0.01"
              type="number"
              value={form.area}
              placeholder="VD: 75.5"
            />
          </label>

          <label>
            Trạng thái
            <select name="status" onChange={updateField} value={form.status}>
              <option value="AVAILABLE">Còn trống</option>
              <option value="OCCUPIED">Đang ở</option>
              <option value="INACTIVE">Ngưng sử dụng</option>
            </select>
          </label>

          <button className="primary-button" disabled={isSubmitting} type="submit">
            <Plus size={17} aria-hidden="true" />
            {isSubmitting ? 'Đang lưu…' : editingId ? 'Lưu thay đổi' : 'Thêm căn hộ'}
          </button>
        </form>

        {/* ── RIGHT: list panel ─────────────────────── */}
        <section className="workspace-panel">

          {/* Panel heading */}
          <div className="panel-heading">
            <div>
              <p className="eyebrow" style={{ marginBottom: '4px' }}>Danh sách</p>
              <h2 style={SERIF}>Căn hộ</h2>
            </div>
            <span
              className="count-badge"
              title={`${filtered.length} căn hộ`}
            >
              {isLoading ? '…' : filtered.length}
            </span>
          </div>

          {/* Search toolbar */}
          <div className="toolbar">
            <div style={{ position: 'relative', flex: 1, maxWidth: '420px' }}>
              <Search
                size={15}
                strokeWidth={2}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                  pointerEvents: 'none',
                }}
              />
              <input
                className="search-input"
                placeholder="Tìm theo mã căn hộ, tầng…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: '36px' }}
              />
            </div>
          </div>

          {/* ── Table content ─────────────────────── */}
          {isLoading ? (
            /* Premium skeleton rows */
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Mã căn hộ</th>
                    <th>Tầng</th>
                    <th>Diện tích</th>
                    <th>Trạng thái</th>
                    <th aria-label="Thao tác" />
                  </tr>
                </thead>
                <tbody>
                  <SkeletonRows />
                </tbody>
              </table>
            </div>
          ) : filtered.length === 0 ? (
            /* Premium empty state */
            <div style={{ textAlign: 'center', padding: '64px 24px' }}>
              <Building2
                size={48}
                strokeWidth={1}
                style={{ margin: '0 auto 16px', color: 'rgba(201,169,110,0.22)', display: 'block' }}
              />
              <p style={{
                ...SERIF,
                fontSize: '1.05rem',
                fontWeight: 700,
                color: 'var(--text-secondary)',
                margin: '0 0 8px',
              }}>
                {search ? 'Không tìm thấy kết quả' : 'Chưa có căn hộ nào'}
              </p>
              <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)', margin: 0 }}>
                {search
                  ? `Thử tìm kiếm với từ khóa khác`
                  : 'Bắt đầu bằng cách thêm căn hộ mới ở bên trái'}
              </p>
            </div>
          ) : (
            /* Data table */
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Mã căn hộ</th>
                    <th>Tầng</th>
                    <th>Diện tích</th>
                    <th>Trạng thái</th>
                    <th aria-label="Thao tác" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((apartment) => {
                    const st = PM_STATUS[apartment.status] || PM_STATUS.INACTIVE;
                    const isEditing = editingId === apartment.id;
                    return (
                      <tr
                        key={apartment.id || apartment.roomNumber}
                        style={isEditing ? { boxShadow: `inset 3px 0 0 ${GOLD}`, background: 'rgba(201,169,110,0.04)' } : undefined}
                      >
                        <td>
                          <span style={{ fontWeight: 700, fontFamily: "'Inter', sans-serif", letterSpacing: '0.01em' }}>
                            {apartment.roomNumber || '—'}
                          </span>
                        </td>
                        <td>{apartment.floor || '—'}</td>
                        <td style={{ color: 'var(--text-secondary)' }}>
                          {apartment.area != null ? `${apartment.area} m²` : '—'}
                        </td>
                        <td>
                          {/* Reusing .pm-badge with inline color override */}
                          <span
                            className="pm-badge"
                            style={{
                              background: st.bg,
                              color: st.color,
                              border: `1px solid ${st.border}`,
                              fontSize: '0.67rem',
                            }}
                          >
                            <span style={{
                              width: '5px',
                              height: '5px',
                              borderRadius: '50%',
                              background: 'currentColor',
                              flexShrink: 0,
                            }} />
                            {st.label}
                          </span>
                        </td>
                        <td>
                          <div className="row-actions">
                            <button
                              className="icon-button"
                              onClick={() => startEdit(apartment)}
                              title="Chỉnh sửa căn hộ"
                              type="button"
                              style={isEditing ? { color: GOLD, borderColor: 'rgba(201,169,110,0.3)' } : undefined}
                            >
                              <Edit3 size={15} aria-hidden="true" />
                            </button>
                            <button
                              className="icon-button danger"
                              onClick={() => handleDelete(apartment)}
                              title="Xóa căn hộ"
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
      </section>
    </>
  );
}

export default ApartmentsPage;
