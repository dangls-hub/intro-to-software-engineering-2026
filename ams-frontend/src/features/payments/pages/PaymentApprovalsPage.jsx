import { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Eye,
  Filter,
  Image as ImageIcon,
  RefreshCcw,
  Search,
  X,
  XCircle,
} from 'lucide-react';
import {
  fetchPaymentRequests,
  approvePaymentRequest,
  rejectPaymentRequest,
} from '../api/paymentRequestsApi';
import { useToast } from '../../../components/ui/Toast';

const statusConfig = {
  PENDING: { label: 'Chờ duyệt', cls: 'pending', icon: Clock },
  APPROVED: { label: 'Đã duyệt', cls: 'approved', icon: CheckCircle2 },
  REJECTED: { label: 'Từ chối', cls: 'rejected', icon: XCircle },
};
const methodMap = {
  CASH: 'Tiền mặt',
  BANK_TRANSFER: 'Chuyển khoản',
  MOMO: 'Ví MoMo',
  VNPAY: 'VNPay',
};

function PaymentApprovalsPage() {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [lightboxImg, setLightboxImg] = useState(null);
  const [reviewModal, setReviewModal] = useState(null); // { id, action: 'approve'|'reject' }
  const [reviewNote, setReviewNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const showToast = useToast();

  const apiBase = import.meta.env.VITE_API_BASE_URL ?? '/api/v1';

  async function loadData() {
    setIsLoading(true);
    setError('');
    try {
      const data = await fetchPaymentRequests(statusFilter || undefined);
      setRequests(data);
    } catch (err) {
      setError(err.message || 'Không tải được danh sách yêu cầu.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { loadData(); }, [statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const fmt = (n) => n != null ? Number(n).toLocaleString('vi-VN') + ' đ' : '—';

  const filtered = requests.filter((r) =>
    (r.feeName || '').toLowerCase().includes(search.toLowerCase()) ||
    (r.submittedByFullName || '').toLowerCase().includes(search.toLowerCase()) ||
    (r.apartmentCode || '').toLowerCase().includes(search.toLowerCase())
  );

  function openReview(id, action) {
    setReviewModal({ id, action });
    setReviewNote('');
  }

  function closeReview() {
    setReviewModal(null);
    setReviewNote('');
  }

  async function handleReview() {
    if (!reviewModal) return;
    setIsSubmitting(true);
    try {
      if (reviewModal.action === 'approve') {
        await approvePaymentRequest(reviewModal.id, reviewNote);
        showToast('Đã duyệt yêu cầu thanh toán!', 'success');
      } else {
        await rejectPaymentRequest(reviewModal.id, reviewNote);
        showToast('Đã từ chối yêu cầu thanh toán.', 'warning');
      }
      closeReview();
      await loadData();
    } catch (err) {
      showToast(err.message || 'Không thể xử lý yêu cầu.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  }

  const pendingCount = requests.filter((r) => r.status === 'PENDING').length;

  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow"><Clock size={12} /> Phê duyệt</p>
          <h1>Duyệt yêu cầu thanh toán</h1>
        </div>
        <div className="page-header-actions">
          <button className="secondary-button" onClick={loadData} type="button"><RefreshCcw size={17} /> Tải lại</button>
          {pendingCount > 0 && (
            <span className="count-badge" style={{ background: 'var(--warning-bg)', color: 'var(--warning)' }}>
              {pendingCount} chờ duyệt
            </span>
          )}
        </div>
      </header>

      {error && <div className="alert error">{error}</div>}

      {/* Toolbar: search + status filter */}
      <div className="toolbar" style={{ marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <input
          className="search-input"
          placeholder="Tìm theo khoản thu, cư dân, căn hộ..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <Filter size={14} style={{ color: 'var(--text-muted)' }} />
          {['', 'PENDING', 'APPROVED', 'REJECTED'].map((s) => (
            <button
              key={s}
              className={`filter-chip ${statusFilter === s ? 'filter-chip--active' : ''}`}
              onClick={() => setStatusFilter(s)}
              type="button"
            >
              {s === '' ? 'Tất cả' : statusConfig[s]?.label}
            </button>
          ))}
        </div>
        <span className="count-badge">{filtered.length}</span>
      </div>

      {/* Table */}
      <section className="workspace-panel">
        {isLoading ? (
          <div className="loading-center"><span className="spinner" /> Đang tải...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <Search size={48} />
            <p>{search || statusFilter ? 'Không tìm thấy yêu cầu phù hợp.' : 'Chưa có yêu cầu thanh toán nào.'}</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Cư dân</th>
                  <th>Căn hộ</th>
                  <th>Khoản thu</th>
                  <th>Số tiền</th>
                  <th>Phương thức</th>
                  <th>Ngày gửi</th>
                  <th>Biên lai</th>
                  <th>Trạng thái</th>
                  <th aria-label="Thao tác" style={{ width: 120 }} />
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  const st = statusConfig[r.status] || statusConfig.PENDING;
                  return (
                    <tr key={r.id}>
                      <td style={{ fontWeight: 600 }}>{r.submittedByFullName || r.submittedByUsername || '—'}</td>
                      <td>{r.apartmentCode || '—'}</td>
                      <td style={{ fontWeight: 600 }}>{r.feeName || '—'}</td>
                      <td style={{ fontWeight: 700 }}>{fmt(r.amount)}</td>
                      <td>{methodMap[r.paymentMethod] || r.paymentMethod || '—'}</td>
                      <td>{r.createdAt ? new Date(r.createdAt).toLocaleDateString('vi-VN') : '—'}</td>
                      <td>
                        {r.proofImageUrl ? (
                          <button
                            className="proof-thumb-btn"
                            onClick={() => setLightboxImg(`${apiBase}${r.proofImageUrl}`)}
                            type="button"
                            title="Xem ảnh biên lai"
                          >
                            <Eye size={14} />
                            Xem
                          </button>
                        ) : (
                          <span className="muted-text" style={{ fontSize: '0.82rem' }}>Không có</span>
                        )}
                      </td>
                      <td><span className={`status-badge ${st.cls}`}>{st.label}</span></td>
                      <td>
                        {r.status === 'PENDING' ? (
                          <div className="row-actions">
                            <button
                              className="icon-button success"
                              onClick={() => openReview(r.id, 'approve')}
                              title="Duyệt"
                              type="button"
                            >
                              <CheckCircle2 size={15} />
                            </button>
                            <button
                              className="icon-button danger"
                              onClick={() => openReview(r.id, 'reject')}
                              title="Từ chối"
                              type="button"
                            >
                              <XCircle size={15} />
                            </button>
                          </div>
                        ) : (
                          <span className="muted-text" style={{ fontSize: '0.78rem' }}>
                            {r.reviewedByUsername ? `bởi ${r.reviewedByUsername}` : ''}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Review modal */}
      {reviewModal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) closeReview(); }}>
          <div className="modal-panel">
            <div className="modal-header">
              <h2>{reviewModal.action === 'approve' ? 'Duyệt yêu cầu' : 'Từ chối yêu cầu'}</h2>
              <button className="icon-button" onClick={closeReview} type="button"><X size={18} /></button>
            </div>
            <div className="form-grid">
              <label>
                Ghi chú (tùy chọn)
                <textarea
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  placeholder={reviewModal.action === 'approve'
                    ? 'VD: Đã xác nhận biên lai chuyển khoản...'
                    : 'VD: Ảnh biên lai không rõ, vui lòng gửi lại...'}
                  rows={3}
                  style={{ resize: 'vertical' }}
                />
              </label>
            </div>
            <div className="modal-footer">
              <button className="secondary-button" onClick={closeReview} type="button">Hủy</button>
              <button
                className={`primary-button ${reviewModal.action === 'reject' ? 'primary-button--danger' : ''}`}
                disabled={isSubmitting}
                onClick={handleReview}
                type="button"
              >
                {isSubmitting ? (
                  <><span className="spinner" /> Đang xử lý...</>
                ) : reviewModal.action === 'approve' ? (
                  <><CheckCircle2 size={17} /> Duyệt</>
                ) : (
                  <><XCircle size={17} /> Từ chối</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
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

export default PaymentApprovalsPage;
