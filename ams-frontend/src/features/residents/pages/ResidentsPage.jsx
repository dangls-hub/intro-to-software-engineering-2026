import { useEffect, useState } from 'react';
import { Edit3, Plus, RefreshCcw, Search, Trash2, X } from 'lucide-react';
import { fetchApartments } from '../../apartments/api/apartmentsApi';
import { createResident, deleteResident, fetchResidents, updateResident } from '../api/residentsApi';

const emptyForm = {
  fullName: '', identityNumber: '', phone: '', dateOfBirth: '',
  relationToOwner: '', apartmentId: '', status: 'ACTIVE',
};

const statusMap = {
  ACTIVE: { label: 'Đang cư trú', cls: 'active' },
  INACTIVE: { label: 'Ngừng cư trú', cls: 'inactive' },
};

function getAptLabel(r) {
  return r.apartmentCode || r.apartment?.code || r.household?.apartment?.code || r.apartmentId || '—';
}

function ResidentsPage() {
  const [residents, setResidents] = useState([]);
  const [apartments, setApartments] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function loadData() {
    setIsLoading(true);
    setError('');
    const [rRes, aRes] = await Promise.allSettled([fetchResidents(), fetchApartments()]);
    if (rRes.status === 'fulfilled') setResidents(rRes.value);
    else { setResidents([]); setError(rRes.reason?.message || 'Không tải được danh sách cư dân.'); }
    if (aRes.status === 'fulfilled') setApartments(aRes.value);
    setIsLoading(false);
  }

  useEffect(() => { loadData(); }, []);

  function updateField(e) { setForm((p) => ({ ...p, [e.target.name]: e.target.value })); }

  function openCreate() { setForm(emptyForm); setEditingId(null); setShowModal(true); }

  function openEdit(r) {
    setEditingId(r.id);
    setForm({
      fullName: r.fullName ?? '', identityNumber: r.identityNumber ?? '',
      phone: r.phone ?? '', dateOfBirth: r.dateOfBirth ?? '',
      relationToOwner: r.relationToOwner ?? '',
      apartmentId: r.apartmentId ?? r.apartment?.id ?? '',
      status: r.status ?? 'ACTIVE',
    });
    setShowModal(true);
  }

  function closeModal() { setShowModal(false); setEditingId(null); setForm(emptyForm); }

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true); setError('');
    const payload = { ...form, apartmentId: form.apartmentId === '' ? null : Number(form.apartmentId) };
    try {
      if (editingId) await updateResident(editingId, payload);
      else await createResident(payload);
      closeModal(); await loadData();
    } catch (err) { setError(err.message || 'Không lưu được cư dân.'); }
    finally { setIsSubmitting(false); }
  }

  async function handleDelete(r) {
    if (!window.confirm(`Bạn có chắc muốn xóa cư dân ${r.fullName}?`)) return;
    setError('');
    try { await deleteResident(r.id); await loadData(); }
    catch (err) { setError(err.message || 'Không xóa được cư dân.'); }
  }

  const filtered = residents.filter((r) =>
    (r.fullName || '').toLowerCase().includes(search.toLowerCase()) ||
    (r.identityNumber || '').includes(search) ||
    (r.phone || '').includes(search)
  );

  return (
    <>
      <header className="page-header">
        <div><p className="eyebrow">Resident</p><h1>Quản lý cư dân</h1></div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="secondary-button" onClick={loadData} type="button"><RefreshCcw size={17} /> Tải lại</button>
          <button className="primary-button" onClick={openCreate} type="button"><Plus size={17} /> Thêm cư dân</button>
        </div>
      </header>

      {error && <div className="alert error">{error}</div>}

      <section className="workspace-panel">
        <div className="toolbar">
          <input className="search-input" placeholder="Tìm kiếm theo họ tên, CCCD, SĐT..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <span className="count-badge">{filtered.length}</span>
        </div>

        {isLoading ? (
          <div className="loading-center"><span className="spinner" /> Đang tải...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state"><Search size={48} /><p>Chưa có dữ liệu cư dân{search ? ' phù hợp' : ''}.</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Họ tên</th>
                  <th>Số định danh</th>
                  <th>Điện thoại</th>
                  <th>Căn hộ</th>
                  <th>Quan hệ</th>
                  <th>Trạng thái</th>
                  <th aria-label="Thao tác" style={{ width: 100 }} />
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  const st = statusMap[r.status] || { label: r.status || '—', cls: 'inactive' };
                  return (
                    <tr key={r.id || r.identityNumber}>
                      <td style={{ fontWeight: 600 }}>{r.fullName || '—'}</td>
                      <td>{r.identityNumber || '—'}</td>
                      <td>{r.phone || '—'}</td>
                      <td>{getAptLabel(r)}</td>
                      <td>{r.relationToOwner || '—'}</td>
                      <td><span className={`status-badge ${st.cls}`}>{st.label}</span></td>
                      <td>
                        <div className="row-actions">
                          <button className="icon-button" onClick={() => openEdit(r)} title="Sửa"><Edit3 size={15} /></button>
                          <button className="icon-button danger" onClick={() => handleDelete(r)} title="Xóa"><Trash2 size={15} /></button>
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
              <h2>{editingId ? 'Cập nhật cư dân' : 'Thêm cư dân mới'}</h2>
              <button className="icon-button" onClick={closeModal}><X size={18} /></button>
            </div>
            <form className="form-grid" onSubmit={handleSubmit}>
              <label>Họ tên <input name="fullName" onChange={updateField} required value={form.fullName} placeholder="Nguyễn Văn A" /></label>
              <label>Số định danh (CCCD) <input name="identityNumber" onChange={updateField} value={form.identityNumber} placeholder="001234567890" /></label>
              <label>Số điện thoại <input name="phone" onChange={updateField} type="tel" value={form.phone} placeholder="0901234567" /></label>
              <label>Ngày sinh <input name="dateOfBirth" onChange={updateField} type="date" value={form.dateOfBirth} /></label>
              <label>Quan hệ với chủ hộ <input name="relationToOwner" onChange={updateField} value={form.relationToOwner} placeholder="Chủ hộ / Vợ / Con..." /></label>
              <label>Căn hộ
                <select name="apartmentId" onChange={updateField} value={form.apartmentId}>
                  <option value="">— Chưa gán —</option>
                  {apartments.map((a) => <option key={a.id || a.code} value={a.id}>{a.code}</option>)}
                </select>
              </label>
              <label>Trạng thái
                <select name="status" onChange={updateField} value={form.status}>
                  <option value="ACTIVE">Đang cư trú</option>
                  <option value="INACTIVE">Ngừng cư trú</option>
                </select>
              </label>
              <div className="modal-footer" style={{ margin: 0, padding: 0, border: 'none' }}>
                <button className="secondary-button" onClick={closeModal} type="button">Hủy</button>
                <button className="primary-button" disabled={isSubmitting} type="submit">
                  {isSubmitting ? <><span className="spinner" /> Đang lưu...</> : editingId ? 'Lưu thay đổi' : 'Thêm cư dân'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default ResidentsPage;
