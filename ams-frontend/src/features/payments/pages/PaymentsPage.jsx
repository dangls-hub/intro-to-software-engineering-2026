import { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Copy,
  Plus,
  QrCode,
  RefreshCcw,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { createPayment, deletePayment, fetchPayments } from '../api/paymentsApi';
import { fetchFees, fetchFeesByApartment } from '../../fees/api/feesApi';
import { useToast } from '../../../components/ui/Toast';
import { useAuth } from '../../../store/authStore';
import { apiClient } from '../../../lib/apiClient';

const emptyForm = { feeId: '', amount: '', paymentMethod: 'CASH', note: '' };

const paymentConfig = {
  bankId: import.meta.env.VITE_PAYMENT_BANK_ID ?? '',
  accountNo: import.meta.env.VITE_PAYMENT_ACCOUNT_NO ?? '',
  accountName: import.meta.env.VITE_PAYMENT_ACCOUNT_NAME ?? 'BlueMoon AMS',
  template: import.meta.env.VITE_PAYMENT_QR_TEMPLATE ?? 'compact2',
  contentPrefix: import.meta.env.VITE_PAYMENT_CONTENT_PREFIX ?? 'BLUEMOON',
};

const methodMap = {
  CASH: 'Tiền mặt',
  TRANSFER: 'Chuyển khoản',
  BANK_TRANSFER: 'Chuyển khoản',
  QR: 'QR Code',
  MOMO: 'Ví MoMo',
  VNPAY: 'VNPay',
};
const statusCls = { PAID: 'paid', PENDING: 'pending' };

function amountOf(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function buildTransferContent(fee, user) {
  const aptCode = user?.apartmentCode || `APT${user?.apartmentId || ''}`;
  return `${paymentConfig.contentPrefix} ${aptCode} FEE${fee.id}`;
}

function buildQrUrl(fee, amount, user) {
  if (!paymentConfig.bankId || !paymentConfig.accountNo) return '';

  const params = new URLSearchParams({
    amount: String(Math.round(amount)),
    addInfo: buildTransferContent(fee, user),
    accountName: paymentConfig.accountName,
  });

  return `https://img.vietqr.io/image/${encodeURIComponent(paymentConfig.bankId)}-${encodeURIComponent(paymentConfig.accountNo)}-${encodeURIComponent(paymentConfig.template)}.png?${params.toString()}`;
}

function PaymentsPage({ role }) {
  const { user } = useAuth();
  const isResident = role === 'RESIDENT';
  const residentAptId = user?.apartmentId;
  const [payments, setPayments] = useState([]);
  const [fees, setFees] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [showModal, setShowModal] = useState(false);
  const [activeQrFee, setActiveQrFee] = useState(null);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const showToast = useToast();

  async function loadData() {
    setIsLoading(true); setError('');

    let paymentsPromise;
    let feesPromise;
    if (isResident) {
      paymentsPromise = residentAptId
        ? apiClient(`/payments/by-apartment/${residentAptId}`).then((res) => res.data || [])
        : Promise.resolve([]);
      feesPromise = residentAptId ? fetchFeesByApartment(residentAptId) : Promise.resolve([]);
    } else {
      paymentsPromise = fetchPayments();
      feesPromise = fetchFees();
    }

    const [pRes, fRes] = await Promise.allSettled([paymentsPromise, feesPromise]);
    if (pRes.status === 'fulfilled') setPayments(pRes.value);
    else { setPayments([]); setError(pRes.reason?.message || 'Không tải được danh sách thanh toán.'); }
    if (fRes.status === 'fulfilled') setFees(fRes.value);
    else if (!error) setError(fRes.reason?.message || 'Không tải được danh sách khoản thu.');
    setIsLoading(false);
  }

  useEffect(() => { loadData(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function updateField(e) { setForm((p) => ({ ...p, [e.target.name]: e.target.value })); }
  function openCreate() { setForm(emptyForm); setShowModal(true); }
  function closeModal() { setShowModal(false); setForm(emptyForm); }
  function closeQrModal() { setActiveQrFee(null); }

  async function handleSubmit(e) {
    e.preventDefault(); setIsSubmitting(true); setError('');
    const payload = {
      feeId: form.feeId === '' ? null : Number(form.feeId),
      amount: form.amount === '' ? null : Number(form.amount),
      paymentMethod: form.paymentMethod,
      note: form.note,
    };
    try {
      await createPayment(payload);
      closeModal(); await loadData();
      showToast('Ghi nhận thanh toán thành công!', 'success');
    } catch (err) { setError(err.message || 'Không ghi nhận được thanh toán.'); showToast(err.message || 'Không ghi nhận được thanh toán.', 'error'); }
    finally { setIsSubmitting(false); }
  }

  async function handleDelete(p) {
    if (!window.confirm('Bạn có chắc muốn xóa giao dịch này?')) return;
    setError('');
    try { await deletePayment(p.id); await loadData(); showToast('Xóa giao dịch thành công!', 'success'); }
    catch (err) { setError(err.message || 'Không xóa được giao dịch.'); showToast(err.message || 'Không xóa được giao dịch.', 'error'); }
  }

  const fmt = (n) => n != null ? Number(n).toLocaleString('vi-VN') + ' đ' : '—';

  const paidByFeeId = useMemo(() => payments.reduce((acc, payment) => {
    acc[payment.feeId] = (acc[payment.feeId] || 0) + amountOf(payment.amount);
    return acc;
  }, {}), [payments]);

  function remainingForFee(fee) {
    return Math.max(0, amountOf(fee.amount) - (paidByFeeId[fee.id] || 0));
  }

  const payableFees = useMemo(
    () => fees.filter((fee) => fee.status !== 'PAID' && remainingForFee(fee) > 0),
    [fees, paidByFeeId],
  );

  const filtered = payments.filter((p) =>
    (p.feeName || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.paymentMethod || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.note || '').toLowerCase().includes(search.toLowerCase())
  );

  const qrAmount = activeQrFee ? remainingForFee(activeQrFee) : 0;
  const transferContent = activeQrFee ? buildTransferContent(activeQrFee, user) : '';
  const qrUrl = activeQrFee ? buildQrUrl(activeQrFee, qrAmount, user) : '';
  const qrConfigured = Boolean(paymentConfig.bankId && paymentConfig.accountNo);

  async function copyTransferContent() {
    if (!transferContent) return;
    try {
      await navigator.clipboard.writeText(transferContent);
      showToast('Đã sao chép nội dung chuyển khoản.', 'success');
    } catch {
      showToast('Không sao chép được. Vui lòng copy thủ công.', 'error');
    }
  }

  async function copyAmount() {
    if (!qrAmount) return;
    try {
      await navigator.clipboard.writeText(String(Math.round(qrAmount)));
      showToast('Đã sao chép số tiền.', 'success');
    } catch {
      showToast('Không sao chép được. Vui lòng copy thủ công.', 'error');
    }
  }

  function confirmTransfer() {
    showToast('Sau khi chuyển khoản, ban quản lý sẽ đối soát và ghi nhận giao dịch.', 'success');
    closeQrModal();
  }

  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow">{isResident ? 'My Payments' : 'Payment'}</p>
          <h1>{isResident ? 'Thanh toán của tôi' : 'Quản lý thanh toán'}</h1>
        </div>
        <div className="page-header-actions">
          <button className="secondary-button" onClick={loadData} type="button"><RefreshCcw size={17} /> Tải lại</button>
          {!isResident && <button className="primary-button" onClick={openCreate} type="button"><Plus size={17} /> Ghi nhận thanh toán</button>}
        </div>
      </header>

      {error && <div className="alert error">{error}</div>}

      {isResident && (
        <section className="workspace-panel" style={{ marginBottom: 20 }}>
          <div className="panel-heading">
            <div>
              <p className="eyebrow" style={{ marginBottom: 4 }}>QR Banking</p>
              <h2>Khoản cần thanh toán</h2>
            </div>
            <span className="count-badge">{isLoading ? '…' : payableFees.length}</span>
          </div>

          {!residentAptId ? (
            <div className="empty-state">
              <QrCode size={44} />
              <p>Bạn cần được gán căn hộ trước khi tạo mã QR thanh toán.</p>
            </div>
          ) : isLoading ? (
            <div className="loading-center"><span className="spinner" /> Đang tải khoản cần thanh toán...</div>
          ) : payableFees.length === 0 ? (
            <div className="empty-state">
              <CheckCircle2 size={44} />
              <p>Không có khoản thu nào cần thanh toán.</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Khoản thu</th>
                    <th>Số tiền còn lại</th>
                    <th>Hạn nộp</th>
                    <th>Trạng thái</th>
                    <th aria-label="Thanh toán" />
                  </tr>
                </thead>
                <tbody>
                  {payableFees.map((fee) => (
                    <tr key={fee.id}>
                      <td style={{ fontWeight: 700 }}>{fee.name || '—'}</td>
                      <td style={{ fontWeight: 800 }}>{fmt(remainingForFee(fee))}</td>
                      <td>{fee.dueDate || '—'}</td>
                      <td><span className={`status-badge ${statusCls[fee.status] || 'pending'}`}>{fee.status === 'PARTIAL' ? 'Thu một phần' : 'Chưa thu'}</span></td>
                      <td>
                        <div className="row-actions">
                          <button
                            className="secondary-button"
                            onClick={() => setActiveQrFee(fee)}
                            type="button"
                            title="Tạo mã QR thanh toán"
                          >
                            <QrCode size={15} />
                            Tạo QR
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

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
                  {!isResident && <th aria-label="Thao tác" style={{ width: 60 }} />}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600 }}>{p.feeName || p.feeId || '—'}</td>
                    <td style={{ fontWeight: 700 }}>{fmt(p.amount)}</td>
                    <td>{methodMap[p.paymentMethod] || p.paymentMethod || '—'}</td>
                    <td>{p.paymentDate || p.createdAt || '—'}</td>
                    <td>{p.note || '—'}</td>
                    <td><span className={`status-badge ${statusCls[p.status] || 'active'}`}>{p.status === 'PAID' ? 'Đã thanh toán' : 'Đã ghi nhận'}</span></td>
                    {!isResident && (
                    <td>
                      <div className="row-actions">
                        <button className="icon-button danger" onClick={() => handleDelete(p)} title="Xóa"><Trash2 size={15} /></button>
                      </div>
                    </td>
                    )}
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
                <select name="paymentMethod" onChange={updateField} value={form.paymentMethod}>
                  <option value="CASH">Tiền mặt</option>
                  <option value="BANK_TRANSFER">Chuyển khoản</option>
                  <option value="MOMO">Ví MoMo</option>
                  <option value="VNPAY">VNPay</option>
                </select>
              </label>
              <label>Ghi chú <input name="note" onChange={updateField} value={form.note} placeholder="Ghi chú thêm..." /></label>
              <div className="modal-footer">
                <button className="secondary-button" onClick={closeModal} type="button">Hủy</button>
                <button className="primary-button" disabled={isSubmitting} type="submit">
                  {isSubmitting ? <><span className="spinner" /> Đang lưu...</> : 'Ghi nhận thanh toán'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeQrFee && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) closeQrModal(); }}>
          <div className="modal-panel">
            <div className="modal-header">
              <h2>Thanh toán bằng QR</h2>
              <button className="icon-button" onClick={closeQrModal} type="button"><X size={18} /></button>
            </div>

            {!qrConfigured ? (
              <div className="alert error" style={{ marginBottom: 16 }}>
                Chưa cấu hình tài khoản nhận tiền. Cập nhật VITE_PAYMENT_BANK_ID và VITE_PAYMENT_ACCOUNT_NO trong .env.
              </div>
            ) : (
              <div style={{ display: 'grid', placeItems: 'center', marginBottom: 18 }}>
                <img
                  alt={`QR thanh toán ${activeQrFee.name}`}
                  src={qrUrl}
                  style={{
                    width: 'min(100%, 320px)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    background: '#fff',
                    padding: 10,
                  }}
                />
              </div>
            )}

            <div className="form-grid">
              <label>
                Khoản thu
                <input readOnly value={activeQrFee.name || ''} />
              </label>
              <label>
                Số tiền
                <div style={{ display: 'flex', gap: 8 }}>
                  <input readOnly value={fmt(qrAmount)} />
                  <button className="secondary-button" onClick={copyAmount} type="button" title="Sao chép số tiền">
                    <Copy size={15} />
                  </button>
                </div>
              </label>
              <label>
                Nội dung chuyển khoản
                <div style={{ display: 'flex', gap: 8 }}>
                  <input readOnly value={transferContent} />
                  <button className="secondary-button" onClick={copyTransferContent} type="button" title="Sao chép nội dung">
                    <Copy size={15} />
                  </button>
                </div>
              </label>
              <label>
                Tài khoản nhận
                <input readOnly value={qrConfigured ? `${paymentConfig.accountNo} - ${paymentConfig.accountName}` : 'Chưa cấu hình'} />
              </label>
            </div>

            <p className="muted-text" style={{ marginTop: 16 }}>
              Sau khi chuyển khoản, giao dịch sẽ xuất hiện khi ban quản lý đối soát và ghi nhận thanh toán.
            </p>

            <div className="modal-footer">
              <button className="secondary-button" onClick={closeQrModal} type="button">Đóng</button>
              <button className="primary-button" onClick={confirmTransfer} type="button">
                <CheckCircle2 size={17} />
                Tôi đã chuyển khoản
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default PaymentsPage;
