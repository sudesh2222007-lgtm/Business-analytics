const Order = require('../models/Order');

const fallbackFilters = {
  regions: ['Central', 'East', 'South', 'West'],
  categories: ['Electronics', 'Furniture', 'Office Supplies', 'Technology'],
  segments: ['Consumer', 'Corporate', 'Home Office'],
  dateRange: { minDate: '2026-01-01T00:00:00.000Z', maxDate: '2026-12-31T23:59:59.000Z' },
};

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

    if (!regions || regions.length === 0) {
      return res.json(fallbackFilters);
    }

    res.json({
      regions: regions.sort(),
      categories: categories.sort(),
      segments: segments.sort(),
      dateRange: dateRange[0] || fallbackFilters.dateRange,
    });
  } catch (err) {
    console.error('Database error in filter controller, returning fallback filters:', err.message);
    res.json(fallbackFilters);
  }
};

