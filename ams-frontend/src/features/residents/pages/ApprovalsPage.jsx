import { useEffect, useState } from 'react';
import { Check, CreditCard, Eye, RefreshCcw, Search, X, XCircle, AlertTriangle } from 'lucide-react';
import {
  approveResident,
  fetchPendingResidents,
  rejectResident,
} from '../api/residentsApi';
import { useToast } from '../../../components/ui/Toast';

const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') ?? '';

const approvalMap = {
  PENDING: { label: 'Chờ duyệt', cls: 'pending' },
  APPROVED: { label: 'Đã duyệt', cls: 'approved' },
  REJECTED: { label: 'Từ chối', cls: 'rejected' },
};

function cccdImageUrl(path) {
  if (!path) return null;
  return `${API_BASE}/${path}`;
}

function ApprovalsPage() {
  const [residents, setResidents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [rejectModal, setRejectModal] = useState(null); // { id, fullName }
  const [rejectReason, setRejectReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(null); // id being processed
  const [cccdModal, setCccdModal] = useState(null); // resident object to show CCCD
  const showToast = useToast();

  async function loadPending() {
    setIsLoading(true);
    setError('');
    try {
      setResidents(await fetchPendingResidents());
    } catch (apiError) {
      setError(apiError.message || 'Không tải được danh sách chờ duyệt.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadPending();
  }, []);

  async function handleApprove(resident) {
    setIsProcessing(resident.id);
    try {
      await approveResident(resident.id);
      showToast(`Đã duyệt cư dân "${resident.fullName}" thành công!`, 'success');
      await loadPending();
    } catch (apiError) {
      showToast(apiError.message || 'Không thể duyệt cư dân.', 'error');
    } finally {
      setIsProcessing(null);
    }
  }

  function openRejectModal(resident) {
    setRejectModal({ id: resident.id, fullName: resident.fullName });
    setRejectReason('');
  }

  function closeRejectModal() {
    setRejectModal(null);
    setRejectReason('');
  }

  async function handleRejectConfirm() {
    if (!rejectReason.trim()) {
      showToast('Vui lòng nhập lý do từ chối.', 'error');
      return;
    }
    setIsProcessing(rejectModal.id);
    try {
      await rejectResident(rejectModal.id, rejectReason.trim());
      showToast(`Đã từ chối cư dân "${rejectModal.fullName}".`, 'success');
      closeRejectModal();
      await loadPending();
    } catch (apiError) {
      showToast(apiError.message || 'Không thể từ chối cư dân.', 'error');
    } finally {
      setIsProcessing(null);
    }
  }

  const filtered = residents.filter(
    (r) =>
      (r.fullName || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.identityNumber || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.roomNumber || '').toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow">Approval</p>
          <h1>Phê duyệt cư dân</h1>
        </div>
        <button className="secondary-button" onClick={loadPending} type="button">
          <RefreshCcw size={17} aria-hidden="true" />
          Tải lại
        </button>
      </header>

      {error ? <div className="alert error">{error}</div> : null}

      <section className="workspace-panel" style={{ maxWidth: '100%' }}>
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Danh sách</p>
            <h2>Chờ phê duyệt</h2>
          </div>
          <span className="count-badge">{filtered.length}</span>
        </div>

        <div className="toolbar">
          <input
            className="search-input"
            placeholder="Tìm theo tên, CCCD, căn hộ..."
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
            <p>
              {search
                ? 'Không tìm thấy cư dân phù hợp.'
                : 'Không có yêu cầu nào chờ phê duyệt.'}
            </p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Họ tên</th>
                  <th>CCCD</th>
                  <th>Điện thoại</th>
                  <th>Căn hộ</th>
                  <th>Ảnh CCCD</th>
                  <th>Ngày tạo</th>
                  <th>Trạng thái</th>
                  <th aria-label="Thao tác" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((resident) => {
                  const st = approvalMap[resident.approvalStatus] || approvalMap.PENDING;
                  const processing = isProcessing === resident.id;
                  const hasCccd = resident.cccdFrontImage || resident.cccdBackImage;
                  return (
                    <tr key={resident.id}>
                      <td style={{ fontWeight: 700 }}>{resident.fullName || '—'}</td>
                      <td>{resident.identityNumber || '—'}</td>
                      <td>{resident.phoneNumber || '—'}</td>
                      <td>{resident.roomNumber || '—'}</td>
                      <td>
                        {hasCccd ? (
                          <button
                            className="icon-button"
                            onClick={() => setCccdModal(resident)}
                            title="Xem ảnh CCCD"
                            type="button"
                            style={{ color: 'var(--accent)' }}
                          >
                            <Eye size={16} />
                          </button>
                        ) : (
                          <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>Chưa có</span>
                        )}
                      </td>
                      <td>
                        {resident.createdAt
                          ? new Date(resident.createdAt).toLocaleDateString('vi-VN')
                          : '—'}
                      </td>
                      <td>
                        <span className={`status-badge ${st.cls}`}>{st.label}</span>
                      </td>
                      <td>
                        <div className="row-actions">
                          <button
                            className="icon-button success"
                            disabled={processing}
                            onClick={() => handleApprove(resident)}
                            title="Duyệt"
                            type="button"
                          >
                            <Check size={16} aria-hidden="true" />
                          </button>
                          <button
                            className="icon-button danger"
                            disabled={processing}
                            onClick={() => openRejectModal(resident)}
                            title="Từ chối"
                            type="button"
                          >
                            <XCircle size={16} aria-hidden="true" />
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

      {/* CCCD Image View Modal */}
      {cccdModal ? (
        <div className="modal-backdrop" onClick={() => setCccdModal(null)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="Xem ảnh CCCD"
            style={{ maxWidth: 680 }}
          >
            <div className="modal-header">
              <CreditCard size={20} style={{ color: 'var(--accent)' }} />
              <h3>Ảnh CCCD — {cccdModal.fullName}</h3>
              <button className="icon-button" onClick={() => setCccdModal(null)} type="button">
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, padding: '8px 0' }}>
              <div>
                <p style={{ margin: '0 0 6px', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Mặt trước
                </p>
                {cccdModal.cccdFrontImage ? (
                  <img
                    src={cccdImageUrl(cccdModal.cccdFrontImage)}
                    alt="CCCD mặt trước"
                    style={{
                      width: '100%',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border)',
                      objectFit: 'contain',
                      maxHeight: 260,
                      background: 'var(--bg-subtle)',
                    }}
                  />
                ) : (
                  <div style={{
                    padding: '40px 16px',
                    textAlign: 'center',
                    border: '1px dashed var(--border)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-secondary)',
                    fontSize: '0.85rem',
                  }}>
                    Chưa upload
                  </div>
                )}
              </div>
              <div>
                <p style={{ margin: '0 0 6px', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Mặt sau
                </p>
                {cccdModal.cccdBackImage ? (
                  <img
                    src={cccdImageUrl(cccdModal.cccdBackImage)}
                    alt="CCCD mặt sau"
                    style={{
                      width: '100%',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border)',
                      objectFit: 'contain',
                      maxHeight: 260,
                      background: 'var(--bg-subtle)',
                    }}
                  />
                ) : (
                  <div style={{
                    padding: '40px 16px',
                    textAlign: 'center',
                    border: '1px dashed var(--border)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-secondary)',
                    fontSize: '0.85rem',
                  }}>
                    Chưa upload
                  </div>
                )}
              </div>
            </div>

            <div className="modal-actions" style={{ marginTop: 12 }}>
              <button className="secondary-button" onClick={() => setCccdModal(null)} type="button">
                Đóng
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Reject reason modal */}
      {rejectModal ? (
        <div className="modal-backdrop" onClick={closeRejectModal}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="Nhập lý do từ chối"
          >
            <div className="modal-header">
              <AlertTriangle size={20} style={{ color: 'var(--color-danger)' }} />
              <h3>Từ chối cư dân</h3>
              <button className="icon-button" onClick={closeRejectModal} type="button">
                <X size={18} />
              </button>
            </div>
            <p style={{ margin: '0 0 1rem', opacity: 0.8 }}>
              Bạn đang từ chối yêu cầu của <strong>{rejectModal.fullName}</strong>.
              Vui lòng nhập lý do:
            </p>
            <textarea
              autoFocus
              className="reject-textarea"
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Nhập lý do từ chối..."
              rows={3}
              value={rejectReason}
            />
            <div className="modal-actions">
              <button className="secondary-button" onClick={closeRejectModal} type="button">
                Hủy
              </button>
              <button
                className="primary-button danger-button"
                disabled={!rejectReason.trim() || isProcessing === rejectModal.id}
                onClick={handleRejectConfirm}
                type="button"
              >
                {isProcessing === rejectModal.id ? 'Đang xử lý...' : 'Xác nhận từ chối'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default ApprovalsPage;
