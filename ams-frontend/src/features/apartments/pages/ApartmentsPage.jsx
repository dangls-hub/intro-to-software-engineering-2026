import { useEffect, useState } from 'react';
import { Edit3, Plus, RefreshCcw, Search, Trash2, X } from 'lucide-react';
import {
  createApartment,
  deleteApartment,
  fetchApartments,
  updateApartment,
} from '../api/apartmentsApi';

const emptyForm = { code: '', floor: '', area: '', status: 'AVAILABLE' };

const statusMap = {
  AVAILABLE: { label: 'Còn trống', cls: 'available' },
  OCCUPIED: { label: 'Đang ở', cls: 'occupied' },
  INACTIVE: { label: 'Ngừng sử dụng', cls: 'inactive' },
};

function ApartmentsPage() {
  const [apartments, setApartments] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function loadApartments() {
    setIsLoading(true);
    setError('');
    try {
      setApartments(await fetchApartments());
    } catch (err) {
      setError(err.message || 'Không tải được danh sách căn hộ.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { loadApartments(); }, []);

  function updateField(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function openCreate() {
    setForm(emptyForm);
    setEditingId(null);
    setShowModal(true);
  }

  function openEdit(apt) {
    setEditingId(apt.id);
    setForm({
      code: apt.code ?? '',
      floor: apt.floor ?? '',
      area: apt.area ?? '',
      status: apt.status ?? 'AVAILABLE',
    });
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    const payload = { ...form, area: form.area === '' ? null : Number(form.area) };
    try {
      if (editingId) await updateApartment(editingId, payload);
      else await createApartment(payload);
      closeModal();
      await loadApartments();
    } catch (err) {
      setError(err.message || 'Không lưu được căn hộ.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(apt) {
    if (!window.confirm(`Bạn có chắc muốn xóa căn hộ ${apt.code}?`)) return;
    setError('');
    try {
      await deleteApartment(apt.id);
      await loadApartments();
    } catch (err) {
      setError(err.message || 'Không xóa được căn hộ.');
    }
  }

  const filtered = apartments.filter((a) =>
    (a.code || '').toLowerCase().includes(search.toLowerCase()) ||
    (a.floor || '').toString().includes(search)
  );

  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow">Apartment</p>
          <h1>Quản lý căn hộ</h1>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="secondary-button" onClick={loadApartments} type="button">
            <RefreshCcw size={17} /> Tải lại
          </button>
          <button className="primary-button" onClick={openCreate} type="button">
            <Plus size={17} /> Thêm căn hộ
          </button>
        </div>
      </header>

      {error && <div className="alert error">{error}</div>}

      <section className="workspace-panel">
        <div className="toolbar">
          <input
            className="search-input"
            placeholder="Tìm kiếm theo mã căn hộ, tầng..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="count-badge">{filtered.length}</span>
        </div>

        {isLoading ? (
          <div className="loading-center"><span className="spinner" /> Đang tải...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <Search size={48} />
            <p>Chưa có dữ liệu căn hộ{search ? ' phù hợp' : ''}.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Mã căn hộ</th>
                  <th>Tầng</th>
                  <th>Diện tích (m²)</th>
                  <th>Trạng thái</th>
                  <th aria-label="Thao tác" style={{ width: 100 }} />
                </tr>
              </thead>
              <tbody>
                {filtered.map((apt) => {
                  const st = statusMap[apt.status] || { label: apt.status || '—', cls: 'inactive' };
                  return (
                    <tr key={apt.id || apt.code}>
                      <td style={{ fontWeight: 700 }}>{apt.code || '—'}</td>
                      <td>{apt.floor || '—'}</td>
                      <td>{apt.area ?? '—'}</td>
                      <td><span className={`status-badge ${st.cls}`}>{st.label}</span></td>
                      <td>
                        <div className="row-actions">
                          <button className="icon-button" onClick={() => openEdit(apt)} title="Sửa"><Edit3 size={15} /></button>
                          <button className="icon-button danger" onClick={() => handleDelete(apt)} title="Xóa"><Trash2 size={15} /></button>
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

      {showModal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
          <div className="modal-panel">
            <div className="modal-header">
              <h2>{editingId ? 'Cập nhật căn hộ' : 'Thêm căn hộ mới'}</h2>
              <button className="icon-button" onClick={closeModal}><X size={18} /></button>
            </div>
            <form className="form-grid" onSubmit={handleSubmit}>
              <label>Mã căn hộ <input name="code" onChange={updateField} required value={form.code} placeholder="VD: A101" /></label>
              <label>Tầng <input name="floor" onChange={updateField} value={form.floor} placeholder="VD: 1" /></label>
              <label>Diện tích (m²) <input name="area" onChange={updateField} type="number" min="0" step="0.01" value={form.area} placeholder="VD: 65.5" /></label>
              <label>Trạng thái
                <select name="status" onChange={updateField} value={form.status}>
                  <option value="AVAILABLE">Còn trống</option>
                  <option value="OCCUPIED">Đang ở</option>
                  <option value="INACTIVE">Ngừng sử dụng</option>
                </select>
              </label>
              <div className="modal-footer" style={{ margin: 0, padding: 0, border: 'none' }}>
                <button className="secondary-button" onClick={closeModal} type="button">Hủy</button>
                <button className="primary-button" disabled={isSubmitting} type="submit">
                  {isSubmitting ? <><span className="spinner" /> Đang lưu...</> : editingId ? 'Lưu thay đổi' : 'Thêm căn hộ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default ApartmentsPage;
