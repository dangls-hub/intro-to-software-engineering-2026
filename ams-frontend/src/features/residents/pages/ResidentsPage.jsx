import { useEffect, useState } from 'react';
import {
  AlertCircle,
  Edit3,
  Plus,
  RefreshCcw,
  Search,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { fetchApartments } from '../../apartments/api/apartmentsApi';
import {
  createResident,
  deleteResident,
  fetchResidents,
  updateResident,
} from '../api/residentsApi';
import { useToast } from '../../../components/ui/Toast';

/* ── Design tokens ─────────────────────────────────── */
const SERIF = { fontFamily: "'Playfair Display', Georgia, serif" };
const GOLD  = '#c9a96e';

/* ── Premium status config ─────────────────────────── */
const PM_STATUS = {
  ACTIVE:   { label: 'Đang cư trú',  color: '#34d399', bg: 'rgba(52,211,153,0.12)',  border: 'rgba(52,211,153,0.2)'  },
  INACTIVE: { label: 'Ngưng cư trú', color: '#f87171', bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.2)' },
};

const emptyForm = {
  fullName:        '',
  identityNumber:  '',
  phone:           '',
  dateOfBirth:     '',
  relationToOwner: '',
  apartmentId:     '',
  status:          'ACTIVE',
};

/* ── Preserved helper — DO NOT MODIFY ──────────────── */
function getApartmentLabel(resident) {
  return (
    resident.apartmentCode ||
    resident.apartment?.code ||
    resident.household?.apartment?.code ||
    resident.apartmentId ||
    '—'
  );
}

/* ── Skeleton rows for loading state ───────────────── */
function SkeletonRows() {
  return [...Array(6)].map((_, i) => (
    <tr key={i}>
      <td><div className="pm-skeleton" style={{ height: '18px', width: '130px', animationDelay: `${i * 55}ms`      }} /></td>
      <td><div className="pm-skeleton" style={{ height: '18px', width: '88px',  animationDelay: `${i * 55 + 22}ms` }} /></td>
      <td><div className="pm-skeleton" style={{ height: '18px', width: '88px',  animationDelay: `${i * 55 + 44}ms` }} /></td>
      <td><div className="pm-skeleton" style={{ height: '18px', width: '48px',  animationDelay: `${i * 55 + 66}ms` }} /></td>
      <td><div className="pm-skeleton" style={{ height: '22px', width: '92px',  borderRadius: '999px', animationDelay: `${i * 55 + 88}ms` }} /></td>
      <td>
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
          <div className="pm-skeleton" style={{ height: '30px', width: '30px', borderRadius: '8px', animationDelay: `${i * 55 + 110}ms` }} />
          <div className="pm-skeleton" style={{ height: '30px', width: '30px', borderRadius: '8px', animationDelay: `${i * 55 + 132}ms` }} />
        </div>
      </td>
    </tr>
  ));
}

function ResidentsPage() {
  /* ── Preserved logic — DO NOT MODIFY ────────────── */
  const [residents,    setResidents]    = useState([]);
  const [apartments,   setApartments]   = useState([]);
  const [form,         setForm]         = useState(emptyForm);
  const [editingId,    setEditingId]    = useState(null);
  const [isLoading,    setIsLoading]    = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error,        setError]        = useState('');
  const [search,       setSearch]       = useState('');
  const showToast = useToast();

  async function loadPageData() {
    setIsLoading(true);
    setError('');

    const [residentsResult, apartmentsResult] = await Promise.allSettled([
      fetchResidents(),
      fetchApartments(),
    ]);

    if (residentsResult.status === 'fulfilled') {
      setResidents(residentsResult.value);
    } else {
      setResidents([]);
      setError(residentsResult.reason?.message || 'Không tải được danh sách cư dân.');
    }

    if (apartmentsResult.status === 'fulfilled') {
      setApartments(apartmentsResult.value);
    }

    setIsLoading(false);
  }

  useEffect(() => { loadPageData(); }, []);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  function startEdit(resident) {
    setEditingId(resident.id);
    setForm({
      fullName:        resident.fullName        ?? '',
      identityNumber:  resident.identityNumber  ?? '',
      phone:           resident.phone           ?? '',
      dateOfBirth:     resident.dateOfBirth     ?? '',
      relationToOwner: resident.relationToOwner ?? '',
      apartmentId:     resident.apartmentId ?? resident.apartment?.id ?? '',
      status:          resident.status ?? 'ACTIVE',
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');

    const payload = {
      ...form,
      apartmentId: form.apartmentId === '' ? null : Number(form.apartmentId),
    };

    try {
      if (editingId) {
        await updateResident(editingId, payload);
      } else {
        await createResident(payload);
      }
      resetForm();
      await loadPageData();
      showToast(editingId ? 'Cập nhật cư dân thành công!' : 'Thêm cư dân thành công!', 'success');
    } catch (apiError) {
      setError(apiError.message || 'Không lưu được cư dân.');
      showToast(apiError.message || 'Không lưu được cư dân.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(resident) {
    const confirmed = window.confirm(`Xóa hoặc vô hiệu hóa cư dân ${resident.fullName}?`);
    if (!confirmed) return;

    setError('');

    try {
      await deleteResident(resident.id);
      await loadPageData();
      showToast('Xóa cư dân thành công!', 'success');
    } catch (apiError) {
      setError(apiError.message || 'Không xóa được cư dân.');
      showToast(apiError.message || 'Không xóa được cư dân.', 'error');
    }
  }

  const filtered = residents.filter(
    (r) =>
      (r.fullName        || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.identityNumber  || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.phone           || '').toLowerCase().includes(search.toLowerCase())
  );
  /* ── End preserved logic ─────────────────────────── */

  return (
    <>
      {/* ── Page header ─────────────────────────────── */}
      <header className="page-header">
        <div>
          <p className="eyebrow">
            <Users size={12} strokeWidth={2.5} aria-hidden="true" />
            Quản lý dân cư
          </p>
          <h1 style={{ ...SERIF, letterSpacing: '-0.025em' }}>Cư dân</h1>
        </div>

        <button
          className="pm-btn-circle"
          onClick={loadPageData}
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
            onClick={loadPageData}
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
                {editingId ? 'Cập nhật cư dân' : 'Thêm cư dân mới'}
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
            Họ tên
            <input
              name="fullName"
              onChange={updateField}
              required
              type="text"
              value={form.fullName}
              placeholder="VD: Nguyễn Văn A"
            />
          </label>

          <label>
            Số định danh (CCCD)
            <input
              name="identityNumber"
              onChange={updateField}
              type="text"
              value={form.identityNumber}
              placeholder="VD: 0123456789"
            />
          </label>

          <label>
            Số điện thoại
            <input
              name="phone"
              onChange={updateField}
              type="tel"
              value={form.phone}
              placeholder="VD: 0909 123 456"
            />
          </label>

          <label>
            Ngày sinh
            <input
              name="dateOfBirth"
              onChange={updateField}
              type="date"
              value={form.dateOfBirth}
            />
          </label>

          <label>
            Quan hệ với chủ hộ
            <input
              name="relationToOwner"
              onChange={updateField}
              type="text"
              value={form.relationToOwner}
              placeholder="VD: Chủ hộ, Vợ/Chồng, Con..."
            />
          </label>

          <label>
            Căn hộ
            <select name="apartmentId" onChange={updateField} value={form.apartmentId}>
              <option value="">— Chưa gán —</option>
              {apartments.map((apartment) => (
                <option key={apartment.id || apartment.code} value={apartment.id}>
                  {apartment.code}
                </option>
              ))}
            </select>
          </label>

          <label>
            Trạng thái
            <select name="status" onChange={updateField} value={form.status}>
              <option value="ACTIVE">Đang cư trú</option>
              <option value="INACTIVE">Ngưng cư trú</option>
            </select>
          </label>

          <button className="primary-button" disabled={isSubmitting} type="submit">
            <Plus size={17} aria-hidden="true" />
            {isSubmitting ? 'Đang lưu…' : editingId ? 'Lưu thay đổi' : 'Thêm cư dân'}
          </button>
        </form>

        {/* ── RIGHT: list panel ─────────────────────── */}
        <section className="workspace-panel">

          {/* Panel heading */}
          <div className="panel-heading">
            <div>
              <p className="eyebrow" style={{ marginBottom: '4px' }}>Danh sách</p>
              <h2 style={SERIF}>Cư dân</h2>
            </div>
            <span className="count-badge" title={`${filtered.length} cư dân`}>
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
                placeholder="Tìm theo tên, CCCD, SĐT…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: '36px' }}
              />
            </div>
          </div>

          {/* ── Table content ─────────────────────── */}
          {isLoading ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Họ tên</th>
                    <th>Định danh</th>
                    <th>Điện thoại</th>
                    <th>Căn hộ</th>
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
              <Users
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
                {search ? 'Không tìm thấy kết quả' : 'Chưa có cư dân nào'}
              </p>
              <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)', margin: 0 }}>
                {search
                  ? 'Thử tìm kiếm với từ khóa khác'
                  : 'Bắt đầu bằng cách thêm cư dân mới ở bên trái'}
              </p>
            </div>
          ) : (
            /* Data table */
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Họ tên</th>
                    <th>Định danh</th>
                    <th>Điện thoại</th>
                    <th>Căn hộ</th>
                    <th>Trạng thái</th>
                    <th aria-label="Thao tác" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((resident) => {
                    const st        = PM_STATUS[resident.status] || PM_STATUS.INACTIVE;
                    const isEditing = editingId === resident.id;
                    return (
                      <tr
                        key={resident.id || resident.identityNumber || resident.fullName}
                        style={isEditing
                          ? { boxShadow: `inset 3px 0 0 ${GOLD}`, background: 'rgba(201,169,110,0.04)' }
                          : undefined}
                      >
                        <td>
                          <span style={{ fontWeight: 700 }}>
                            {resident.fullName || '—'}
                          </span>
                        </td>
                        <td style={{ color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>
                          {resident.identityNumber || '—'}
                        </td>
                        <td style={{ color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>
                          {resident.phone || '—'}
                        </td>
                        <td>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            color: 'var(--accent)',
                            fontWeight: 600,
                            fontSize: '0.88rem',
                          }}>
                            {getApartmentLabel(resident)}
                          </span>
                        </td>
                        <td>
                          {/* Reusing .pm-badge with inline color override */}
                          <span
                            className="pm-badge"
                            style={{
                              background: st.bg,
                              color:      st.color,
                              border:     `1px solid ${st.border}`,
                              fontSize:   '0.67rem',
                            }}
                          >
                            <span style={{
                              width: '5px', height: '5px',
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
                              onClick={() => startEdit(resident)}
                              title="Chỉnh sửa cư dân"
                              type="button"
                              style={isEditing ? { color: GOLD, borderColor: 'rgba(201,169,110,0.3)' } : undefined}
                            >
                              <Edit3 size={15} aria-hidden="true" />
                            </button>
                            <button
                              className="icon-button danger"
                              onClick={() => handleDelete(resident)}
                              title="Xóa cư dân"
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

export default ResidentsPage;
