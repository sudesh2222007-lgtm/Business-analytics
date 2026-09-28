const express = require("express");
const Order = require("../models/Order");
const { buildMatchStage } = require("../utils/queryHelpers");

const router = express.Router();

/** GET /api/meta/filters -> distinct values for building Power BI slicers/parameters */
router.get("/filters", async (req, res, next) => {
  try {
    const [regions, categories, years, statuses, paymentMethods] = await Promise.all([
      Order.distinct("region"),
      Order.distinct("category"),
      Order.distinct("year"),
      Order.distinct("orderStatus"),
      Order.distinct("paymentMethod"),
    ]);
    res.json({
      regions: regions.sort(),
      categories: categories.sort(),
      years: years.sort(),
      orderStatuses: statuses.sort(),
      paymentMethods: paymentMethods.sort(),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/orders?page=1&pageSize=5000
 * Raw, filtered order-line data — useful if you'd rather pull the flat
 * table into Power Query and build measures with DAX instead of using
 * the pre-aggregated endpoints above.
 */
router.get("/orders", async (req, res, next) => {
  try {
    const match = buildMatchStage(req.query);
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(10000, Number(req.query.pageSize) || 5000);

    const [total, rows] = await Promise.all([
      Order.countDocuments(match),
      Order.find(match)
        .sort({ orderDate: 1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .select("-__v -_id -createdAt -updatedAt")
        .lean(),
    ]);

    res.json({ page, pageSize, total, totalPages: Math.ceil(total / pageSize), rows });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
