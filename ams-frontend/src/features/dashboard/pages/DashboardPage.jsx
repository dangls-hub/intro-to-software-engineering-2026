import { useEffect, useMemo, useState } from 'react';
import { apiClient } from '../../../lib/apiClient';
import { fetchDashboardStats } from '../api/dashboardApi';
import { fetchApartments } from '../../apartments/api/apartmentsApi';
import { fetchResidents } from '../../residents/api/residentsApi';
import { fetchFees } from '../../fees/api/feesApi';
import { fetchPayments } from '../../payments/api/paymentsApi';
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
  const showToast = useToast();

  async function loadDashboard() {
    setIsLoading(true);
    setError('');

    try {
      const healthRes = await apiClient('/health', { token: null }).then(() => true).catch(() => false);
      setHealth(healthRes);

      const [statsResult, aptsResult] = await Promise.allSettled([
        fetchDashboardStats(),
        fetchApartments(),
      ]);

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
    }

    setIsLoading(false);
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
      <SystemStatus
        health={health}
      />
    </div>
  );
}

export default DashboardPage;
