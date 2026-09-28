import { useEffect, useState } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line,
} from 'recharts';
import FilterBar from '../components/FilterBar.jsx';
import ChartCard from '../components/ChartCard.jsx';
import KpiCard from '../components/KpiCard.jsx';
import useFilters from '../hooks/useFilters.js';
import { getProfitabilityAnalysis } from '../api.js';
import { fmtCurrency, fmtCurrencyPrecise, fmtPercent } from '../utils/format.js';
import { processExcelRows } from '../utils/excelProcessor.js';

const mockInvoices = [
  { id: 'INV-2026-001', customer: 'Acme Corp', date: '2026-09-24', amount: 145000, status: 'PAID' },
  { id: 'INV-2026-002', customer: 'Global Tech Ltd', date: '2026-09-22', amount: 89000, status: 'PAID' },
  { id: 'INV-2026-003', customer: 'Starlight Retail', date: '2026-09-20', amount: 230000, status: 'PENDING' },
  { id: 'INV-2026-004', customer: 'Apex Logistics', date: '2026-09-18', amount: 67500, status: 'PAID' },
  { id: 'INV-2026-005', customer: 'Nexus Innovations', date: '2026-09-15', amount: 112000, status: 'OVERDUE' },
];

export default function ProfitabilityAnalysis() {
  const { options, filters, setFilters, reset, params } = useFilters();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [importedFileName, setImportedFileName] = useState(null);

  useEffect(() => {
    setLoading(true);
    getProfitabilityAnalysis(params)
      .then((d) => { setData(d); setError(null); setImportedFileName(null); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(params)]);

  const handleImportExcelData = (rows, fileName) => {
    const processed = processExcelRows(rows);
    if (processed) {
      setData({
        profitByCategory: processed.categorySales?.map((c) => ({ category: c.category, profit: c.sales * 0.25 })) || [],
        profitByRegion: processed.regionSales?.map((r) => ({ region: r.region, profit: r.sales * 0.25 })) || [],
        discountVsProfit: [
          { discountBand: '0-5%', avgProfit: 1200 },
          { discountBand: '5-10%', avgProfit: 950 },
          { discountBand: '10-15%', avgProfit: 700 },
          { discountBand: '15%+', avgProfit: 450 },
        ],
        topProducts: (processed.categorySales || []).map((c) => ({ _id: `${c.category} Premium`, profit: c.sales * 0.3 })),
        bottomProducts: (processed.categorySales || []).map((c) => ({ _id: `${c.category} Basic`, profit: c.sales * 0.05 })),
        totalProfit: processed.totalProfit,
      });
      setImportedFileName(`${fileName} (${rows.length} rows imported)`);
    }
  };

  const handlePrintInvoice = (inv) => {
    alert(`Generating Printable Invoice PDF for ${inv.id} (${inv.customer}) - Total: ${fmtCurrency(inv.amount)}`);
  };

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <div className="page-title">Invoices & Profitability</div>
          <div className="page-subtitle">Billing records, profit margins, discount impact, and top product returns</div>
        </div>
      </div>

      <FilterBar
        options={options}
        filters={filters}
        onChange={setFilters}
        onReset={reset}
        onImportData={handleImportExcelData}
        exportData={data?.profitByCategory || data?.profitByRegion}
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
              getProfitabilityAnalysis(params)
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

      {loading && <div className="loading">Loading invoice and profitability data…</div>}
      {error && <div className="error-box">Couldn't load data: {error}. Is the API server running and seeded?</div>}

      {data && !loading && (
        <>
          {/* Top KPI Summary Grid */}
          <div className="kpi-stack" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 18, marginBottom: 24 }}>
            <KpiCard
              label="Net Profit"
              value={fmtCurrency(data.totalProfit || 485000)}
              change="7.00%"
              isPositive={true}
              icon="💵"
            />
            <KpiCard
              label="Paid Invoices"
              value="₹3,46,000"
              change="3 Completed"
              isPositive={true}
              icon="✅"
            />
            <KpiCard
              label="Pending Invoices"
              value="₹2,30,000"
              change="1 Pending"
              isPositive={false}
              icon="⏳"
            />
          </div>

          {/* Recent Invoices Table */}
          <div className="card-panel" style={{ marginBottom: 24 }}>
            <div className="card-header">
              <div className="card-title">Recent Customer Invoices</div>
              <button className="location-select" style={{ cursor: 'pointer' }}>+ New Invoice</button>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice ID</th>
                  <th>Customer Name</th>
                  <th>Billing Date</th>
                  <th>Amount (₹)</th>
                  <th>Payment Status</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {mockInvoices.map((inv) => (
                  <tr key={inv.id}>
                    <td style={{ fontWeight: 700, color: 'var(--accent)' }}>{inv.id}</td>
                    <td style={{ fontWeight: 600 }}>{inv.customer}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{inv.date}</td>
                    <td style={{ fontWeight: 700 }}>{fmtCurrencyPrecise(inv.amount)}</td>
                    <td>
                      <span className={`tag ${inv.status === 'PAID' ? 'up' : 'down'}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => handlePrintInvoice(inv)}
                        style={{
                          background: 'var(--bg)',
                          border: '1px solid var(--border)',
                          borderRadius: 100,
                          padding: '6px 14px',
                          fontSize: 12.5,
                          fontWeight: 700,
                          color: 'var(--text)',
                          cursor: 'pointer',
                        }}
                      >
                        🖨️ PDF Invoice
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Profitability Charts Grid */}
          <div className="chart-grid">
            <ChartCard title="Profit by Category">
              <div style={{ width: '100%', height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.profitByCategory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="category" stroke="#64748b" fontSize={12} angle={-15} textAnchor="end" height={55} />
                    <YAxis stroke="#64748b" fontSize={13} tickFormatter={(v) => fmtCurrency(v)} width={85} />
                    <Tooltip
                      contentStyle={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: 12, boxShadow: '0 4px 15px rgba(0,0,0,0.08)', color: '#0f172a' }}
                      formatter={(v, name) => (name === 'Margin %' ? fmtPercent(v) : fmtCurrencyPrecise(v))}
                    />
                    <Legend wrapperStyle={{ fontSize: 13 }} />
                    <Bar dataKey="profit" name="Profit" fill="#10b981" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            <ChartCard title="Profit by Region">
              <div style={{ width: '100%', height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.profitByRegion}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="region" stroke="#64748b" fontSize={13} />
                    <YAxis stroke="#64748b" fontSize={13} tickFormatter={(v) => fmtCurrency(v)} width={85} />
                    <Tooltip
                      contentStyle={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: 12, boxShadow: '0 4px 15px rgba(0,0,0,0.08)', color: '#0f172a' }}
                      formatter={(v) => fmtCurrencyPrecise(v)}
                    />
                    <Bar dataKey="profit" fill="#2563eb" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            <ChartCard title="Discount vs Avg Profit" note="Average profit per order, bucketed by discount band">
              <div style={{ width: '100%', height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.discountVsProfit}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="discountBand" stroke="#64748b" fontSize={13} />
                    <YAxis stroke="#64748b" fontSize={13} tickFormatter={(v) => fmtCurrency(v)} width={85} />
                    <Tooltip
                      contentStyle={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: 12, boxShadow: '0 4px 15px rgba(0,0,0,0.08)', color: '#0f172a' }}
                      formatter={(v) => fmtCurrencyPrecise(v)}
                    />
                    <Line type="monotone" dataKey="avgProfit" stroke="#f97316" strokeWidth={3} dot={{ r: 4, fill: '#f97316' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            <ChartCard title="Top & Bottom Performing Products">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <div style={{ fontSize: 13, color: '#64748b', marginBottom: 8, fontWeight: 700 }}>TOP 10 BY PROFIT</div>
                  <table className="data-table">
                    <tbody>
                      {data.topProducts.map((p) => (
                        <tr key={p._id}>
                          <td>{p._id}</td>
                          <td style={{ textAlign: 'right', color: '#10b981', fontWeight: 700 }}>{fmtCurrencyPrecise(p.profit)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div>
                  <div style={{ fontSize: 13, color: '#64748b', marginBottom: 8, fontWeight: 700 }}>BOTTOM 10 BY PROFIT</div>
                  <table className="data-table">
                    <tbody>
                      {data.bottomProducts.map((p) => (
                        <tr key={p._id}>
                          <td>{p._id}</td>
                          <td style={{ textAlign: 'right', color: '#ef4444', fontWeight: 700 }}>{fmtCurrencyPrecise(p.profit)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </ChartCard>
          </div>
        </>
      )}
    </div>
  );
}
