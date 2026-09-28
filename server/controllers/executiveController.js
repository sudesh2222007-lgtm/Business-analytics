const Order = require('../models/Order');
const { buildMatch } = require('./utils');

// GET /api/analytics/executive
exports.getExecutiveSummary = async (req, res) => {
  try {
    const match = buildMatch(req.query);

    const [totals] = await Order.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$sales' },
          totalProfit: { $sum: '$profit' },
          totalOrders: { $sum: 1 },
        },
      },
    ]);

    const summary = totals || { totalRevenue: 0, totalProfit: 0, totalOrders: 0 };
    const avgOrderValue = summary.totalOrders ? summary.totalRevenue / summary.totalOrders : 0;

    const monthlyRevenue = await Order.aggregate([
      { $match: match },
      {
        $group: {
          _id: { year: { $year: '$orderDate' }, month: { $month: '$orderDate' } },
          revenue: { $sum: '$sales' },
          profit: { $sum: '$profit' },
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
          revenue: 1,
          profit: 1,
        },
      },
    ]);

    res.json({
      totalRevenue: Math.round(summary.totalRevenue * 100) / 100,
      totalProfit: Math.round(summary.totalProfit * 100) / 100,
      totalOrders: summary.totalOrders,
      avgOrderValue: Math.round(avgOrderValue * 100) / 100,
      monthlyRevenue,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load executive summary', error: err.message });
  }
};
