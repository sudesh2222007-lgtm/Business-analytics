const Order = require('../models/Order');
const { buildMatch } = require('./utils');

// GET /api/analytics/customers
exports.getCustomerAnalytics = async (req, res) => {
  try {
    const match = buildMatch(req.query);

    const newVsReturning = await Order.aggregate([
      { $match: match },
      { $group: { _id: '$customerType', sales: { $sum: '$sales' }, orders: { $sum: 1 } } },
      { $project: { _id: 0, type: '$_id', sales: 1, orders: 1 } },
    ]);

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
    console.error(err);
    res.status(500).json({ message: 'Failed to load customer analytics', error: err.message });
  }
};
