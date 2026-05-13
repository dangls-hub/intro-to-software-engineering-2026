import { useEffect, useState } from 'react';
import { Building2, CreditCard, Home, RefreshCcw, Users } from 'lucide-react';
import { apiClient } from '../../../lib/apiClient';
import { fetchApartments } from '../../apartments/api/apartmentsApi';
import { fetchResidents } from '../../residents/api/residentsApi';

const initialMetrics = {
  apartments: 0,
  residents: 0,
  fees: 0,
  payments: 0,
};

function DashboardPage() {
  const [metrics, setMetrics] = useState(initialMetrics);
  const [health, setHealth] = useState('Chua kiem tra');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadDashboard() {
    setIsLoading(true);
    setError('');

    const [healthResult, apartmentsResult, residentsResult] = await Promise.allSettled([
      apiClient('/health', { token: null }),
      fetchApartments(),
      fetchResidents(),
    ]);

    if (healthResult.status === 'fulfilled') {
      setHealth(typeof healthResult.value === 'string' ? healthResult.value : 'Backend san sang');
    } else {
      setHealth('Backend chua san sang');
    }

    setMetrics({
      apartments: apartmentsResult.status === 'fulfilled' ? apartmentsResult.value.length : 0,
      residents: residentsResult.status === 'fulfilled' ? residentsResult.value.length : 0,
      fees: 0,
      payments: 0,
    });

    const firstError = [apartmentsResult, residentsResult].find((result) => result.status === 'rejected');
    if (firstError) {
      setError(firstError.reason?.message || 'Khong tai duoc du lieu dashboard.');
    }

    setIsLoading(false);
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const overviewItems = [
    { label: 'Can ho', value: metrics.apartments, icon: Home },
    { label: 'Cu dan', value: metrics.residents, icon: Users },
    { label: 'Khoan thu', value: metrics.fees, icon: Building2 },
    { label: 'Thanh toan', value: metrics.payments, icon: CreditCard },
  ];

  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow">Apartment Management System</p>
          <h1>Bang dieu khien</h1>
        </div>
        <button className="secondary-button" onClick={loadDashboard} type="button">
          <RefreshCcw size={17} aria-hidden="true" />
          Tai lai
        </button>
      </header>

      {error ? <div className="alert warning">{error}</div> : null}

      <section className="metric-grid" aria-label="Thong ke nhanh" aria-busy={isLoading}>
        {overviewItems.map(({ label, value, icon: Icon }) => (
          <article className="metric-card" key={label}>
            <Icon size={22} aria-hidden="true" />
            <div>
              <span>{label}</span>
              <strong>{isLoading ? '-' : value}</strong>
            </div>
          </article>
        ))}
      </section>

      <section className="workspace-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Trang thai he thong</p>
            <h2>Ket noi backend</h2>
          </div>
        </div>
        <p className="muted-text">{health}</p>
      </section>
    </>
  );
}

export default DashboardPage;
