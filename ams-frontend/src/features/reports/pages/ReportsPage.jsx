import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Clock, Edit3, MessageSquare, RefreshCcw, Search, XCircle } from 'lucide-react';
import { fetchReports, reviewReport } from '../api/reportsApi';
import { useToast } from '../../../components/ui/Toast';

const typeMap = {
  REFLECT: { label: 'Phản ánh', color: 'var(--info)' },
  REPAIR: { label: 'Sửa chữa', color: 'var(--warning)' },
  COMPLAINT: { label: 'Khiếu nại', color: 'var(--accent)' },
  OTHER: { label: 'Khác', color: 'var(--text-muted)' },
};

const statusMap = {
  PENDING: { label: 'Chờ tiếp nhận', cls: 'pending', icon: Clock },
  IN_PROGRESS: { label: 'Đang xử lý', cls: 'info', icon: AlertCircle },
  RESOLVED: { label: 'Đã giải quyết', cls: 'paid', icon: CheckCircle },
  REJECTED: { label: 'Từ chối', cls: 'overdue', icon: XCircle },
};

function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({ status: 'RESOLVED', resolveNote: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const showToast = useToast();

  async function loadReports() {
    setIsLoading(true);
    setError('');
    try {
      const data = await fetchReports(statusFilter);
      setReports(data);
    } catch (err) {
      setError(err.message || 'Không tải được danh sách phản ánh.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadReports();
  }, [statusFilter]);

  async function handleStatusChange(status, note = '') {
    if (!selectedReport) return;
    setIsSubmitting(true);
    try {
      const updated = await reviewReport(selectedReport.id, { status, resolveNote: note });
      showToast('Cập nhật trạng thái phản ánh thành công!', 'success');
      setSelectedReport(updated);
      setShowReviewModal(false);
      await loadReports();
    } catch (err) {
      showToast(err.message || 'Không cập nhật được trạng thái.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  }

  function openReviewModal(targetStatus) {
    setReviewForm({ status: targetStatus, resolveNote: '' });
    setShowReviewModal(true);
  }

  function handleReviewSubmit(e) {
    e.preventDefault();
    if (reviewForm.status === 'REJECTED' && !reviewForm.resolveNote.trim()) {
      showToast('Vui lòng nhập lý do từ chối', 'warning');
      return;
    }
    handleStatusChange(reviewForm.status, reviewForm.resolveNote);
  }

  const fmtDate = (d) => {
    if (!d) return '—';
    try {
      return new Date(d).toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return d;
    }
  };

  const filtered = reports.filter((r) =>
    (r.title || '').toLowerCase().includes(search.toLowerCase()) ||
    (r.content || '').toLowerCase().includes(search.toLowerCase()) ||
    (r.submittedByName || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow">Resident Reports</p>
          <h1>Quản lý ý kiến & Phản ánh</h1>
        </div>
        <div className="page-header-actions">
          <button className="secondary-button" onClick={loadReports} type="button">
            <RefreshCcw size={17} /> Tải lại
          </button>
        </div>
      </header>

      {error && <div className="alert error">{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: selectedReport ? '1.2fr 1fr' : '1fr', gap: '24px', alignItems: 'start' }}>
        <section className="workspace-panel">
          <div className="toolbar" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '12px', flex: 1, minWidth: '300px' }}>
              <input
                className="search-input"
                placeholder="Tìm theo tiêu đề, nội dung, người gửi..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ flex: 1 }}
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ width: '180px', minHeight: '40px' }}
              >
                <option value="">— Tất cả trạng thái —</option>
                <option value="PENDING">Chờ tiếp nhận</option>
                <option value="IN_PROGRESS">Đang xử lý</option>
                <option value="RESOLVED">Đã giải quyết</option>
                <option value="REJECTED">Từ chối</option>
              </select>
            </div>
            <span className="count-badge">{filtered.length}</span>
          </div>

          {isLoading ? (
            <div className="loading-center">
              <span className="spinner" /> Đang tải...
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <Search size={48} />
              <p>Không tìm thấy phản ánh nào phù hợp.</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Người gửi</th>
                    <th>Tiêu đề</th>
                    <th>Phân loại</th>
                    <th>Ngày gửi</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => {
                    const st = statusMap[r.status] || { label: r.status, cls: 'inactive', icon: Clock };
                    const tp = typeMap[r.type] || { label: r.type, color: 'var(--text-muted)' };
                    const isSelected = selectedReport?.id === r.id;
                    return (
                      <tr
                        key={r.id}
                        onClick={() => setSelectedReport(r)}
                        style={{
                          cursor: 'pointer',
                          background: isSelected ? 'var(--accent-subtle)' : '',
                        }}
                      >
                        <td style={{ fontWeight: 600 }}>{r.submittedByName || 'Ẩn danh'}</td>
                        <td>{r.title}</td>
                        <td>
                          <span style={{ color: tp.color, fontWeight: 600 }}>{tp.label}</span>
                        </td>
                        <td>{fmtDate(r.createdAt)}</td>
                        <td>
                          <span className={`status-badge ${st.cls}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <st.icon size={13} />
                            {st.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {selectedReport && (
          <section className="workspace-panel liquid-glass" style={{ padding: '24px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--text-heading)' }}>Chi tiết phản ánh</h2>
              <button className="icon-button" onClick={() => setSelectedReport(null)} type="button">
                <XCircle size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Người gửi</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
                  {selectedReport.submittedByName} ({selectedReport.submittedByEmail})
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tiêu đề</div>
                <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px' }}>{selectedReport.title}</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Phân loại</div>
                  <div style={{ fontWeight: 600, color: typeMap[selectedReport.type]?.color || 'var(--text-primary)', marginTop: '4px' }}>
                    {typeMap[selectedReport.type]?.label || selectedReport.type}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Trạng thái</div>
                  <div style={{ marginTop: '4px' }}>
                    <span className={`status-badge ${(statusMap[selectedReport.status] || {}).cls || 'inactive'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      {(() => {
                        const Icon = (statusMap[selectedReport.status] || {}).icon || Clock;
                        return <Icon size={13} />;
                      })()}
                      {(statusMap[selectedReport.status] || {}).label || selectedReport.status}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ngày gửi</div>
                  <div style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>{fmtDate(selectedReport.createdAt)}</div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nội dung phản ánh</div>
                <div
                  style={{
                    color: 'var(--text-primary)',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    padding: '12px',
                    marginTop: '6px',
                    whiteSpace: 'pre-wrap',
                    lineHeight: '1.5',
                  }}
                >
                  {selectedReport.content}
                </div>
              </div>

              {/* Action buttons based on current status */}
              {selectedReport.status === 'PENDING' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                  <button
                    className="primary-button"
                    onClick={() => handleStatusChange('IN_PROGRESS')}
                    disabled={isSubmitting}
                    type="button"
                    style={{ background: 'var(--info)', borderColor: 'var(--info)' }}
                  >
                    Tiếp nhận xử lý
                  </button>
                  <button
                    className="secondary-button"
                    onClick={() => openReviewModal('REJECTED')}
                    disabled={isSubmitting}
                    type="button"
                    style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}
                  >
                    Từ chối
                  </button>
                </div>
              )}

              {selectedReport.status === 'IN_PROGRESS' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px', marginTop: '12px' }}>
                  <button
                    className="primary-button"
                    onClick={() => openReviewModal('RESOLVED')}
                    disabled={isSubmitting}
                    type="button"
                  >
                    Đánh dấu đã giải quyết
                  </button>
                  <button
                    className="secondary-button"
                    onClick={() => openReviewModal('REJECTED')}
                    disabled={isSubmitting}
                    type="button"
                    style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}
                  >
                    Từ chối
                  </button>
                </div>
              )}

              {/* Resolved details display */}
              {(selectedReport.status === 'RESOLVED' || selectedReport.status === 'REJECTED' || selectedReport.resolveNote) && (
                <div style={{ borderTop: '1px dashed var(--border)', paddingTop: '16px', marginTop: '8px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Chi tiết xử lý phản ánh {selectedReport.resolvedByName ? `(${selectedReport.resolvedByName})` : ''}
                  </div>
                  <div
                    style={{
                      color: 'var(--accent)',
                      background: 'var(--accent-subtle)',
                      border: '1px solid rgba(201,169,110,0.2)',
                      borderRadius: '8px',
                      padding: '12px',
                      marginTop: '6px',
                      whiteSpace: 'pre-wrap',
                      fontWeight: 500,
                    }}
                  >
                    {selectedReport.resolveNote || 'Không có ghi chú.'}
                  </div>
                  {selectedReport.resolvedAt && (
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '6px', textAlign: 'right' }}>
                      Đã xử lý lúc: {fmtDate(selectedReport.resolvedAt)}
                    </div>
                  )}

                  {/* Allow updating response if needed */}
                  <button
                    className="secondary-button"
                    onClick={() => openReviewModal(selectedReport.status)}
                    style={{ marginTop: '12px', width: '100%', fontSize: '0.8rem' }}
                    type="button"
                  >
                    <Edit3 size={12} /> Cập nhật ghi chú phản hồi
                  </button>
                </div>
              )}
            </div>
          </section>
        )}
      </div>

      {showReviewModal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowReviewModal(false); }}>
          <div className="modal-panel">
            <div className="modal-header">
              <h2>
                {reviewForm.status === 'RESOLVED'
                  ? 'Giải quyết phản ánh'
                  : reviewForm.status === 'REJECTED'
                  ? 'Từ chối phản ánh'
                  : 'Cập nhật phản hồi'}
              </h2>
              <button className="icon-button" onClick={() => setShowReviewModal(false)} type="button">
                <XCircle size={18} />
              </button>
            </div>
            <form className="form-grid" onSubmit={handleReviewSubmit}>
              <label>
                {reviewForm.status === 'REJECTED'
                  ? 'Lý do từ chối (bắt buộc)'
                  : 'Ghi chú phản hồi / kết quả giải quyết'}
                <textarea
                  name="resolveNote"
                  onChange={(e) => setReviewForm(prev => ({ ...prev, resolveNote: e.target.value }))}
                  required={reviewForm.status === 'REJECTED'}
                  rows={4}
                  value={reviewForm.resolveNote}
                  placeholder={
                    reviewForm.status === 'REJECTED'
                      ? 'Nhập lý do từ chối phản ánh này để gửi đến cư dân...'
                      : 'Mô tả kết quả xử lý hoặc hướng giải quyết vấn đề của cư dân...'
                  }
                  style={{
                    width: '100%',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-input)',
                    color: 'var(--text-primary)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '10px 14px',
                  }}
                />
              </label>

              <div className="modal-footer">
                <button className="secondary-button" onClick={() => setShowReviewModal(false)} type="button">
                  Hủy
                </button>
                <button
                  className="primary-button"
                  disabled={isSubmitting}
                  type="submit"
                  style={{
                    background: reviewForm.status === 'REJECTED' ? 'var(--danger)' : 'var(--accent)',
                    borderColor: reviewForm.status === 'REJECTED' ? 'var(--danger)' : 'var(--accent)',
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner" /> Đang cập nhật...
                    </>
                  ) : (
                    'Cập nhật'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default ReportsPage;
