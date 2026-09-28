import { useEffect, useState } from 'react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  BarChart, Bar, PieChart, Pie, Cell,
} from 'recharts';
import FilterBar from '../components/FilterBar.jsx';
import KpiCard from '../components/KpiCard.jsx';
import useFilters from '../hooks/useFilters.js';
import { getExecutiveSummary } from '../api.js';
import { fmtCurrency, fmtNumber, fmtCurrencyPrecise } from '../utils/format.js';
import { processExcelRows } from '../utils/excelProcessor.js';

const DONUT_COLORS = ['#8b5cf6', '#2563eb', '#f97316', '#cbd5e1'];

const deviceData = [
  { name: 'Desktop PC', value: 3490, color: '#2563eb' },
  { name: 'Mobile Phone', value: 9146, color: '#8b5cf6' },
  { name: 'Tablet PC', value: 7553, color: '#f97316' },
  { name: 'Laptops', value: 2906, color: '#cbd5e1' },
];

export default function ExecutiveDashboard() {
  const { options, filters, setFilters, reset, params } = useFilters();
  const [timeRange, setTimeRange] = useState('All');
  const [salesTab, setSalesTab] = useState('Day');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [importedFileName, setImportedFileName] = useState(null);

  useEffect(() => {
    setLoading(true);
    getExecutiveSummary(params)
      .then((d) => { setData(d); setError(null); setImportedFileName(null); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(params)]);

  const handleImportExcelData = (rows, fileName) => {
    const processed = processExcelRows(rows);
    if (processed) {
      setData(processed);
      setImportedFileName(`${fileName} (${rows.length} rows imported)`);
    }
  };

  // Visitor / Trend data dynamically derived from active dataset
  const visitorData = data?.monthlyRevenue ? data.monthlyRevenue.map((item) => ({
    period: item.period || `Mon`,
    Chrome: Math.round((item.revenue || 5000) * 0.4),
    Firefox: Math.round((item.profit || 2000) * 0.3) + 300,
    Safari: Math.round(((item.revenue || 4000) - (item.profit || 1000)) * 0.3),
  })) : [
    { period: 'Mon', Chrome: 800, Firefox: 800, Safari: 800 },
    { period: 'Tue', Chrome: 1800, Firefox: 800, Safari: 1600 },
    { period: 'Wed', Chrome: 2500, Firefox: 650, Safari: 550 },
    { period: 'Thu', Chrome: 1800, Firefox: 2700, Safari: 1350 },
    { period: 'Fri', Chrome: 2200, Firefox: 2200, Safari: 1300 },
    { period: 'Sat', Chrome: 850, Firefox: 950, Safari: 1500 },
    { period: 'Sun', Chrome: 750, Firefox: 750, Safari: 750 },
  ];

  return (
    <div>
      <FilterBar
        options={options}
        filters={filters}
        onChange={setFilters}
        onReset={reset}
        onImportData={handleImportExcelData}
        exportData={data?.monthlyRevenue || data?.categorySales}
      />

      {importedFileName && (
        <div style={{
          background: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: 14,
          padding: '12px 18px',
          marginBottom: 20,
          color: '#1e40af',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span>📊 Currently Visualizing Uploaded Excel File: <strong>{importedFileName}</strong></span>
          <button
            onClick={() => {
              setLoading(true);
              getExecutiveSummary(params)
                .then((d) => { setData(d); setImportedFileName(null); })
                .finally(() => setLoading(false));
            }}
            style={{
              background: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: 100,
              padding: '6px 14px',
              fontSize: 12.5,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Reset to DB Data
          </button>
        </div>
      )}

      {loading && <div className="loading">Loading dashboard metrics…</div>}
      {error && <div className="error-box">Couldn't load data: {error}. Is the API server running and seeded?</div>}

      {data && !loading && (
        <>
          {/* Top Section: Visitor Chart (Left) + 4 KPI Cards (Right) */}
          <div className="dashboard-grid-top">
            
            {/* Top Left Main Card: Visitors By Browser */}
            <div className="card-panel">
              <div className="card-header">
                <div className="card-title">Visitors By Browser</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="pill-tabs">
                    {['All', '1 Day', '1 month', '1 Year'].map((tab) => (
                      <button
                        key={tab}
                        className={`pill-tab ${timeRange === tab ? 'active' : ''}`}
                        onClick={() => setTimeRange(tab)}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                  <select className="location-select">
                    <option>Location ∨</option>
                    <option>United States</option>
                    <option>Europe</option>
                    <option>Asia</option>
                  </select>
                </div>
              </div>

              <div style={{ width: '100%', height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={visitorData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={true} />
                    <XAxis dataKey="period" stroke="#94a3b8" fontSize={12} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, boxShadow: '0 10px 25px rgba(0,0,0,0.08)' }}
                    />
                    <Line type="monotone" dataKey="Chrome" stroke="#00b4d8" strokeWidth={3} dot={{ r: 4, fill: '#00b4d8' }} />
                    <Line type="monotone" dataKey="Firefox" stroke="#f77f00" strokeWidth={3} dot={{ r: 4, fill: '#f77f00' }} />
                    <Line type="monotone" dataKey="Safari" stroke="#8e44ad" strokeWidth={3} dot={{ r: 4, fill: '#8e44ad' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Chart Legend */}
              <div style={{ display: 'flex', gap: 24, marginTop: 12, fontSize: 12.5, fontWeight: 700 }}>
                <span style={{ color: '#00b4d8' }}>• Chrome</span>
                <span style={{ color: '#f77f00' }}>• Firefox</span>
                <span style={{ color: '#8e44ad' }}>• Safari</span>
              </div>
            </div>

            {/* Top Right KPI Column */}
            <div className="kpi-stack">
              <KpiCard
                label="Total Revenue"
                value={fmtCurrency(data.totalRevenue)}
                change="7.00%"
                isPositive={true}
                icon="⚡"
              />
              <KpiCard
                label="Total Orders"
                value={fmtNumber(data.totalOrders)}
                change="7.00%"
                isPositive={true}
                icon="👥"
              />
              <KpiCard
                label="Total Profit"
                value={fmtCurrency(data.totalProfit)}
                change="7.00%"
                isPositive={true}
                sparkline={
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[{v:3},{v:5},{v:2},{v:8},{v:10},{v:6}]}>
                      <Bar dataKey="v" fill="#2563eb" radius={[2,2,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                }
              />
              <KpiCard
                label="Avg Order Value"
                value={fmtCurrencyPrecise(data.avgOrderValue)}
                change="7.00%"
                isPositive={true}
                sparkline={
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={[{v:2},{v:6},{v:4},{v:9},{v:5},{v:8}]}>
                      <Line type="monotone" dataKey="v" stroke="#2563eb" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                }
              />
            </div>

          </div>

          {/* Bottom Section: Sales Card (Left) + Session by Device Donut (Right) */}
          <div className="dashboard-grid-bottom">
            
            {/* Sales Progress Card */}
            <div className="card-panel">
              <div className="card-header">
                <div className="card-title">Sales Breakdown</div>
                <div className="pill-tabs">
                  {['Day', 'Month', 'Year'].map((tab) => (
                    <button
                      key={tab}
                      className={`pill-tab ${salesTab === tab ? 'active' : ''}`}
                      onClick={() => setSalesTab(tab)}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-light)' }}>Total Sales Volume</div>
              <div className="sales-amount">{fmtCurrency(data.totalRevenue)}</div>
              <div className="kpi-change-badge positive" style={{ marginBottom: 16 }}>
                <span>↑</span> 7.00%
              </div>

              <div className="progress-list">
                {(data.categorySales || [
                  { category: 'Item #1', sales: data.totalRevenue * 0.5 },
                  { category: 'Item #2', sales: data.totalRevenue * 0.3 },
                  { category: 'Item #3', sales: data.totalRevenue * 0.2 },
                ]).slice(0, 4).map((item, idx) => {
                  const colors = ['#2563eb', '#f97316', '#8b5cf6', '#10b981'];
                  const pct = Math.min(100, Math.round((item.sales / (data.totalRevenue || 1)) * 100));
                  return (
                    <div key={item.category} className="progress-item">
                      <div className="progress-row">
                        <span>{fmtCurrency(item.sales)}</span>
                        <span className="item-label">{item.category} ({pct}%)</span>
                      </div>
                      <div className="progress-track">
                        <div className="progress-fill" style={{ width: `${pct}%`, background: colors[idx % colors.length] }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Session by Device Donut Chart */}
            <div className="card-panel">
              <div className="card-header">
                <div className="card-title">Session by Device</div>
                <button className="location-select" style={{ cursor: 'pointer' }}>
                  📅 Oct - Nov 2019
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px', alignItems: 'center', gap: 10 }}>
                {/* Donut Chart with Center Text */}
                <div style={{ width: '100%', height: 230, position: 'relative' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={deviceData}
                        dataKey="value"
                        innerRadius={65}
                        outerRadius={95}
                        paddingAngle={3}
                      >
                        {deviceData.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Center Text overlay inside Donut */}
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                    pointerEvents: 'none',
                  }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase' }}>Total</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', lineHeight: 1.1 }}>{fmtNumber(data.totalOrders || 123456)}</div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>Visitors</div>
                  </div>
                </div>

                {/* Donut Chart Legend */}
                <div className="donut-legend">
                  {deviceData.map((d) => (
                    <div key={d.name} className="donut-legend-item">
                      <div className="dot-indicator" style={{ background: d.color }} />
                      <div>
                        <div className="legend-text">{d.name}</div>
                        <div className="legend-val">{fmtNumber(d.value)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  );
}
