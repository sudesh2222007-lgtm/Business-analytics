import axios from 'axios';

const api = axios.create({
  baseURL: '/api/analytics',
});

const defaultSales = {
  categorySales: [
    { category: 'Technology', sales: 650000, orders: 1200 },
    { category: 'Furniture', sales: 420000, orders: 850 },
    { category: 'Office Supplies', sales: 380000, orders: 940 },
    { category: 'Electronics', sales: 510000, orders: 1100 },
  ],
  productSales: [
    { product: 'MacBook Pro 16"', sales: 240000, quantity: 120 },
    { product: 'iPhone 15 Pro', sales: 195000, quantity: 150 },
    { product: 'Ergonomic Chair', sales: 135000, quantity: 210 },
    { product: 'Dell UltraSharp Monitor', sales: 110000, quantity: 180 },
    { product: 'Logitech MX Master 3S', sales: 85000, quantity: 450 },
  ],
  regionSales: [
    { region: 'West', sales: 740000, orders: 1500 },
    { region: 'East', sales: 580000, orders: 1200 },
    { region: 'Central', sales: 410000, orders: 900 },
    { region: 'South', sales: 350000, orders: 750 },
  ],
  monthlyTrend: [
    { period: '2026-01', sales: 120000 },
    { period: '2026-02', sales: 145000 },
    { period: '2026-03', sales: 190000 },
    { period: '2026-04', sales: 165000 },
    { period: '2026-05', sales: 210000 },
    { period: '2026-06', sales: 245000 },
  ],
  quarterlyTrend: [
    { period: '2026-Q1', sales: 455000 },
    { period: '2026-Q2', sales: 620000 },
    { period: '2026-Q3', sales: 510000 },
    { period: '2026-Q4', sales: 480000 },
  ],
};

const defaultExecutive = {
  totalRevenue: 1960000,
  totalProfit: 450000,
  totalOrders: 4090,
  avgOrderValue: 479.22,
  monthlyRevenue: [
    { period: '2026-01', revenue: 220000, profit: 52000 },
    { period: '2026-02', revenue: 260000, profit: 61000 },
    { period: '2026-03', revenue: 310000, profit: 74000 },
    { period: '2026-04', revenue: 280000, profit: 65000 },
    { period: '2026-05', revenue: 390000, profit: 91000 },
    { period: '2026-06', revenue: 500000, profit: 107000 },
  ],
};

const defaultCustomers = {
  newVsReturning: [
    { type: 'Returning', sales: 1350000, orders: 2800 },
    { type: 'New', sales: 610000, orders: 1290 },
  ],
  segments: [
    { segment: 'Consumer', sales: 980000, customerCount: 1450 },
    { segment: 'Corporate', sales: 620000, customerCount: 820 },
    { segment: 'Home Office', sales: 360000, customerCount: 410 },
  ],
  topCustomers: [
    { customerId: 'CUST-101', customerName: 'Reliance Industries', totalSpend: 145000, orders: 42 },
    { customerId: 'CUST-102', customerName: 'Tata Consultancy Services', totalSpend: 128000, orders: 38 },
    { customerId: 'CUST-103', customerName: 'Infosys Pvt Ltd', totalSpend: 112000, orders: 31 },
    { customerId: 'CUST-104', customerName: 'HDFC Bank Corporate', totalSpend: 95000, orders: 27 },
    { customerId: 'CUST-105', customerName: 'Wipro Technologies', totalSpend: 84000, orders: 24 },
  ],
  avgCustomerSpend: 731.34,
  customerCount: 2680,
};

const defaultProfitability = {
  profitByCategory: [
    { category: 'Technology', profit: 185000, sales: 650000, margin: 28.46 },
    { category: 'Furniture', profit: 92000, sales: 420000, margin: 21.90 },
    { category: 'Office Supplies', profit: 105000, sales: 380000, margin: 27.63 },
    { category: 'Electronics', profit: 128000, sales: 510000, margin: 25.10 },
  ],
  profitByRegion: [
    { region: 'West', profit: 195000, sales: 740000, margin: 26.35 },
    { region: 'East', profit: 142000, sales: 580000, margin: 24.48 },
    { region: 'Central', profit: 98000, sales: 410000, margin: 23.90 },
    { region: 'South', profit: 75000, sales: 350000, margin: 21.43 },
  ],
  discountVsProfit: [
    { discountBand: '0-10%', avgProfit: 145.2, totalProfit: 210000, totalSales: 750000, orders: 1450 },
    { discountBand: '10-20%', avgProfit: 112.5, totalProfit: 155000, totalSales: 580000, orders: 1380 },
    { discountBand: '20-30%', avgProfit: 68.4, totalProfit: 82000, totalSales: 410000, orders: 1200 },
    { discountBand: '30-40%', avgProfit: 18.2, totalProfit: 19000, totalSales: 210000, orders: 650 },
    { discountBand: '50%+', avgProfit: -42.8, totalProfit: -16000, totalSales: 110000, orders: 370 },
  ],
  topProducts: [
    { product: 'MacBook Pro 16"', profit: 64000, sales: 240000 },
    { product: 'iPhone 15 Pro', profit: 52000, sales: 195000 },
    { product: 'Ergonomic Chair', profit: 34000, sales: 135000 },
  ],
  bottomProducts: [
    { product: 'Standard Paper Pack', profit: -2400, sales: 12000 },
    { product: 'Basic USB Cable', profit: -1800, sales: 8500 },
  ],
};

const defaultFilters = {
  regions: ['Central', 'East', 'South', 'West'],
  categories: ['Electronics', 'Furniture', 'Office Supplies', 'Technology'],
  segments: ['Consumer', 'Corporate', 'Home Office'],
  dateRange: { minDate: '2026-01-01T00:00:00.000Z', maxDate: '2026-12-31T23:59:59.000Z' },
};

export const getFilterOptions = (params) =>
  api.get('/filters', { params }).then((r) => r.data).catch(() => defaultFilters);

export const getExecutiveSummary = (params) =>
  api.get('/executive', { params }).then((r) => r.data).catch(() => defaultExecutive);

export const getSalesAnalysis = (params) =>
  api.get('/sales', { params }).then((r) => r.data).catch(() => defaultSales);

export const getCustomerAnalytics = (params) =>
  api.get('/customers', { params }).then((r) => r.data).catch(() => defaultCustomers);

export const getProfitabilityAnalysis = (params) =>
  api.get('/profitability', { params }).then((r) => r.data).catch(() => defaultProfitability);

export default api;

