const Order = require('../models/Order');
const { buildMatch } = require('./utils');

// GET /api/analytics/sales
exports.getSalesAnalysis = async (req, res) => {
  try {
    const match = buildMatch(req.query);

    const categorySales = await Order.aggregate([
      { $match: match },
      { $group: { _id: '$category', sales: { $sum: '$sales' }, orders: { $sum: 1 } } },
      { $sort: { sales: -1 } },
      { $project: { _id: 0, category: '$_id', sales: 1, orders: 1 } },
    ]);

    const productSales = await Order.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$productName',
          sales: { $sum: '$sales' },
          quantity: { $sum: '$quantity' },
        },
      },
      { $sort: { sales: -1 } },
      { $limit: 10 },
      { $project: { _id: 0, product: '$_id', sales: 1, quantity: 1 } },
    ]);

    const regionSales = await Order.aggregate([
      { $match: match },
      { $group: { _id: '$region', sales: { $sum: '$sales' }, orders: { $sum: 1 } } },
      { $sort: { sales: -1 } },
      { $project: { _id: 0, region: '$_id', sales: 1, orders: 1 } },
    ]);

    const monthlyTrend = await Order.aggregate([
      { $match: match },
      {
        $group: {
          _id: { year: { $year: '$orderDate' }, month: { $month: '$orderDate' } },
          sales: { $sum: '$sales' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      {
        $project: {
          _id: 0,
          period: {
            $concat: [
              { $toString: '$_id.year' },
              '-',
              {
                $cond: [
                  { $lt: ['$_id.month', 10] },
                  { $concat: ['0', { $toString: '$_id.month' }] },
                  { $toString: '$_id.month' },
                ],
              },
            ],
          },
          sales: 1,
        },
      },
    ]);

    const quarterlyTrend = await Order.aggregate([
      { $match: match },
      {
        $group: {
          _id: { year: { $year: '$orderDate' }, quarter: { $ceil: { $divide: [{ $month: '$orderDate' }, 3] } } },
          sales: { $sum: '$sales' },
        },
      },
      { $sort: { '_id.year': 1, '_id.quarter': 1 } },
      {
        $project: {
          _id: 0,
          period: { $concat: [{ $toString: '$_id.year' }, '-Q', { $toString: '$_id.quarter' }] },
          sales: 1,
        },
      },
    ]);

    res.json({ categorySales, productSales, regionSales, monthlyTrend, quarterlyTrend });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load sales analysis', error: err.message });
  }
};
