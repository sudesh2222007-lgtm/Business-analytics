import { NavLink, useNavigate } from 'react-router-dom';

const navDirectories = [
  { to: '/', label: 'Dashboard', icon: '📊', end: true },
  { to: '/sales', label: 'Stats', icon: '📈' },
  { to: '/customers', label: 'Users', icon: '👤' },
  { to: '/profitability', label: 'Invoices', icon: '📑' },
];

const analyticsReports = [
  { name: 'Category Sales Distribution', path: '/sales' },
  { name: 'Region Sales Volume', path: '/sales' },
  { name: 'Top Performing Products', path: '/sales' },
  { name: 'Monthly Revenue Trend', path: '/sales' },
  { name: 'New vs Returning Customers', path: '/customers' },
  { name: 'Customer Segments', path: '/customers' },
  { name: 'Top 10 Customers by Spend', path: '/customers' },
  { name: 'Profit by Category', path: '/profitability' },
  { name: 'Profit by Region', path: '/profitability' },
  { name: 'Discount vs Avg Profit', path: '/profitability' },
  { name: 'Top & Bottom Performing Products', path: '/profitability' },
];

export default function Sidebar({ user, onLogout }) {
  const navigate = useNavigate();

  return (
    <>
      {/* Far Left Slim Rail Navigation */}
      <aside className="icon-rail">
        <nav className="icon-rail-nav">
          <NavLink to="/" end className={({ isActive }) => `rail-icon-btn ${isActive ? 'active' : ''}`} title="Dashboard">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>
          </NavLink>
          <NavLink to="/sales" className={({ isActive }) => `rail-icon-btn ${isActive ? 'active' : ''}`} title="Sales Stats">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>
          </NavLink>
          <NavLink to="/customers" className={({ isActive }) => `rail-icon-btn ${isActive ? 'active' : ''}`} title="Customer Analytics">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </NavLink>
          <NavLink to="/profitability" className={({ isActive }) => `rail-icon-btn ${isActive ? 'active' : ''}`} title="Profitability Invoices">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          </NavLink>
          <div className="rail-icon-btn" title="Logout" onClick={onLogout} style={{ cursor: 'pointer' }}>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </div>
        </nav>

      </aside>

      {/* Secondary Directories Sidebar */}
      <aside className="secondary-sidebar">
        <div className="sidebar-heading">Analitycs</div>

        <div className="section-label">Directories</div>
        <nav className="dir-nav">
          {navDirectories.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => `dir-link ${isActive ? 'active' : ''}`}>
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="section-label">Reports</div>
        <div className="reports-list">
          {analyticsReports.map((report) => (
            <div
              key={report.name}
              className="report-item"
              onClick={() => navigate(report.path)}
              title={`View ${report.name} Report`}
            >
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              <span>{report.name}</span>
            </div>
          ))}
        </div>

        {user && (
          <div style={{ margin: '16px 0 16px', padding: '12px 14px', background: 'var(--bg)', borderRadius: 12, border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--text)' }}>{user.name}</div>
            <div style={{ fontSize: 12, color: 'var(--text-light)', fontWeight: 600 }}>{user.email}</div>
          </div>
        )}

        <button className="create-btn" onClick={onLogout}>
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Log Out
        </button>
      </aside>
    </>
  );
}
