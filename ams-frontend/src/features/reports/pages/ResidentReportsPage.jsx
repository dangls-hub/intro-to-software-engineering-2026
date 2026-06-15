import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Clock, MessageSquare, Plus, RefreshCcw, Send, X, XCircle } from 'lucide-react';
import { fetchMyReports, submitReport } from '../api/reportsApi';
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

function ResidentReportsPage() {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', type: 'REFLECT', content: '' });
  const [error, setError] = useState('');
  const showToast = useToast();

  async function loadReports() {
    setIsLoading(true);
    setError('');
    try {
      const data = await fetchMyReports();
      setReports(data);
    } catch (err) {
      setError(err.message || 'Không tải được danh sách phản ánh.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadReports();
  }, []);

  function handleInputChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      showToast('Vui lòng điền đầy đủ tiêu đề và nội dung', 'warning');
      return;
    }
    setIsSubmitting(true);
    try {
      await submitReport(form);
      showToast('Gửi phản ánh thành công!', 'success');
      setForm({ title: '', type: 'REFLECT', content: '' });
      setShowForm(false);
      await loadReports();
    } catch (err) {
      showToast(err.message || 'Không gửi được phản ánh.', 'error');
    } finally {
      setIsSubmitting(false);
    }
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

  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow">My Reports</p>
          <h1>Phản ánh & Ý kiến của tôi</h1>
        </div>
        <div className="page-header-actions">
          <button className="secondary-button" onClick={loadReports} type="button">
            <RefreshCcw size={17} /> Tải lại
          </button>
          <button className="primary-button" onClick={() => setShowForm(true)} type="button">
            <Plus size={17} /> Gửi phản ánh
          </button>
        </div>
      </header>

      {error && <div className="alert error">{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: reports.length > 0 && selectedReport ? '1.2fr 1fr' : '1fr', gap: '24px', alignItems: 'start' }}>
        <section className="workspace-panel">
          <div className="toolbar">
            <div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Danh sách phản ánh đã gửi</div>
            <span className="count-badge">{reports.length}</span>
          </div>

          {isLoading ? (
            <div className="loading-center">
              <span className="spinner" /> Đang tải...
            </div>
          ) : reports.length === 0 ? (
            <div className="empty-state">
              <MessageSquare size={48} />
              <p>Bạn chưa gửi phản ánh nào.</p>
              <button className="primary-button" onClick={() => setShowForm(true)} type="button" style={{ marginTop: '16px' }}>
                Gửi phản ánh đầu tiên
              </button>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Tiêu đề</th>
                    <th>Phân loại</th>
                    <th>Ngày gửi</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r) => {
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
                        <td style={{ fontWeight: 600 }}>{r.title}</td>
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
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tiêu đề</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>{selectedReport.title}</div>
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

              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ngày gửi</div>
                <div style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>{fmtDate(selectedReport.createdAt)}</div>
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

              {(selectedReport.status === 'RESOLVED' || selectedReport.status === 'REJECTED' || selectedReport.resolveNote) && (
                <div style={{ borderTop: '1px dashed var(--border)', paddingTop: '16px', marginTop: '8px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Phản hồi từ Ban quản lý {selectedReport.resolvedByName ? `(${selectedReport.resolvedByName})` : ''}
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
                    {selectedReport.resolveNote || 'Đã tiếp nhận và xử lý.'}
                  </div>
                  {selectedReport.resolvedAt && (
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '6px', textAlign: 'right' }}>
                      Thời gian phản hồi: {fmtDate(selectedReport.resolvedAt)}
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        )}
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}>
          <div className="modal-panel">
            <div className="modal-header">
              <h2>Gửi phản ánh mới</h2>
              <button className="icon-button" onClick={() => setShowForm(false)} type="button">
                <X size={18} />
              </button>
            </div>
            <form className="form-grid" onSubmit={handleSubmit}>
              <label>
                Tiêu đề phản ánh
                <input
                  name="title"
                  onChange={handleInputChange}
                  required
                  value={form.title}
                  placeholder="VD: Hỏng bóng đèn hành lang tầng 5"
                />
              </label>

              <label>
                Loại phản ánh
                <select name="type" onChange={handleInputChange} value={form.type}>
                  <option value="REFLECT">Phản ánh chung</option>
                  <option value="REPAIR">Yêu cầu sửa chữa</option>
                  <option value="COMPLAINT">Khiếu nại dịch vụ</option>
                  <option value="OTHER">Khác</option>
                </select>
              </label>

              <label>
                Nội dung chi tiết
                <textarea
                  name="content"
                  onChange={handleInputChange}
                  required
                  rows={5}
                  value={form.content}
                  placeholder="Mô tả chi tiết vấn đề bạn gặp phải để ban quản lý có thông tin xử lý..."
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
                <button className="secondary-button" onClick={() => setShowForm(false)} type="button">
                  Hủy
                </button>
                <button className="primary-button" disabled={isSubmitting} type="submit">
                  {isSubmitting ? (
                    <>
                      <span className="spinner" /> Đang gửi...
                    </>
                  ) : (
                    <>
                      <Send size={15} /> Gửi phản ánh
                    </>
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

export default ResidentReportsPage;
