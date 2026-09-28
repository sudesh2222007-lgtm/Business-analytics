const express = require("express");
const Order = require("../models/Order");
const { buildMatchStage } = require("../utils/queryHelpers");

const router = express.Router();

/** GET /api/sales/by-category -> revenue, profit, orders, units per category */
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
          orders: { $sum: 1 },
          unitsSold: { $sum: "$quantity" },
        },
      },
      { $sort: { revenue: -1 } },
      {
        $project: {
          _id: 0,
          category: "$_id",
          revenue: { $round: ["$revenue", 2] },
          profit: { $round: ["$profit", 2] },
          orders: 1,
          unitsSold: 1,
        },
      },
    ]);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

/** GET /api/sales/by-product -> revenue, profit, units per product (top N via ?limit=) */
router.get("/by-product", async (req, res, next) => {
  try {
    const match = buildMatchStage(req.query);
    const limit = Number(req.query.limit) || 0; // 0 = no limit

    const pipeline = [
      { $match: match },
      {
        $group: {
          _id: { product: "$product", category: "$category" },
          revenue: { $sum: "$sales" },
          profit: { $sum: "$profit" },
          orders: { $sum: 1 },
          unitsSold: { $sum: "$quantity" },
        },
      },
      { $sort: { revenue: -1 } },
    ];
    if (limit > 0) pipeline.push({ $limit: limit });
    pipeline.push({
      $project: {
        _id: 0,
        product: "$_id.product",
        category: "$_id.category",
        revenue: { $round: ["$revenue", 2] },
        profit: { $round: ["$profit", 2] },
        orders: 1,
        unitsSold: 1,
      },
    });

    const data = await Order.aggregate(pipeline);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

/** GET /api/sales/by-region -> revenue, profit, orders per region (and state breakdown) */
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
          orders: { $sum: 1 },
        },
      },
      { $sort: { revenue: -1 } },
      {
        $project: {
          _id: 0,
          region: "$_id",
          revenue: { $round: ["$revenue", 2] },
          profit: { $round: ["$profit", 2] },
          orders: 1,
        },
      },
    ]);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/sales/trends?granularity=month|quarter
 * -> revenue/profit/orders over time at the requested granularity
 */
router.get("/trends", async (req, res, next) => {
  try {
    const match = buildMatchStage(req.query);
    const granularity = req.query.granularity === "quarter" ? "quarter" : "month";

    const groupId =
      granularity === "quarter"
        ? { year: "$year", quarter: "$quarter" }
        : { year: "$year", month: "$month", monthLabel: "$monthLabel" };

    const data = await Order.aggregate([
      { $match: match },
      {
        $group: {
          _id: groupId,
          revenue: { $sum: "$sales" },
          profit: { $sum: "$profit" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.quarter": 1, "_id.month": 1 } },
      {
        $project: {
          _id: 0,
          label:
            granularity === "quarter"
              ? { $concat: [{ $toString: "$_id.year" }, "-Q", { $toString: "$_id.quarter" }] }
              : "$_id.monthLabel",
          revenue: { $round: ["$revenue", 2] },
          profit: { $round: ["$profit", 2] },
          orders: 1,
        },
      },
    ]);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
