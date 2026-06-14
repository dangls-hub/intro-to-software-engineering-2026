import { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Copy,
  Image as ImageIcon,
  Plus,
  QrCode,
  RefreshCcw,
  Search,
  Trash2,
  Upload,
  X,
  XCircle,
} from 'lucide-react';
import { createPayment, deletePayment, fetchPayments } from '../api/paymentsApi';
import { fetchFees, fetchFeesByApartment } from '../../fees/api/feesApi';
import { submitPaymentRequest, fetchMyPaymentRequests } from '../api/paymentRequestsApi';
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
const reqStatusMap = {
  PENDING: { label: 'Chờ duyệt', cls: 'pending' },
  APPROVED: { label: 'Đã duyệt', cls: 'approved' },
  REJECTED: { label: 'Bị từ chối', cls: 'rejected' },
};

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

  // Upload proof states
  const [proofFile, setProofFile] = useState(null);
  const [proofPreview, setProofPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStep, setUploadStep] = useState('qr'); // 'qr' | 'upload'

  // Resident's payment requests
  const [myRequests, setMyRequests] = useState([]);
  const [lightboxImg, setLightboxImg] = useState(null);

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

    // Load resident's payment requests
    if (isResident) {
      try {
        const reqs = await fetchMyPaymentRequests();
        setMyRequests(reqs);
      } catch { /* ignore */ }
    }

    setIsLoading(false);
  }

  useEffect(() => { loadData(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function updateField(e) { setForm((p) => ({ ...p, [e.target.name]: e.target.value })); }
  function openCreate() { setForm(emptyForm); setShowModal(true); }
  function closeModal() { setShowModal(false); setForm(emptyForm); }

  function closeQrModal() {
    setActiveQrFee(null);
    setProofFile(null);
    setProofPreview(null);
    setUploadStep('qr');
  }

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

  // --- Upload proof flow ---

  function handleProofFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Chỉ chấp nhận file ảnh (JPG, PNG, WEBP).', 'error');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      showToast('File quá lớn (tối đa 10MB).', 'error');
      return;
    }
    setProofFile(file);
    setProofPreview(URL.createObjectURL(file));
  }

  function clearProofFile() {
    setProofFile(null);
    if (proofPreview) URL.revokeObjectURL(proofPreview);
    setProofPreview(null);
  }

  async function handleSubmitProof() {
    if (!proofFile || !activeQrFee) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('feeId', activeQrFee.id);
      formData.append('amount', String(Math.round(qrAmount)));
      formData.append('paymentMethod', 'BANK_TRANSFER');
      formData.append('note', `Chuyển khoản QR — ${transferContent}`);
      formData.append('proofImage', proofFile);

      await submitPaymentRequest(formData);
      showToast('Đã gửi yêu cầu thanh toán! Vui lòng chờ admin duyệt.', 'success');
      closeQrModal();
      await loadData();
    } catch (err) {
      showToast(err.message || 'Không gửi được yêu cầu. Vui lòng thử lại.', 'error');
    } finally {
      setIsUploading(false);
    }
  }

  const apiBase = import.meta.env.VITE_API_BASE_URL ?? '/api/v1';

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

      {/* ── Resident: Khoản cần thanh toán + QR ── */}
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
                            onClick={() => { setActiveQrFee(fee); setUploadStep('qr'); }}
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

      {/* ── Resident: Lịch sử yêu cầu thanh toán ── */}
      {isResident && myRequests.length > 0 && (
        <section className="workspace-panel" style={{ marginBottom: 20 }}>
          <div className="panel-heading">
            <div>
              <p className="eyebrow" style={{ marginBottom: 4 }}>Yêu cầu thanh toán</p>
              <h2>Lịch sử gửi yêu cầu</h2>
            </div>
            <span className="count-badge">{myRequests.length}</span>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Khoản thu</th>
                  <th>Số tiền</th>
                  <th>Ngày gửi</th>
                  <th>Biên lai</th>
                  <th>Trạng thái</th>
                  <th>Ghi chú admin</th>
                </tr>
              </thead>
              <tbody>
                {myRequests.map((r) => {
                  const st = reqStatusMap[r.status] || { label: r.status, cls: 'pending' };
                  return (
                    <tr key={r.id}>
                      <td style={{ fontWeight: 600 }}>{r.feeName || '—'}</td>
                      <td style={{ fontWeight: 700 }}>{fmt(r.amount)}</td>
                      <td>{r.createdAt ? new Date(r.createdAt).toLocaleDateString('vi-VN') : '—'}</td>
                      <td>
                        {r.proofImageUrl ? (
                          <button
                            className="proof-thumb-btn"
                            onClick={() => setLightboxImg(`${apiBase}${r.proofImageUrl}`)}
                            type="button"
                            title="Xem ảnh biên lai"
                          >
                            <ImageIcon size={14} />
                            Xem ảnh
                          </button>
                        ) : '—'}
                      </td>
                      <td><span className={`status-badge ${st.cls}`}>{st.label}</span></td>
                      <td style={{ maxWidth: 200 }}>{r.reviewNote || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ── Payment history table ── */}
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

      {/* ── Admin: Create payment modal ── */}
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

      {/* ── QR Modal with Upload Proof ── */}
      {activeQrFee && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) closeQrModal(); }}>
          <div className="modal-panel">
            <div className="modal-header">
              <h2>{uploadStep === 'qr' ? 'Thanh toán bằng QR' : 'Upload biên lai'}</h2>
              <button className="icon-button" onClick={closeQrModal} type="button"><X size={18} /></button>
            </div>

            {uploadStep === 'qr' ? (
              <>
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
                  Sau khi chuyển khoản, vui lòng upload ảnh chụp màn hình biên lai để gửi yêu cầu xác nhận.
                </p>

                <div className="modal-footer">
                  <button className="secondary-button" onClick={closeQrModal} type="button">Đóng</button>
                  <button className="primary-button" onClick={() => setUploadStep('upload')} type="button">
                    <Upload size={17} />
                    Tôi đã chuyển khoản
                  </button>
                </div>
              </>
            ) : (
              /* Upload proof step */
              <>
                <div className="upload-proof-area">
                  {proofPreview ? (
                    <div className="proof-preview-container">
                      <img src={proofPreview} alt="Biên lai thanh toán" className="proof-preview-img" />
                      <button className="proof-remove-btn" onClick={clearProofFile} type="button" title="Xóa ảnh">
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <label className="upload-drop-zone" htmlFor="proof-upload-input">
                      <Upload size={32} />
                      <p style={{ fontWeight: 700 }}>Chọn hoặc kéo thả ảnh biên lai</p>
                      <p className="muted-text" style={{ fontSize: '0.82rem' }}>JPG, PNG, WEBP — tối đa 10MB</p>
                      <input
                        id="proof-upload-input"
                        type="file"
                        accept="image/*"
                        onChange={handleProofFileChange}
                        style={{ display: 'none' }}
                      />
                    </label>
                  )}
                </div>

                <div className="form-grid" style={{ marginTop: 16 }}>
                  <label>
                    Khoản thu
                    <input readOnly value={activeQrFee.name || ''} />
                  </label>
                  <label>
                    Số tiền thanh toán
                    <input readOnly value={fmt(qrAmount)} />
                  </label>
                </div>

                <p className="muted-text" style={{ marginTop: 16 }}>
                  Upload ảnh chụp màn hình giao dịch chuyển khoản thành công. Ban quản lý sẽ xác nhận và ghi nhận thanh toán cho bạn.
                </p>

                <div className="modal-footer">
                  <button className="secondary-button" onClick={() => { setUploadStep('qr'); clearProofFile(); }} type="button">Quay lại</button>
                  <button
                    className="primary-button"
                    disabled={!proofFile || isUploading}
                    onClick={handleSubmitProof}
                    type="button"
                  >
                    {isUploading ? <><span className="spinner" /> Đang gửi...</> : <><CheckCircle2 size={17} /> Gửi yêu cầu</>}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Lightbox ── */}
      {lightboxImg && (
        <div className="lightbox-overlay" onClick={() => setLightboxImg(null)}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={() => setLightboxImg(null)} type="button"><X size={22} /></button>
            <img src={lightboxImg} alt="Biên lai thanh toán" className="lightbox-img" />
          </div>
        </div>
      )}
    </>
  );
}

export default PaymentsPage;
