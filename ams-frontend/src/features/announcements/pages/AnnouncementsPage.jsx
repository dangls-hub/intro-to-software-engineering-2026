import { useState, useEffect } from 'react';
import { Bell, Calendar, Edit, Megaphone, Plus, RefreshCcw, Trash2, X } from 'lucide-react';
import { createAnnouncement, deleteAnnouncement, fetchAnnouncements, updateAnnouncement } from '../api/announcementsApi';
import { useToast } from '../../../components/ui/Toast';
import { useAuth } from '../../../store/authStore';

const typeMap = {
  ANNOUNCEMENT: { label: 'Thông báo', cls: 'pending', icon: Megaphone, color: 'var(--info)' },
  EVENT: { label: 'Sự kiện', cls: 'paid', icon: Calendar, color: 'var(--accent)' },
};

function AnnouncementsPage() {
  const { user } = useAuth();
  const isAdminStaff = user?.role === 'ADMIN' || user?.role === 'STAFF';
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filterType, setFilterType] = useState('');
  const [form, setForm] = useState({ title: '', content: '', type: 'ANNOUNCEMENT', eventDate: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const showToast = useToast();

  async function loadAnnouncements() {
    setIsLoading(true);
    setError('');
    try {
      const data = await fetchAnnouncements();
      setAnnouncements(data);
    } catch (err) {
      setError(err.message || 'Không tải được bảng tin chung cư.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadAnnouncements();
  }, []);

  function handleInputChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function openCreate() {
    setForm({ title: '', content: '', type: 'ANNOUNCEMENT', eventDate: '' });
    setEditingId(null);
    setShowModal(true);
  }

  function openEdit(item) {
    setEditingId(item.id);
    setForm({
      title: item.title || '',
      content: item.content || '',
      type: item.type || 'ANNOUNCEMENT',
      eventDate: item.eventDate ? item.eventDate.substring(0, 16) : '',
    });
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      showToast('Vui lòng điền đầy đủ tiêu đề và nội dung', 'warning');
      return;
    }
    if (form.type === 'EVENT' && !form.eventDate) {
      showToast('Vui lòng chọn thời gian diễn ra sự kiện', 'warning');
      return;
    }

    setIsSubmitting(true);
    const payload = {
      ...form,
      eventDate: form.type === 'EVENT' ? form.eventDate : null,
    };

    try {
      if (editingId) {
        await updateAnnouncement(editingId, payload);
        showToast('Cập nhật bảng tin thành công!', 'success');
      } else {
        await createAnnouncement(payload);
        showToast('Đăng bảng tin thành công!', 'success');
      }
      setShowModal(false);
      await loadAnnouncements();
    } catch (err) {
      showToast(err.message || 'Không lưu được bài đăng.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(item) {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa bài viết "${item.title}"?`)) return;
    try {
      await deleteAnnouncement(item.id);
      showToast('Xóa bài viết thành công!', 'success');
      if (selectedItem?.id === item.id) setSelectedItem(null);
      await loadAnnouncements();
    } catch (err) {
      showToast(err.message || 'Không xóa được bài viết.', 'error');
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

  const filtered = announcements.filter((item) => !filterType || item.type === filterType);

  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow">Notice Board</p>
          <h1>Bảng tin & Sự kiện chung cư</h1>
        </div>
        <div className="page-header-actions">
          <button className="secondary-button" onClick={loadAnnouncements} type="button">
            <RefreshCcw size={17} /> Tải lại
          </button>
          {isAdminStaff && (
            <button className="primary-button" onClick={openCreate} type="button">
              <Plus size={17} /> Tạo bảng tin
            </button>
          )}
        </div>
      </header>

      {error && <div className="alert error">{error}</div>}

      <div className="toolbar" style={{ marginBottom: '24px', display: 'flex', gap: '8px' }}>
        <button
          className={`secondary-button ${!filterType ? 'active' : ''}`}
          onClick={() => setFilterType('')}
          style={{ background: !filterType ? 'var(--accent-subtle)' : '', color: !filterType ? 'var(--accent)' : '' }}
        >
          Tất cả bài viết
        </button>
        <button
          className={`secondary-button ${filterType === 'ANNOUNCEMENT' ? 'active' : ''}`}
          onClick={() => setFilterType('ANNOUNCEMENT')}
          style={{ background: filterType === 'ANNOUNCEMENT' ? 'var(--accent-subtle)' : '', color: filterType === 'ANNOUNCEMENT' ? 'var(--accent)' : '' }}
        >
          Thông báo
        </button>
        <button
          className={`secondary-button ${filterType === 'EVENT' ? 'active' : ''}`}
          onClick={() => setFilterType('EVENT')}
          style={{ background: filterType === 'EVENT' ? 'var(--accent-subtle)' : '', color: filterType === 'EVENT' ? 'var(--accent)' : '' }}
        >
          Sự kiện
        </button>
      </div>

      {isLoading ? (
        <div className="loading-center">
          <span className="spinner" /> Đang tải...
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <Bell size={48} />
          <p>Không có thông báo hoặc sự kiện nào phù hợp.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {filtered.map((item) => {
            const tp = typeMap[item.type] || { label: item.type, cls: 'inactive', icon: Bell, color: 'var(--text-muted)' };
            const Icon = tp.icon;
            return (
              <div
                key={item.id}
                className="workspace-panel liquid-glass"
                style={{
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  justifyContent: 'space-between',
                  border: '1px solid var(--border)',
                  minHeight: '220px',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: 'pointer',
                }}
                onClick={() => setSelectedItem(item)}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span
                      className={`status-badge ${tp.cls}`}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 700 }}
                    >
                      <Icon size={12} />
                      {tp.label}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{fmtDate(item.createdAt)}</span>
                  </div>

                  <h3
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '1.15rem',
                      fontWeight: 700,
                      color: 'var(--text-heading)',
                      marginBottom: '8px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {item.title}
                  </h3>

                  <p
                    style={{
                      fontSize: '0.875rem',
                      color: 'var(--text-secondary)',
                      lineHeight: '1.5',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {item.content}
                  </p>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: '1px solid var(--border-subtle)',
                    paddingTop: '12px',
                    marginTop: '8px',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Đăng bởi: {item.postedByName}</span>

                  {isAdminStaff ? (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => openEdit(item)}
                        style={{ color: 'var(--accent)', padding: '4px' }}
                        title="Chỉnh sửa"
                        type="button"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        style={{ color: 'var(--danger)', padding: '4px' }}
                        title="Xóa"
                        type="button"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 600 }}>Xem chi tiết &rarr;</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedItem && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setSelectedItem(null); }}>
          <div className="modal-panel" style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <span
                className={`status-badge ${(typeMap[selectedItem.type] || {}).cls}`}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 700 }}
              >
                {(() => {
                  const Icon = (typeMap[selectedItem.type] || {}).icon || Bell;
                  return <Icon size={12} />;
                })()}
                {(typeMap[selectedItem.type] || {}).label || selectedItem.type}
              </span>
              <button className="icon-button" onClick={() => setSelectedItem(null)} type="button">
                <X size={18} />
              </button>
            </div>

            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-heading)', lineHeight: 1.3 }}>
                {selectedItem.title}
              </h2>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <span>Đăng bởi: <strong>{selectedItem.postedByName}</strong></span>
                <span>•</span>
                <span>Thời gian đăng: {fmtDate(selectedItem.createdAt)}</span>
              </div>

              {selectedItem.type === 'EVENT' && selectedItem.eventDate && (
                <div
                  style={{
                    background: 'var(--accent-subtle)',
                    border: '1px solid rgba(201,169,110,0.2)',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    color: 'var(--accent)',
                    fontWeight: 600,
                  }}
                >
                  <Calendar size={20} />
                  <div>
                    <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.8 }}>Thời gian diễn ra sự kiện</div>
                    <div style={{ fontSize: '1rem', marginTop: '2px' }}>{fmtDate(selectedItem.eventDate)}</div>
                  </div>
                </div>
              )}

              <div
                style={{
                  fontSize: '0.95rem',
                  lineHeight: '1.6',
                  color: 'var(--text-primary)',
                  whiteSpace: 'pre-wrap',
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: '16px',
                }}
              >
                {selectedItem.content}
              </div>
            </div>
            <div className="modal-footer" style={{ marginTop: '24px' }}>
              <button className="secondary-button" onClick={() => setSelectedItem(null)} type="button">
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="modal-panel">
            <div className="modal-header">
              <h2>{editingId ? 'Chỉnh sửa bài đăng' : 'Đăng thông báo / sự kiện'}</h2>
              <button className="icon-button" onClick={() => setShowModal(false)} type="button">
                <X size={18} />
              </button>
            </div>
            <form className="form-grid" onSubmit={handleSubmit}>
              <label>
                Tiêu đề bài viết
                <input
                  name="title"
                  onChange={handleInputChange}
                  required
                  value={form.title}
                  placeholder="VD: Thông báo bảo trì điện lưới định kỳ"
                />
              </label>

              <label>
                Phân loại bài viết
                <select name="type" onChange={handleInputChange} value={form.type}>
                  <option value="ANNOUNCEMENT">Thông báo chung</option>
                  <option value="EVENT">Sự kiện / Lịch sinh hoạt</option>
                </select>
              </label>

              {form.type === 'EVENT' && (
                <label>
                  Thời gian diễn ra sự kiện
                  <input
                    name="eventDate"
                    onChange={handleInputChange}
                    required={form.type === 'EVENT'}
                    type="datetime-local"
                    value={form.eventDate}
                  />
                </label>
              )}

              <label>
                Nội dung chi tiết
                <textarea
                  name="content"
                  onChange={handleInputChange}
                  required
                  rows={6}
                  value={form.content}
                  placeholder="Nhập nội dung thông báo hoặc sự kiện chi tiết..."
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
                <button className="secondary-button" onClick={() => setShowModal(false)} type="button">
                  Hủy
                </button>
                <button className="primary-button" disabled={isSubmitting} type="submit">
                  {isSubmitting ? (
                    <>
                      <span className="spinner" /> Đang đăng...
                    </>
                  ) : editingId ? (
                    'Lưu thay đổi'
                  ) : (
                    'Đăng bài'
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

export default AnnouncementsPage;
