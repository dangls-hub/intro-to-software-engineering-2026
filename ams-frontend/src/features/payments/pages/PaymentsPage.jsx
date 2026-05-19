import { useEffect, useState } from 'react';
import { Plus, RefreshCcw, Search, Trash2, X } from 'lucide-react';
import { createPayment, deletePayment, fetchPayments } from '../api/paymentsApi';
import { fetchFees } from '../../fees/api/feesApi';

const emptyForm = { feeId: '', amount: '', method: 'CASH', note: '' };

const methodMap = { CASH: 'Tiền mặt', TRANSFER: 'Chuyển khoản', QR: 'QR Code' };
const statusCls = { PAID: 'paid', PENDING: 'pending' };

function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [fees, setFees] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function loadData() {
    setIsLoading(true); setError('');
    const [pRes, fRes] = await Promise.allSettled([fetchPayments(), fetchFees()]);
    if (pRes.status === 'fulfilled') setPayments(pRes.value);
    else { setPayments([]); setError(pRes.reason?.message || 'Không tải được danh sách thanh toán.'); }
    if (fRes.status === 'fulfilled') setFees(fRes.value);
    setIsLoading(false);
  }

  useEffect(() => { loadData(); }, []);

  function updateField(e) { setForm((p) => ({ ...p, [e.target.name]: e.target.value })); }
  function openCreate() { setForm(emptyForm); setShowModal(true); }
  function closeModal() { setShowModal(false); setForm(emptyForm); }

  async function handleSubmit(e) {
    e.preventDefault(); setIsSubmitting(true); setError('');
    const payload = {
      ...form,
      feeId: form.feeId === '' ? null : Number(form.feeId),
      amount: form.amount === '' ? null : Number(form.amount),
    };
    try {
      await createPayment(payload);
      closeModal(); await loadData();
    } catch (err) { setError(err.message || 'Không ghi nhận được thanh toán.'); }
    finally { setIsSubmitting(false); }
  }

  async function handleDelete(p) {
    if (!window.confirm('Bạn có chắc muốn xóa giao dịch này?')) return;
    setError('');
    try { await deletePayment(p.id); await loadData(); }
    catch (err) { setError(err.message || 'Không xóa được giao dịch.'); }
  }

  const fmt = (n) => n != null ? Number(n).toLocaleString('vi-VN') + ' đ' : '—';

  const filtered = payments.filter((p) =>
    (p.fee?.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.method || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.note || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <header className="page-header">
        <div><p className="eyebrow">Payment</p><h1>Quản lý thanh toán</h1></div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="secondary-button" onClick={loadData} type="button"><RefreshCcw size={17} /> Tải lại</button>
          <button className="primary-button" onClick={openCreate} type="button"><Plus size={17} /> Ghi nhận thanh toán</button>
        </div>
      </header>

      {error && <div className="alert error">{error}</div>}

      <section className="workspace-panel">
        <div className="toolbar">
          <input className="search-input" placeholder="Tìm kiếm theo khoản thu, phương thức..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <span className="count-badge">{filtered.length}</span>
        </div>

        {isLoading ? (
          <div className="loading-center"><span className="spinner" /> Đang tải...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state"><Search size={48} /><p>Chưa có dữ liệu thanh toán{search ? ' phù hợp' : ''}.</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Khoản thu</th>
                  <th>Số tiền</th>
                  <th>Phương thức</th>
                  <th>Ngày thanh toán</th>
                  <th>Ghi chú</th>
                  <th>Trạng thái</th>
                  <th aria-label="Thao tác" style={{ width: 60 }} />
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600 }}>{p.fee?.name || p.feeId || '—'}</td>
                    <td style={{ fontWeight: 700 }}>{fmt(p.amount)}</td>
                    <td>{methodMap[p.method] || p.method || '—'}</td>
                    <td>{p.paymentDate || p.createdAt || '—'}</td>
                    <td>{p.note || '—'}</td>
                    <td><span className={`status-badge ${statusCls[p.status] || 'active'}`}>{p.status === 'PAID' ? 'Đã thanh toán' : 'Đã ghi nhận'}</span></td>
                    <td>
                      <div className="row-actions">
                        <button className="icon-button danger" onClick={() => handleDelete(p)} title="Xóa"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {showModal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
          <div className="modal-panel">
            <div className="modal-header">
              <h2>Ghi nhận thanh toán</h2>
              <button className="icon-button" onClick={closeModal}><X size={18} /></button>
            </div>
            <form className="form-grid" onSubmit={handleSubmit}>
              <label>Khoản thu
                <select name="feeId" onChange={updateField} required value={form.feeId}>
                  <option value="">— Chọn khoản thu —</option>
                  {fees.map((f) => <option key={f.id} value={f.id}>{f.name} {f.amount ? `(${fmt(f.amount)})` : ''}</option>)}
                </select>
              </label>
              <label>Số tiền thanh toán (VNĐ) <input name="amount" onChange={updateField} type="number" min="0" required value={form.amount} placeholder="500000" /></label>
              <label>Phương thức
                <select name="method" onChange={updateField} value={form.method}>
                  <option value="CASH">Tiền mặt</option>
                  <option value="TRANSFER">Chuyển khoản</option>
                  <option value="QR">QR Code</option>
                </select>
              </label>
              <label>Ghi chú <input name="note" onChange={updateField} value={form.note} placeholder="Ghi chú thêm..." /></label>
              <div className="modal-footer" style={{ margin: 0, padding: 0, border: 'none' }}>
                <button className="secondary-button" onClick={closeModal} type="button">Hủy</button>
                <button className="primary-button" disabled={isSubmitting} type="submit">
                  {isSubmitting ? <><span className="spinner" /> Đang lưu...</> : 'Ghi nhận thanh toán'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default PaymentsPage;
