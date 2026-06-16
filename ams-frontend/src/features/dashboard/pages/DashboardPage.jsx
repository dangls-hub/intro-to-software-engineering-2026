import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Megaphone, Calendar, ArrowRight } from 'lucide-react';
import { apiClient } from '../../../lib/apiClient';
import { fetchDashboardStats } from '../api/dashboardApi';
import { fetchApartments } from '../../apartments/api/apartmentsApi';
import { fetchResidents } from '../../residents/api/residentsApi';
import { fetchFees } from '../../fees/api/feesApi';
import { fetchPayments } from '../../payments/api/paymentsApi';
import { fetchAnnouncements } from '../../announcements/api/announcementsApi';
import { useToast } from '../../../components/ui/Toast';

import DashboardHero from '../components/DashboardHero';
import MetricsGrid from '../components/MetricsGrid';
import ApartmentsPortfolio from '../components/ApartmentsPortfolio';
import SystemStatus from '../components/SystemStatus';

const initialMetrics = { apartments: 0, residents: 0, fees: 0, payments: 0 };

function DashboardPage() {
  const [metrics,    setMetrics]    = useState(initialMetrics);
  const [health,     setHealth]     = useState(null);
  const [isLoading,  setIsLoading]  = useState(true);
  const [error,      setError]      = useState('');
  const [apartments, setApartments] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [isAnnouncementsLoading, setIsAnnouncementsLoading] = useState(true);
  const showToast = useToast();

  async function loadDashboard() {
    setIsLoading(true);
    setError('');
    setIsAnnouncementsLoading(true);

    try {
      const healthRes = await apiClient('/health', { token: null }).then(() => true).catch(() => false);
      setHealth(healthRes);

      const [statsResult, aptsResult, announcementsResult] = await Promise.allSettled([
        fetchDashboardStats(),
        fetchApartments(),
        fetchAnnouncements(),
      ]);

      if (announcementsResult.status === 'fulfilled' && announcementsResult.value) {
        setAnnouncements(announcementsResult.value.slice(0, 3));
      } else {
        console.error('Error fetching announcements');
      }

      if (statsResult.status === 'fulfilled' && statsResult.value) {
        const d = statsResult.value;
        setMetrics({
          apartments: d.totalApartments ?? d.apartments ?? 0,
          residents:  d.totalResidents  ?? d.residents  ?? 0,
          fees:       d.totalFees       ?? d.fees       ?? 0,
          payments:   d.totalPayments   ?? d.payments   ?? 0,
        });
      } else {
        const [resRes, feesRes, payRes] = await Promise.allSettled([
          fetchResidents(),
          fetchFees(),
          fetchPayments(),
        ]);
        setMetrics({
          apartments: aptsResult.status === 'fulfilled' ? aptsResult.value.length : 0,
          residents:  resRes.status    === 'fulfilled' ? resRes.value.length    : 0,
          fees:       feesRes.status   === 'fulfilled' ? feesRes.value.length   : 0,
          payments:   payRes.status    === 'fulfilled' ? payRes.value.length    : 0,
        });
        const failed = [resRes, feesRes, payRes].find(r => r.status === 'rejected');
        if (failed) setError(failed.reason?.message || 'Không tải được một số dữ liệu.');
      }

      if (aptsResult.status === 'fulfilled') {
        setApartments(aptsResult.value.slice(0, 6));
      }
    } catch (err) {
      setError(err.message || 'Không tải được dữ liệu dashboard.');
      showToast('Lỗi tải dữ liệu dashboard', 'error');
    } finally {
      setIsLoading(false);
      setIsAnnouncementsLoading(false);
    }
  }

  useEffect(() => { loadDashboard(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const now      = new Date();
  const greeting = useMemo(() =>
    now.getHours() < 12 ? 'Chào buổi sáng' : now.getHours() < 18 ? 'Chào buổi chiều' : 'Chào buổi tối',
  []); // eslint-disable-line react-hooks/exhaustive-deps
  const dateStr  = now.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="ap-root dashboard-bleed">
      <DashboardHero
        greeting={greeting}
        dateStr={dateStr}
        error={error}
        onRefresh={loadDashboard}
      />
      <MetricsGrid
        metrics={metrics}
        isLoading={isLoading}
      />
      <ApartmentsPortfolio
        apartments={apartments}
        isLoading={isLoading}
      />

      <section
        className="db-section"
        style={{ paddingTop: '20px', paddingBottom: '0px' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
          <div>
            <p style={{ color: 'rgba(139,108,62,0.7)', fontSize: '0.73rem', fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase', margin: 0 }}>Quản lý tin tức</p>
            <h2 style={{
              fontFamily: "var(--font-display)",
              color: 'var(--text-heading)',
              fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
              fontWeight: 800,
              margin: 0,
              letterSpacing: '-0.025em',
            }}>
              Thông báo & Sự kiện mới nhất
            </h2>
          </div>
          <Link
            to="/announcements"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--accent)',
              fontWeight: 600,
              fontSize: '0.9rem',
              textDecoration: 'none',
              transition: 'color 0.2s',
            }}
          >
            Xem tất cả <ArrowRight size={16} />
          </Link>
        </div>

        {isAnnouncementsLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            <span className="spinner" style={{ marginRight: '8px' }} /> Đang tải bảng tin...
          </div>
        ) : announcements.length === 0 ? (
          <div className="workspace-panel liquid-glass" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Không có thông báo hoặc sự kiện nào.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {announcements.map((item) => {
              const isEvent = item.type === 'EVENT';
              const Icon = isEvent ? Calendar : Megaphone;
              return (
                <Link
                  key={item.id}
                  to="/announcements"
                  className="workspace-panel liquid-glass"
                  style={{
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '180px',
                    border: '1px solid var(--border)',
                    textDecoration: 'none',
                    color: 'inherit',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span
                        className={`status-badge ${isEvent ? 'paid' : 'pending'}`}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', fontWeight: 700 }}
                      >
                        <Icon size={11} />
                        {isEvent ? 'Sự kiện' : 'Thông báo'}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    <h4 style={{
                      fontSize: '1rem',
                      fontWeight: 700,
                      color: 'var(--text-heading)',
                      margin: '0 0 8px 0',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}>
                      {item.title}
                    </h4>
                    <p style={{
                      fontSize: '0.8rem',
                      color: 'var(--text-secondary)',
                      lineHeight: '1.4',
                      margin: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                    }}>
                      {item.content}
                    </p>
                  </div>
                  {isEvent && item.eventDate && (
                    <div style={{
                      marginTop: '12px',
                      fontSize: '0.75rem',
                      color: 'var(--accent)',
                      fontWeight: 600,
                      background: 'var(--accent-subtle)',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      alignSelf: 'flex-start',
                    }}>
                      <Calendar size={12} />
                      {new Date(item.eventDate).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <SystemStatus
        health={health}
      />
    </div>
  );
}

export default DashboardPage;
