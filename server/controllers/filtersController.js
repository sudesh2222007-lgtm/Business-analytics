const Order = require('../models/Order');

// GET /api/analytics/filters -> distinct values to populate dropdown filters on the frontend
exports.getFilterOptions = async (req, res) => {
  try {
    const [regions, categories, segments, dateRange] = await Promise.all([
      Order.distinct('region'),
      Order.distinct('category'),
      Order.distinct('segment'),
      Order.aggregate([
        {
          $group: {
            _id: null,
            minDate: { $min: '$orderDate' },
            maxDate: { $max: '$orderDate' },
          },
        },
      ]),
    ]);

    res.json({
      regions: regions.sort(),
      categories: categories.sort(),
      segments: segments.sort(),
      dateRange: dateRange[0] || { minDate: null, maxDate: null },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load filter options', error: err.message });
  }
};
