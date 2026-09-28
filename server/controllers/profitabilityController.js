const Order = require('../models/Order');
const { buildMatch } = require('./utils');

// GET /api/analytics/profitability
exports.getProfitabilityAnalysis = async (req, res) => {
  try {
    const match = buildMatch(req.query);

    const profitByCategory = await Order.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$category',
          profit: { $sum: '$profit' },
          sales: { $sum: '$sales' },
        },
      },
      {
        $project: {
          _id: 0,
          category: '$_id',
          profit: 1,
          sales: 1,
          margin: {
            $cond: [{ $eq: ['$sales', 0] }, 0, { $multiply: [{ $divide: ['$profit', '$sales'] }, 100] }],
          },
        },
      },
      { $sort: { profit: -1 } },
    ]);

    const profitByRegion = await Order.aggregate([
      { $match: match },
      { $group: { _id: '$region', profit: { $sum: '$profit' }, sales: { $sum: '$sales' } } },
      {
        $project: {
          _id: 0,
          region: '$_id',
          profit: 1,
          sales: 1,
          margin: {
            $cond: [{ $eq: ['$sales', 0] }, 0, { $multiply: [{ $divide: ['$profit', '$sales'] }, 100] }],
          },
        },
      },
      { $sort: { profit: -1 } },
    ]);

    // Bucket discount into bands and see average profit margin per band
    const discountVsProfit = await Order.aggregate([
      { $match: match },
      {
        $bucket: {
          groupBy: '$discount',
          boundaries: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 1],
          default: '0.5+',
          output: {
            avgProfit: { $avg: '$profit' },
            totalProfit: { $sum: '$profit' },
            totalSales: { $sum: '$sales' },
            orders: { $sum: 1 },
          },
        },
      },
      {
        $project: {
          _id: 0,
          discountBand: {
            $switch: {
              branches: [
                { case: { $eq: ['$_id', 0] }, then: '0-10%' },
                { case: { $eq: ['$_id', 0.1] }, then: '10-20%' },
                { case: { $eq: ['$_id', 0.2] }, then: '20-30%' },
                { case: { $eq: ['$_id', 0.3] }, then: '30-40%' },
                { case: { $eq: ['$_id', 0.4] }, then: '40-50%' },
              ],
              default: '50%+',
            },
          },
          avgProfit: { $round: ['$avgProfit', 2] },
          totalProfit: 1,
          totalSales: 1,
          orders: 1,
        },
      },
    ]);

    const productProfitAgg = await Order.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$productName',
          profit: { $sum: '$profit' },
          sales: { $sum: '$sales' },
        },
      },
      { $sort: { profit: -1 } },
    ]);

    const topProducts = productProfitAgg.slice(0, 10);
    const bottomProducts = [...productProfitAgg].sort((a, b) => a.profit - b.profit).slice(0, 10);

    res.json({
      profitByCategory,
      profitByRegion,
      discountVsProfit,
      topProducts,
      bottomProducts,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load profitability analysis', error: err.message });
  }
};
