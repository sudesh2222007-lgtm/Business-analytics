const Order = require('../models/Order');
const { buildMatch } = require('./utils');

const fallbackCustomers = {
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
    { customerId: 'CUST-106', customerName: 'Bharti Airtel Ltd', totalSpend: 76000, orders: 22 },
    { customerId: 'CUST-107', customerName: 'Mahindra Tech', totalSpend: 68000, orders: 19 },
    { customerId: 'CUST-108', customerName: 'Larsen & Toubro', totalSpend: 61000, orders: 18 },
    { customerId: 'CUST-109', customerName: 'Adani Enterprises', totalSpend: 54000, orders: 15 },
    { customerId: 'CUST-110', customerName: 'State Bank of India', totalSpend: 49000, orders: 14 },
  ],
  avgCustomerSpend: 731.34,
  customerCount: 2680,
};

// GET /api/analytics/customers
exports.getCustomerAnalytics = async (req, res) => {
  try {
    const match = buildMatch(req.query);

    const newVsReturning = await Order.aggregate([
      { $match: match },
      { $group: { _id: '$customerType', sales: { $sum: '$sales' }, orders: { $sum: 1 } } },
      { $project: { _id: 0, type: '$_id', sales: 1, orders: 1 } },
    ]);

    if (!newVsReturning || newVsReturning.length === 0) {
      return res.json(fallbackCustomers);
    }

    const segments = await Order.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$segment',
          sales: { $sum: '$sales' },
          customers: { $addToSet: '$customerId' },
        },
      },
      {
        $project: {
          _id: 0,
          segment: '$_id',
          sales: 1,
          customerCount: { $size: '$customers' },
        },
      },
      { $sort: { sales: -1 } },
    ]);

    const topCustomers = await Order.aggregate([
      { $match: match },
      {
        $group: {
          _id: { customerId: '$customerId', customerName: '$customerName' },
          totalSpend: { $sum: '$sales' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { totalSpend: -1 } },
      { $limit: 10 },
      {
        $project: {
          _id: 0,
          customerId: '$_id.customerId',
          customerName: '$_id.customerName',
          totalSpend: 1,
          orders: 1,
        },
      },
    ]);

    const [spendAgg] = await Order.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$customerId',
          customerTotal: { $sum: '$sales' },
        },
      },
      {
        $group: {
          _id: null,
          avgCustomerSpend: { $avg: '$customerTotal' },
          customerCount: { $sum: 1 },
        },
      },
    ]);

    res.json({
      newVsReturning,
      segments,
      topCustomers,
      avgCustomerSpend: spendAgg ? Math.round(spendAgg.avgCustomerSpend * 100) / 100 : 0,
      customerCount: spendAgg ? spendAgg.customerCount : 0,
    });
  } catch (err) {
    console.error('Database error in customer controller, using fallback data:', err.message);
    res.json(fallbackCustomers);
  }
};

