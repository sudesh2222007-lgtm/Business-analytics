const express = require("express");
const Order = require("../models/Order");
const { buildMatchStage } = require("../utils/queryHelpers");

const router = express.Router();

/**
 * GET /api/executive/summary
 * -> Total Revenue, Total Profit, Total Orders, Average Order Value
 */
router.get("/summary", async (req, res, next) => {
  try {
    const match = buildMatchStage(req.query);
    const [result] = await Order.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$sales" },
          totalProfit: { $sum: "$profit" },
          totalOrders: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          totalRevenue: { $round: ["$totalRevenue", 2] },
          totalProfit: { $round: ["$totalProfit", 2] },
          totalOrders: 1,
          averageOrderValue: {
            $round: [{ $cond: [{ $eq: ["$totalOrders", 0] }, 0, { $divide: ["$totalRevenue", "$totalOrders"] }] }, 2],
          },
        },
      },
    ]);

    res.json(result || { totalRevenue: 0, totalProfit: 0, totalOrders: 0, averageOrderValue: 0 });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/executive/monthly-revenue
 * -> [{ monthLabel: "2024-01", revenue: 123456 }, ...] sorted chronologically
 */
router.get("/monthly-revenue", async (req, res, next) => {
  try {
    const match = buildMatchStage(req.query);
    const data = await Order.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$monthLabel",
          revenue: { $sum: "$sales" },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, monthLabel: "$_id", revenue: { $round: ["$revenue", 2] } } },
    ]);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/executive/revenue-vs-profit
 * -> [{ monthLabel: "2024-01", revenue: 123456, profit: 34567 }, ...]
 */
router.get("/revenue-vs-profit", async (req, res, next) => {
  try {
    const match = buildMatchStage(req.query);
    const data = await Order.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$monthLabel",
          revenue: { $sum: "$sales" },
          profit: { $sum: "$profit" },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          monthLabel: "$_id",
          revenue: { $round: ["$revenue", 2] },
          profit: { $round: ["$profit", 2] },
        },
      },
    ]);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
