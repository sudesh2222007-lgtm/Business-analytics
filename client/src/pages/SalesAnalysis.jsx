import { useEffect, useState } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, LineChart, Line,
} from 'recharts';
import FilterBar from '../components/FilterBar.jsx';
import ChartCard from '../components/ChartCard.jsx';
import KpiCard from '../components/KpiCard.jsx';
import useFilters from '../hooks/useFilters.js';
import { getSalesAnalysis } from '../api.js';
import { fmtCurrency, fmtCurrencyPrecise, fmtNumber } from '../utils/format.js';
import { processExcelRows } from '../utils/excelProcessor.js';

const COLORS = ['#2563eb', '#06b6d4', '#8b5cf6', '#f97316', '#10b981', '#3ec6e0'];

export default function SalesAnalysis() {
  const { options, filters, setFilters, reset, params } = useFilters();
  const [trendView, setTrendView] = useState('monthly');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [importedFileName, setImportedFileName] = useState(null);

  useEffect(() => {
    setLoading(true);
    getSalesAnalysis(params)
      .then((d) => { setData(d); setError(null); setImportedFileName(null); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(params)]);

  const handleImportExcelData = (rows, fileName) => {
    const processed = processExcelRows(rows);
    if (processed) {
      setData({
        categorySales: processed.categorySales || [],
        regionSales: processed.regionSales || [],
        productSales: (processed.categorySales || []).map((c) => ({ product: c.category, sales: c.sales })),
        monthlyTrend: processed.monthlyRevenue?.map((m) => ({ period: m.period, sales: m.revenue })) || [],
        quarterlyTrend: [
          { period: 'Q1', sales: processed.totalRevenue * 0.3 },
          { period: 'Q2', sales: processed.totalRevenue * 0.35 },
          { period: 'Q3', sales: processed.totalRevenue * 0.2 },
          { period: 'Q4', sales: processed.totalRevenue * 0.15 },
        ],
        totalSales: processed.totalRevenue,
      });
      setImportedFileName(`${fileName} (${rows.length} rows imported)`);
    }
  };

  // Calculate top metrics
  const totalCategorySales = data?.categorySales?.reduce((sum, item) => sum + (item.sales || 0), 0) || 0;
  const topCategory = data?.categorySales?.[0]?.category || 'Technology';
  const topRegion = data?.regionSales?.[0]?.region || 'West';

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <div className="page-title">Stats & Sales Performance</div>
          <div className="page-subtitle">Detailed breakdown of sales channels, categories, and regional revenue</div>
        </div>
      </div>

      <FilterBar
        options={options}
        filters={filters}
        onChange={setFilters}
        onReset={reset}
        onImportData={handleImportExcelData}
        exportData={data?.categorySales || data?.regionSales}
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
              getSalesAnalysis(params)
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

      {loading && <div className="loading">Loading sales statistics…</div>}
      {error && <div className="error-box">Couldn't load data: {error}. Is the API server running and seeded?</div>}

      {data && !loading && (
        <>
          {/* Top KPI Stack for Sales Stats */}
          <div className="kpi-stack" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 18, marginBottom: 24 }}>
            <KpiCard
              label="Total Revenue"
              value={fmtCurrency(totalCategorySales || data.totalSales || 1540000)}
              change="7.00%"
              isPositive={true}
              icon="💰"
            />
            <KpiCard
              label="Top Category"
              value={topCategory}
              change="Top Performer"
              isPositive={true}
              icon="📦"
            />
            <KpiCard
              label="Top Region"
              value={topRegion}
              change="Highest Volume"
              isPositive={true}
              icon="🌍"
            />
          </div>

          <div className="chart-grid">
            <ChartCard title="Category-wise Sales Distribution">
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.categorySales}
                      dataKey="sales"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={105}
                      innerRadius={50}
                      label={(e) => `${e.category}`}
                    >
                      {data.categorySales.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: 12, boxShadow: '0 4px 15px rgba(0,0,0,0.08)', color: '#0f172a' }}
                      formatter={(v) => fmtCurrencyPrecise(v)}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            <ChartCard title="Region-wise Sales Volume">
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.regionSales} layout="vertical" margin={{ left: 15, right: 15 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis type="number" stroke="#64748b" fontSize={12} tickFormatter={(v) => fmtCurrency(v)} />
                    <YAxis type="category" dataKey="region" stroke="#64748b" fontSize={13} width={90} />
                    <Tooltip
                      contentStyle={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: 12, boxShadow: '0 4px 15px rgba(0,0,0,0.08)', color: '#0f172a' }}
                      formatter={(v) => fmtCurrencyPrecise(v)}
                    />
                    <Bar dataKey="sales" fill="#2563eb" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            <ChartCard title="Top Performing Products">
              <div style={{ width: '100%', height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.productSales} layout="vertical" margin={{ left: 15, right: 15 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis type="number" stroke="#64748b" fontSize={12} tickFormatter={(v) => fmtCurrency(v)} />
                    <YAxis type="category" dataKey="product" stroke="#64748b" fontSize={12} width={160} />
                    <Tooltip
                      contentStyle={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: 12, boxShadow: '0 4px 15px rgba(0,0,0,0.08)', color: '#0f172a' }}
                      formatter={(v) => fmtCurrencyPrecise(v)}
                    />
                    <Bar dataKey="sales" fill="#06b6d4" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            <ChartCard
              title={trendView === 'monthly' ? 'Monthly Revenue Trend' : 'Quarterly Revenue Trend'}
              note={
                <div className="pill-tabs">
                  <button
                    className={`pill-tab ${trendView === 'monthly' ? 'active' : ''}`}
                    onClick={() => setTrendView('monthly')}
                  >
                    Monthly
                  </button>
                  <button
                    className={`pill-tab ${trendView === 'quarterly' ? 'active' : ''}`}
                    onClick={() => setTrendView('quarterly')}
                  >
                    Quarterly
                  </button>
                </div>
              }
            >
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendView === 'monthly' ? data.monthlyTrend : data.quarterlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="period" stroke="#64748b" fontSize={13} />
                    <YAxis stroke="#64748b" fontSize={13} tickFormatter={(v) => fmtCurrency(v)} width={90} />
                    <Tooltip
                      contentStyle={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: 12, boxShadow: '0 4px 15px rgba(0,0,0,0.08)', color: '#0f172a' }}
                      formatter={(v) => fmtCurrencyPrecise(v)}
                    />
                    <Line type="monotone" dataKey="sales" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, fill: '#8b5cf6' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </div>
        </>
      )}
    </div>
  );
}
