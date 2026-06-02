import { useEffect, useState } from 'react';
import { Edit3, Plus, RefreshCcw, Search, Trash2, X } from 'lucide-react';
import {
  createApartment,
  deleteApartment,
  fetchApartments,
  updateApartment,
} from '../api/apartmentsApi';

const emptyForm = {
  roomNumber: '',
  floor: '',
  area: '',
  status: 'AVAILABLE',
};

const statusMap = {
  AVAILABLE: { label: 'Còn trống', cls: 'available' },
  OCCUPIED: { label: 'Đang ở', cls: 'occupied' },
  INACTIVE: { label: 'Ngưng sử dụng', cls: 'inactive' },
};

function ApartmentsPage() {
  const [apartments, setApartments] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

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

  useEffect(() => {
    loadApartments();
  }, []);

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
      floor: apartment.floor ?? '',
      area: apartment.area ?? '',
      status: apartment.status ?? 'AVAILABLE',
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');

    const payload = {
      ...form,
      area: form.area === '' ? null : Number(form.area),
    };

    try {
      if (editingId) {
        await updateApartment(editingId, payload);
      } else {
        await createApartment(payload);
      }

      resetForm();
      await loadApartments();
    } catch (apiError) {
      setError(apiError.message || 'Không lưu được căn hộ.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(apartment) {
    const confirmed = window.confirm(`Xóa hoặc vô hiệu hóa căn hộ ${apartment.roomNumber}?`);
    if (!confirmed) {
      return;
    }

    setError('');

    try {
      await deleteApartment(apartment.id);
      await loadApartments();
    } catch (apiError) {
      setError(apiError.message || 'Không xóa được căn hộ.');
    }
  }

  const filtered = apartments.filter(
    (a) =>
      (a.roomNumber || '').toLowerCase().includes(search.toLowerCase()) ||
      (a.floor || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow">Apartment</p>
          <h1>Quản lý căn hộ</h1>
        </div>
        <button className="secondary-button" onClick={loadApartments} type="button">
          <RefreshCcw size={17} aria-hidden="true" />
          Tải lại
        </button>
      </header>

      {error ? <div className="alert error">{error}</div> : null}

      <section className="workspace-grid">
        <form className="workspace-panel form-grid" onSubmit={handleSubmit}>
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Form</p>
              <h2>{editingId ? 'Cập nhật căn hộ' : 'Thêm căn hộ'}</h2>
            </div>
            {editingId ? (
              <button className="icon-button" onClick={resetForm} title="Hủy sửa" type="button">
                <X size={17} aria-hidden="true" />
              </button>
            ) : null}
          </div>

          <label>
            Mã căn hộ
            <input name="roomNumber" onChange={updateField} required type="text" value={form.roomNumber} placeholder="VD: A-101" />
          </label>

          <label>
            Tầng
            <input name="floor" onChange={updateField} type="text" value={form.floor} placeholder="VD: 10" />
          </label>

          <label>
            Diện tích (m²)
            <input min="0" name="area" onChange={updateField} step="0.01" type="number" value={form.area} placeholder="VD: 75.5" />
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
            {isSubmitting ? 'Đang lưu...' : editingId ? 'Lưu thay đổi' : 'Thêm căn hộ'}
          </button>
        </form>

        <section className="workspace-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Danh sách</p>
              <h2>Căn hộ</h2>
            </div>
            <span className="count-badge">{filtered.length}</span>
          </div>

          <div className="toolbar">
            <input
              className="search-input"
              placeholder="Tìm theo mã căn hộ, tầng..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {isLoading ? (
            <div className="loading-center">
              <span className="spinner" /> Đang tải danh sách...
            </div>
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
                    <th>Diện tích</th>
                    <th>Trạng thái</th>
                    <th aria-label="Thao tác" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((apartment) => {
                    const st = statusMap[apartment.status] || { label: apartment.status || '—', cls: 'inactive' };
                    return (
                      <tr key={apartment.id || apartment.roomNumber}>
                        <td style={{ fontWeight: 700 }}>{apartment.roomNumber || '—'}</td>
                        <td>{apartment.floor || '—'}</td>
                        <td>{apartment.area != null ? `${apartment.area} m²` : '—'}</td>
                        <td>
                          <span className={`status-badge ${st.cls}`}>{st.label}</span>
                        </td>
                        <td>
                          <div className="row-actions">
                            <button className="icon-button" onClick={() => startEdit(apartment)} title="Sửa" type="button">
                              <Edit3 size={16} aria-hidden="true" />
                            </button>
                            <button className="icon-button danger" onClick={() => handleDelete(apartment)} title="Xóa" type="button">
                              <Trash2 size={16} aria-hidden="true" />
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
