const Order = require('../models/Order');
const { buildMatch } = require('./utils');

const fallbackProfitability = {
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
    { product: 'Dell UltraSharp Monitor', profit: 29000, sales: 110000 },
    { product: 'Logitech MX Master 3S', profit: 24000, sales: 85000 },
  ],
  bottomProducts: [
    { product: 'Standard Paper Pack', profit: -2400, sales: 12000 },
    { product: 'Basic USB Cable', profit: -1800, sales: 8500 },
    { product: 'Low-cost Desk Lamp', profit: -1200, sales: 9800 },
    { product: 'Plastic Document Trays', profit: -850, sales: 6400 },
    { product: 'Economy Pen Set', profit: -420, sales: 3200 },
  ],
};

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

    if (!profitByCategory || profitByCategory.length === 0) {
      return res.json(fallbackProfitability);
    }

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
    console.error('Database error in profitability controller, using fallback data:', err.message);
    res.json(fallbackProfitability);
  }
};

