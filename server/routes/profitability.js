const express = require("express");
const Order = require("../models/Order");
const { buildMatchStage } = require("../utils/queryHelpers");

const router = express.Router();

/** GET /api/profitability/by-category -> profit + margin % per category */
router.get("/by-category", async (req, res, next) => {
  try {
    const match = buildMatchStage(req.query);
    const data = await Order.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$category",
          revenue: { $sum: "$sales" },
          profit: { $sum: "$profit" },
        },
      },
      { $sort: { profit: -1 } },
      {
        $project: {
          _id: 0,
          category: "$_id",
          revenue: { $round: ["$revenue", 2] },
          profit: { $round: ["$profit", 2] },
          profitMarginPct: {
            $round: [{ $multiply: [{ $cond: [{ $eq: ["$revenue", 0] }, 0, { $divide: ["$profit", "$revenue"] }] }, 100] }, 2],
          },
        },
      },
    ]);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

/** GET /api/profitability/by-region -> profit + margin % per region */
router.get("/by-region", async (req, res, next) => {
  try {
    const match = buildMatchStage(req.query);
    const data = await Order.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$region",
          revenue: { $sum: "$sales" },
          profit: { $sum: "$profit" },
        },
      },
      { $sort: { profit: -1 } },
      {
        $project: {
          _id: 0,
          region: "$_id",
          revenue: { $round: ["$revenue", 2] },
          profit: { $round: ["$profit", 2] },
          profitMarginPct: {
            $round: [{ $multiply: [{ $cond: [{ $eq: ["$revenue", 0] }, 0, { $divide: ["$profit", "$revenue"] }] }, 100] }, 2],
          },
        },
      },
    ]);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/profitability/discount-vs-profit
 * Buckets orders into discount bands (0%, 1-10%, 11-20%, ...) and shows
 * average profit / profit margin per band, to see how discounting erodes profit.
 */
router.get("/discount-vs-profit", async (req, res, next) => {
  try {
    const match = buildMatchStage(req.query);
    const data = await Order.aggregate([
      { $match: match },
      {
        $bucket: {
          groupBy: "$discount",
          boundaries: [0, 0.01, 0.1, 0.2, 0.3, 0.4, 0.5, 1.01],
          default: "other",
          output: {
            orders: { $sum: 1 },
            revenue: { $sum: "$sales" },
            profit: { $sum: "$profit" },
          },
        },
      },
      {
        $project: {
          _id: 0,
          discountBand: {
            $switch: {
              branches: [
                { case: { $eq: ["$_id", 0] }, then: "0%" },
                { case: { $eq: ["$_id", 0.01] }, then: "1-10%" },
                { case: { $eq: ["$_id", 0.1] }, then: "11-20%" },
                { case: { $eq: ["$_id", 0.2] }, then: "21-30%" },
                { case: { $eq: ["$_id", 0.3] }, then: "31-40%" },
                { case: { $eq: ["$_id", 0.4] }, then: "41-50%" },
              ],
              default: "other",
            },
          },
          orders: 1,
          revenue: { $round: ["$revenue", 2] },
          profit: { $round: ["$profit", 2] },
          avgProfitPerOrder: { $round: [{ $divide: ["$profit", "$orders"] }, 2] },
          profitMarginPct: {
            $round: [{ $multiply: [{ $cond: [{ $eq: ["$revenue", 0] }, 0, { $divide: ["$profit", "$revenue"] }] }, 100] }, 2],
          },
        },
      },
    ]);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/profitability/top-bottom-products?limit=10
 * -> top N most profitable and bottom N least profitable products
 */
router.get("/top-bottom-products", async (req, res, next) => {
  try {
    const match = buildMatchStage(req.query);
    const limit = Number(req.query.limit) || 10;

    const byProduct = await Order.aggregate([
      { $match: match },
      {
        $group: {
          _id: { product: "$product", category: "$category" },
          revenue: { $sum: "$sales" },
          profit: { $sum: "$profit" },
          unitsSold: { $sum: "$quantity" },
        },
      },
      {
        $project: {
          _id: 0,
          product: "$_id.product",
          category: "$_id.category",
          revenue: { $round: ["$revenue", 2] },
          profit: { $round: ["$profit", 2] },
          unitsSold: 1,
        },
      },
      { $sort: { profit: -1 } },
    ]);

    res.json({
      topPerforming: byProduct.slice(0, limit),
      bottomPerforming: byProduct.slice(-limit).reverse(),
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
