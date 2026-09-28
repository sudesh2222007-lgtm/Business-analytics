export default function KpiCard({ label, value, change = '7.00%', isPositive = true, icon, sparkline }) {
  return (
    <div className="kpi-widget">
      <div>
        <div className="kpi-info-label">{label}</div>
        <div className="kpi-info-value">{value}</div>
        <div className={`kpi-change-badge ${isPositive ? 'positive' : 'negative'}`}>
          <span>{isPositive ? '↑' : '↓'}</span>
          <span>{change}</span>
          <span style={{ color: 'var(--text-light)', fontWeight: 500 }}>Since last month</span>
        </div>
      </div>

      {sparkline ? (
        <div style={{ width: 80, height: 40 }}>
          {sparkline}
        </div>
      ) : (
        <div className="kpi-icon-circle">
          {icon || '📈'}
        </div>
      )}
    </div>
  );
}
