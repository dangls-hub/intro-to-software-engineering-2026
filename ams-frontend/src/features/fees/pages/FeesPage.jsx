import { useEffect, useState } from 'react';
import { Edit3, Plus, RefreshCcw, Search, Trash2, X } from 'lucide-react';
import { createFee, deleteFee, fetchFees, updateFee } from '../api/feesApi';
import { fetchApartments } from '../../apartments/api/apartmentsApi';

const emptyForm = {
  name: '', type: 'MANDATORY', amount: '', dueDate: '',
  apartmentId: '', description: '', status: 'PENDING',
};

const typeMap = { MANDATORY: 'Bắt buộc', VOLUNTARY: 'Tự nguyện' };
const statusMap = {
  PENDING: { label: 'Chưa thu', cls: 'pending' },
  PARTIAL: { label: 'Thu một phần', cls: 'pending' },
  PAID: { label: 'Đã thu', cls: 'paid' },
  OVERDUE: { label: 'Quá hạn', cls: 'overdue' },
};

function FeesPage({ role }) {
  const isResident = role === 'RESIDENT';
  const [fees, setFees] = useState([]);
  const [apartments, setApartments] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function loadData() {
    setIsLoading(true); setError('');
    const [fRes, aRes] = await Promise.allSettled([fetchFees(), fetchApartments()]);
    if (fRes.status === 'fulfilled') setFees(fRes.value);
    else { setFees([]); setError(fRes.reason?.message || 'Không tải được danh sách khoản thu.'); }
    if (aRes.status === 'fulfilled') setApartments(aRes.value);
    setIsLoading(false);
  }

  useEffect(() => { loadData(); }, []);

  function updateField(e) { setForm((p) => ({ ...p, [e.target.name]: e.target.value })); }

  function openCreate() { setForm(emptyForm); setEditingId(null); setShowModal(true); }

  function openEdit(f) {
    setEditingId(f.id);
    setForm({
      name: f.name ?? '', type: f.type ?? 'MANDATORY',
      amount: f.amount ?? '', dueDate: f.dueDate ?? '',
      apartmentId: f.apartmentId ?? f.apartment?.id ?? '',
      description: f.description ?? '', status: f.status ?? 'PENDING',
    });
    setShowModal(true);
  }

  function closeModal() { setShowModal(false); setEditingId(null); setForm(emptyForm); }

  async function handleSubmit(e) {
    e.preventDefault(); setIsSubmitting(true); setError('');
    const payload = {
      ...form,
      amount: form.amount === '' ? null : Number(form.amount),
      apartmentId: form.apartmentId === '' ? null : Number(form.apartmentId),
    };
    try {
      if (editingId) await updateFee(editingId, payload);
      else await createFee(payload);
      closeModal(); await loadData();
    } catch (err) { setError(err.message || 'Không lưu được khoản thu.'); }
    finally { setIsSubmitting(false); }
  }

  async function handleDelete(f) {
    if (!window.confirm(`Bạn có chắc muốn xóa khoản thu "${f.name}"?`)) return;
    setError('');
    try { await deleteFee(f.id); await loadData(); }
    catch (err) { setError(err.message || 'Không xóa được khoản thu.'); }
  }

  const fmt = (n) => n != null ? Number(n).toLocaleString('vi-VN') + ' đ' : '—';

  const filtered = fees.filter((f) =>
    (f.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (f.apartment?.code || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <header className="page-header">
        <div><p className="eyebrow">{isResident ? 'My Fees' : 'Fee'}</p><h1>{isResident ? 'Khoản thu của tôi' : 'Quản lý khoản thu'}</h1></div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="secondary-button" onClick={loadData} type="button"><RefreshCcw size={17} /> Tải lại</button>
          {!isResident && <button className="primary-button" onClick={openCreate} type="button"><Plus size={17} /> Tạo khoản thu</button>}
        </div>
      </header>

      {error && <div className="alert error">{error}</div>}

      <section className="workspace-panel">
        <div className="toolbar">
          <input className="search-input" placeholder="Tìm kiếm theo tên khoản thu, căn hộ..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <span className="count-badge">{filtered.length}</span>
        </div>

        {isLoading ? (
          <div className="loading-center"><span className="spinner" /> Đang tải...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state"><Search size={48} /><p>Chưa có dữ liệu khoản thu{search ? ' phù hợp' : ''}.</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Tên khoản thu</th>
                  <th>Loại</th>
                  <th>Số tiền</th>
                  <th>Căn hộ</th>
                  <th>Hạn nộp</th>
                  <th>Trạng thái</th>
                  {!isResident && <th aria-label="Thao tác" style={{ width: 100 }} />}
                </tr>
              </thead>
              <tbody>
                {filtered.map((f) => {
                  const st = statusMap[f.status] || { label: f.status || '—', cls: 'inactive' };
                  return (
                    <tr key={f.id}>
                      <td style={{ fontWeight: 600 }}>{f.name || '—'}</td>
                      <td>{typeMap[f.type] || f.type || '—'}</td>
                      <td style={{ fontWeight: 700 }}>{fmt(f.amount)}</td>
                      <td>{f.apartment?.code || f.apartmentId || '—'}</td>
                      <td>{f.dueDate || '—'}</td>
                      <td><span className={`status-badge ${st.cls}`}>{st.label}</span></td>
                      {!isResident && (
                      <td>
                        <div className="row-actions">
                          <button className="icon-button" onClick={() => openEdit(f)} title="Sửa"><Edit3 size={15} /></button>
                          <button className="icon-button danger" onClick={() => handleDelete(f)} title="Xóa"><Trash2 size={15} /></button>
                        </div>
                      </td>
                      )}
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
              <h2>{editingId ? 'Cập nhật khoản thu' : 'Tạo khoản thu mới'}</h2>
              <button className="icon-button" onClick={closeModal}><X size={18} /></button>
            </div>
            <form className="form-grid" onSubmit={handleSubmit}>
              <label>Tên khoản thu <input name="name" onChange={updateField} required value={form.name} placeholder="VD: Phí quản lý T5/2026" /></label>
              <label>Loại phí
                <select name="type" onChange={updateField} value={form.type}>
                  <option value="MANDATORY">Bắt buộc</option>
                  <option value="VOLUNTARY">Tự nguyện</option>
                </select>
              </label>
              <label>Số tiền (VNĐ) <input name="amount" onChange={updateField} type="number" min="0" value={form.amount} placeholder="500000" /></label>
              <label>Căn hộ
                <select name="apartmentId" onChange={updateField} value={form.apartmentId}>
                  <option value="">— Tất cả —</option>
                  {apartments.map((a) => <option key={a.id || a.code} value={a.id}>{a.code}</option>)}
                </select>
              </label>
              <label>Hạn nộp <input name="dueDate" onChange={updateField} type="date" value={form.dueDate} /></label>
              <label>Mô tả <input name="description" onChange={updateField} value={form.description} placeholder="Ghi chú thêm..." /></label>
              <label>Trạng thái
                <select name="status" onChange={updateField} value={form.status}>
                  <option value="PENDING">Chưa thu</option>
                  <option value="PARTIAL">Thu một phần</option>
                  <option value="PAID">Đã thu</option>
                  <option value="OVERDUE">Quá hạn</option>
                </select>
              </label>
              <div className="modal-footer" style={{ margin: 0, padding: 0, border: 'none' }}>
                <button className="secondary-button" onClick={closeModal} type="button">Hủy</button>
                <button className="primary-button" disabled={isSubmitting} type="submit">
                  {isSubmitting ? <><span className="spinner" /> Đang lưu...</> : editingId ? 'Lưu thay đổi' : 'Tạo khoản thu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default FeesPage;
