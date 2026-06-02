import { useEffect, useState } from 'react';
import { Edit3, Plus, RefreshCcw, Search, Trash2, X } from 'lucide-react';
import { fetchApartments } from '../../apartments/api/apartmentsApi';
import {
  createResident,
  deleteResident,
  fetchResidents,
  updateResident,
} from '../api/residentsApi';
import { useToast } from '../../../components/ui/Toast';

const emptyForm = {
  fullName: '',
  identityNumber: '',
  phone: '',
  dateOfBirth: '',
  relationToOwner: '',
  apartmentId: '',
  status: 'ACTIVE',
};

const statusMap = {
  ACTIVE: { label: 'Đang cư trú', cls: 'active' },
  INACTIVE: { label: 'Ngưng cư trú', cls: 'inactive' },
};

function getApartmentLabel(resident) {
  return (
    resident.apartmentCode ||
    resident.apartment?.code ||
    resident.household?.apartment?.code ||
    resident.apartmentId ||
    '—'
  );
}

function ResidentsPage() {
  const [residents, setResidents] = useState([]);
  const [apartments, setApartments] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
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

  useEffect(() => {
    loadPageData();
  }, []);

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
      fullName: resident.fullName ?? '',
      identityNumber: resident.identityNumber ?? '',
      phone: resident.phone ?? '',
      dateOfBirth: resident.dateOfBirth ?? '',
      relationToOwner: resident.relationToOwner ?? '',
      apartmentId: resident.apartmentId ?? resident.apartment?.id ?? '',
      status: resident.status ?? 'ACTIVE',
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
    if (!confirmed) {
      return;
    }

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
      (r.fullName || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.identityNumber || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.phone || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow">Resident</p>
          <h1>Quản lý cư dân</h1>
        </div>
        <button className="secondary-button" onClick={loadPageData} type="button">
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
              <h2>{editingId ? 'Cập nhật cư dân' : 'Thêm cư dân'}</h2>
            </div>
            {editingId ? (
              <button className="icon-button" onClick={resetForm} title="Hủy sửa" type="button">
                <X size={17} aria-hidden="true" />
              </button>
            ) : null}
          </div>

          <label>
            Họ tên
            <input name="fullName" onChange={updateField} required type="text" value={form.fullName} placeholder="VD: Nguyễn Văn A" />
          </label>

          <label>
            Số định danh (CCCD)
            <input name="identityNumber" onChange={updateField} type="text" value={form.identityNumber} placeholder="VD: 0123456789" />
          </label>

          <label>
            Số điện thoại
            <input name="phone" onChange={updateField} type="tel" value={form.phone} placeholder="VD: 0909 123 456" />
          </label>

          <label>
            Ngày sinh
            <input name="dateOfBirth" onChange={updateField} type="date" value={form.dateOfBirth} />
          </label>

          <label>
            Quan hệ với chủ hộ
            <input name="relationToOwner" onChange={updateField} type="text" value={form.relationToOwner} placeholder="VD: Chủ hộ, Vợ/Chồng, Con..." />
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
            {isSubmitting ? 'Đang lưu...' : editingId ? 'Lưu thay đổi' : 'Thêm cư dân'}
          </button>
        </form>

        <section className="workspace-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Danh sách</p>
              <h2>Cư dân</h2>
            </div>
            <span className="count-badge">{filtered.length}</span>
          </div>

          <div className="toolbar">
            <input
              className="search-input"
              placeholder="Tìm theo tên, CCCD, SĐT..."
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
              <p>Chưa có dữ liệu cư dân{search ? ' phù hợp' : ''}.</p>
            </div>
          ) : (
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
                    const st = statusMap[resident.status] || { label: resident.status || '—', cls: 'inactive' };
                    return (
                      <tr key={resident.id || resident.identityNumber || resident.fullName}>
                        <td style={{ fontWeight: 700 }}>{resident.fullName || '—'}</td>
                        <td>{resident.identityNumber || '—'}</td>
                        <td>{resident.phone || '—'}</td>
                        <td>{getApartmentLabel(resident)}</td>
                        <td>
                          <span className={`status-badge ${st.cls}`}>{st.label}</span>
                        </td>
                        <td>
                          <div className="row-actions">
                            <button className="icon-button" onClick={() => startEdit(resident)} title="Sửa" type="button">
                              <Edit3 size={16} aria-hidden="true" />
                            </button>
                            <button className="icon-button danger" onClick={() => handleDelete(resident)} title="Xóa" type="button">
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

export default ResidentsPage;
