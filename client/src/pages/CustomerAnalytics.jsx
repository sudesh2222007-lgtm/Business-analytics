import { useEffect, useState } from 'react';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from 'recharts';
import FilterBar from '../components/FilterBar.jsx';
import ChartCard from '../components/ChartCard.jsx';
import KpiCard from '../components/KpiCard.jsx';
import useFilters from '../hooks/useFilters.js';
import { getCustomerAnalytics } from '../api.js';
import { fmtCurrency, fmtCurrencyPrecise, fmtNumber } from '../utils/format.js';

const COLORS = ['#4f7cff', '#22c3a6', '#9b7bff', '#f5a623'];

export default function CustomerAnalytics() {
  const { options, filters, setFilters, reset, params } = useFilters();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    getCustomerAnalytics(params)
      .then((d) => { setData(d); setError(null); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(params)]);

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Customer Analytics</div>
          <div className="page-subtitle">Who's buying, and how much</div>
        </div>
      </div>

      <FilterBar options={options} filters={filters} onChange={setFilters} onReset={reset} />

      {loading && <div className="loading">Loading customer data…</div>}
      {error && <div className="error-box">Couldn't load data: {error}. Is the API server running and seeded?</div>}

      {data && !loading && (
        <>
          <div className="kpi-grid">
            <KpiCard label="Avg Customer Spend" value={fmtCurrencyPrecise(data.avgCustomerSpend)} color="#4f7cff" />
            <KpiCard label="Active Customers" value={fmtNumber(data.customerCount)} color="#22c3a6" />
          </div>

          <div className="chart-grid">
            <ChartCard title="New vs Returning Customers">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={data.newVsReturning}
                    dataKey="orders"
                    nameKey="type"
                    cx="50%"
                    cy="50%"
                    outerRadius={95}
                    label={(e) => `${e.type} (${e.orders})`}
                    labelLine={false}
                  >
                    {data.newVsReturning.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: 8, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', color: '#0f172a' }} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Customer Segments">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data.segments}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="segment" stroke="#64748b" fontSize={13} />
                  <YAxis stroke="#64748b" fontSize={13} tickFormatter={(v) => fmtCurrency(v)} width={85} />
                  <Tooltip
                    contentStyle={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: 8, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', color: '#0f172a' }}
                    formatter={(v, name) => (name === 'sales' ? fmtCurrencyPrecise(v) : v)}
                  />
                  <Legend wrapperStyle={{ fontSize: 13 }} />
                  <Bar dataKey="sales" name="Sales" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="customerCount" name="Customers" fill="#d97706" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Top 10 Customers by Spend">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Orders</th>
                    <th>Total Spend</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topCustomers.map((c) => (
                    <tr key={c.customerId}>
                      <td>{c.customerName}</td>
                      <td>{c.orders}</td>
                      <td>{fmtCurrencyPrecise(c.totalSpend)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ChartCard>
          </div>
        </>
      )}
    </div>
  );
}
