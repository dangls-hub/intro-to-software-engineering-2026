import { useEffect, useMemo, useState } from 'react';
import {
  Building2,
  ChevronRight,
  Receipt,
  RefreshCcw,
  Search,
  X,
} from 'lucide-react';
import { fetchFees } from '../api/feesApi';
import { fetchApartments } from '../../apartments/api/apartmentsApi';
import { useToast } from '../../../components/ui/Toast';

const statusMap = {
  PENDING: { label: 'Chưa thu', cls: 'pending' },
  PARTIAL: { label: 'Thu một phần', cls: 'pending' },
  PAID: { label: 'Đã thu', cls: 'paid' },
  OVERDUE: { label: 'Quá hạn', cls: 'overdue' },
};
const typeMap = { MANDATORY: 'Bắt buộc', VOLUNTARY: 'Tự nguyện' };

function FeesByApartmentPage() {
  const [apartments, setApartments] = useState([]);
  const [fees, setFees] = useState([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedApt, setSelectedApt] = useState(null);
  const showToast = useToast();

  async function loadData() {
    setIsLoading(true);
    setError('');
    const [aRes, fRes] = await Promise.allSettled([fetchApartments(), fetchFees()]);
    if (aRes.status === 'fulfilled') setApartments(aRes.value);
    else setError(aRes.reason?.message || 'Không tải được danh sách căn hộ.');
    if (fRes.status === 'fulfilled') setFees(fRes.value);
    else if (!error) setError(fRes.reason?.message || 'Không tải được danh sách khoản thu.');
    setIsLoading(false);
  }

  useEffect(() => { loadData(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fmt = (n) => n != null ? Number(n).toLocaleString('vi-VN') + ' đ' : '—';

  // Group fees by apartment
  const feesByApt = useMemo(() => {
    const map = {};
    fees.forEach((f) => {
      const aptId = f.apartmentId || 'unassigned';
      if (!map[aptId]) map[aptId] = [];
      map[aptId].push(f);
    });
    return map;
  }, [fees]);

  // Build apartment stats
  const aptStats = useMemo(() => {
    return apartments.map((apt) => {
      const aptFees = feesByApt[apt.id] || [];
      const totalFees = aptFees.length;
      const unpaidFees = aptFees.filter((f) => f.status !== 'PAID').length;
      const totalAmount = aptFees.reduce((s, f) => s + (Number(f.amount) || 0), 0);
      const paidAmount = aptFees.filter((f) => f.status === 'PAID').reduce((s, f) => s + (Number(f.amount) || 0), 0);
      return { ...apt, totalFees, unpaidFees, totalAmount, paidAmount };
    });
  }, [apartments, feesByApt]);

  // Filter apartments by search
  const filtered = aptStats.filter((a) =>
    (a.roomNumber || '').toLowerCase().includes(search.toLowerCase())
  );

  // Selected apartment fees
  const selectedFees = selectedApt ? (feesByApt[selectedApt.id] || []) : [];

  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow"><Building2 size={12} /> Quản lý khoản thu</p>
          <h1>Khoản thu theo căn hộ</h1>
        </div>
        <div className="page-header-actions">
          <button className="secondary-button" onClick={loadData} type="button"><RefreshCcw size={17} /> Tải lại</button>
        </div>
      </header>

      {error && <div className="alert error">{error}</div>}

      {/* Search */}
      <div className="toolbar" style={{ marginBottom: 20 }}>
        <input
          className="search-input"
          placeholder="Tìm căn hộ theo mã phòng..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span className="count-badge">{filtered.length}</span>
      </div>

      {isLoading ? (
        <div className="loading-center"><span className="spinner" /> Đang tải...</div>
      ) : filtered.length === 0 ? (
        <div className="workspace-panel">
          <div className="empty-state">
            <Building2 size={48} />
            <p>{search ? 'Không tìm thấy căn hộ phù hợp.' : 'Chưa có căn hộ nào.'}</p>
          </div>
        </div>
      ) : (
        <div className="apt-fee-grid">
          {filtered.map((apt) => {
            const isSelected = selectedApt?.id === apt.id;
            const progress = apt.totalAmount > 0 ? Math.round((apt.paidAmount / apt.totalAmount) * 100) : 0;

            return (
              <div
                key={apt.id}
                className={`apt-fee-card ${isSelected ? 'apt-fee-card--active' : ''}`}
                onClick={() => setSelectedApt(isSelected ? null : apt)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter') setSelectedApt(isSelected ? null : apt); }}
              >
                <div className="apt-fee-card__header">
                  <div className="apt-fee-card__icon">
                    <Building2 size={20} />
                  </div>
                  <div className="apt-fee-card__info">
                    <h3 className="apt-fee-card__room">{apt.roomNumber}</h3>
                    <p className="apt-fee-card__floor">Tầng {apt.floor || '—'} · {apt.area ? `${apt.area} m²` : '—'}</p>
                  </div>
                  <ChevronRight
                    size={18}
                    className={`apt-fee-card__chevron ${isSelected ? 'apt-fee-card__chevron--open' : ''}`}
                  />
                </div>

                {/* Stats row */}
                <div className="apt-fee-card__stats">
                  <div className="apt-fee-card__stat">
                    <span className="apt-fee-card__stat-value">{apt.totalFees}</span>
                    <span className="apt-fee-card__stat-label">Tổng</span>
                  </div>
                  <div className="apt-fee-card__stat">
                    <span className="apt-fee-card__stat-value" style={{ color: apt.unpaidFees > 0 ? 'var(--warning)' : 'var(--success)' }}>{apt.unpaidFees}</span>
                    <span className="apt-fee-card__stat-label">Chưa thu</span>
                  </div>
                  <div className="apt-fee-card__stat">
                    <span className="apt-fee-card__stat-value">{fmt(apt.totalAmount)}</span>
                    <span className="apt-fee-card__stat-label">Tổng tiền</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="apt-fee-card__progress-wrap">
                  <div className="apt-fee-card__progress-bar">
                    <div className="apt-fee-card__progress-fill" style={{ width: `${progress}%` }} />
                  </div>
                  <span className="apt-fee-card__progress-text">{progress}% đã thu</span>
                </div>

                {/* Expanded detail */}
                {isSelected && (
                  <div className="apt-fee-card__detail" onClick={(e) => e.stopPropagation()}>
                    <div className="apt-fee-card__detail-header">
                      <h4><Receipt size={14} /> Chi tiết khoản thu</h4>
                    </div>
                    {selectedFees.length === 0 ? (
                      <p className="muted-text" style={{ padding: '16px 0' }}>Chưa có khoản thu nào cho căn hộ này.</p>
                    ) : (
                      <div className="table-wrap">
                        <table>
                          <thead>
                            <tr>
                              <th>Tên khoản thu</th>
                              <th>Loại</th>
                              <th>Số tiền</th>
                              <th>Hạn nộp</th>
                              <th>Trạng thái</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedFees.map((f) => {
                              const st = statusMap[f.status] || { label: f.status || '—', cls: 'inactive' };
                              return (
                                <tr key={f.id}>
                                  <td style={{ fontWeight: 600 }}>{f.name || '—'}</td>
                                  <td>{typeMap[f.type] || f.type || '—'}</td>
                                  <td style={{ fontWeight: 700 }}>{fmt(f.amount)}</td>
                                  <td>{f.dueDate || '—'}</td>
                                  <td><span className={`status-badge ${st.cls}`}>{st.label}</span></td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

export default FeesByApartmentPage;
