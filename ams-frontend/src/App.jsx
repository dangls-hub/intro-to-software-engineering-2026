import { Building2, CreditCard, Home, Users } from 'lucide-react';

const overviewItems = [
  { label: 'Can ho', value: '0', icon: Home },
  { label: 'Cu dan', value: '0', icon: Users },
  { label: 'Khoan thu', value: '0', icon: Building2 },
  { label: 'Thanh toan', value: '0', icon: CreditCard },
];

function App() {
  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">BM</span>
          <span>BlueMoon AMS</span>
        </div>
        <nav className="nav-list" aria-label="Dieu huong chinh">
          <a href="#dashboard" className="nav-link active">Tong quan</a>
          <a href="#residents" className="nav-link">Cu dan</a>
          <a href="#apartments" className="nav-link">Can ho</a>
          <a href="#fees" className="nav-link">Khoan thu</a>
          <a href="#payments" className="nav-link">Thanh toan</a>
        </nav>
      </aside>

      <section className="content">
        <header className="page-header">
          <div>
            <p className="eyebrow">Apartment Management System</p>
            <h1>Bang dieu khien BlueMoon</h1>
          </div>
          <button type="button" className="primary-button">Them cu dan</button>
        </header>

        <section className="metric-grid" aria-label="Thong ke nhanh">
          {overviewItems.map(({ label, value, icon: Icon }) => (
            <article className="metric-card" key={label}>
              <Icon size={22} aria-hidden="true" />
              <div>
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            </article>
          ))}
        </section>

        <section className="workspace-panel">
          <h2>Frontend skeleton</h2>
          <p>
            Cau truc man hinh da san sang de noi API tu backend Spring Boot tai
            <code>/api/v1</code>.
          </p>
        </section>
      </section>
    </main>
  );
}

export default App;
