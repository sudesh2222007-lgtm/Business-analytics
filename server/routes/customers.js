const express = require("express");
const Order = require("../models/Order");
const { buildMatchStage } = require("../utils/queryHelpers");

const router = express.Router();

/**
 * GET /api/customers/new-vs-returning
 * "New" = a customer's very first order (customerOrderSeq === 1)
 * "Returning" = any subsequent order from that customer
 * Returned both by order count and by revenue.
 */
router.get("/new-vs-returning", async (req, res, next) => {
  try {
    const match = buildMatchStage(req.query);
    const data = await Order.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$isReturningCustomer",
          orders: { $sum: 1 },
          revenue: { $sum: "$sales" },
        },
      },
      {
        $project: {
          _id: 0,
          type: { $cond: ["$_id", "Returning", "New"] },
          orders: 1,
          revenue: { $round: ["$revenue", 2] },
        },
      },
    ]);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/customers/segments
 * Buckets customers into 4 equal-sized value tiers based on total lifetime
 * spend within the filtered period: Platinum / Gold / Silver / Bronze.
 */
router.get("/segments", async (req, res, next) => {
  try {
    const match = buildMatchStage(req.query);

    const perCustomer = await Order.aggregate([
      { $match: match },
      { $group: { _id: "$customerId", totalSpend: { $sum: "$sales" } } },
    ]);

    if (perCustomer.length === 0) return res.json([]);

    const spends = perCustomer.map((c) => c.totalSpend).sort((a, b) => a - b);
    const quartile = (p) => spends[Math.min(spends.length - 1, Math.floor(p * spends.length))];
    const q1 = quartile(0.25);
    const q2 = quartile(0.5);
    const q3 = quartile(0.75);

    const segmentOf = (spend) => {
      if (spend <= q1) return "Bronze";
      if (spend <= q2) return "Silver";
      if (spend <= q3) return "Gold";
      return "Platinum";
    };

    const summary = { Bronze: { customers: 0, revenue: 0 }, Silver: { customers: 0, revenue: 0 }, Gold: { customers: 0, revenue: 0 }, Platinum: { customers: 0, revenue: 0 } };
    for (const c of perCustomer) {
      const seg = segmentOf(c.totalSpend);
      summary[seg].customers += 1;
      summary[seg].revenue += c.totalSpend;
    }

    const data = Object.entries(summary).map(([segment, v]) => ({
      segment,
      customers: v.customers,
      revenue: Math.round(v.revenue * 100) / 100,
    }));

    res.json(data);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/customers/top?limit=10
 * -> highest-spending customers
 */
router.get("/top", async (req, res, next) => {
  try {
    const match = buildMatchStage(req.query);
    const limit = Number(req.query.limit) || 10;

    const data = await Order.aggregate([
      { $match: match },
      {
        $group: {
          _id: { customerId: "$customerId", customerName: "$customerName" },
          totalSpend: { $sum: "$sales" },
          totalProfit: { $sum: "$profit" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { totalSpend: -1 } },
      { $limit: limit },
      {
        $project: {
          _id: 0,
          customerId: "$_id.customerId",
          customerName: "$_id.customerName",
          totalSpend: { $round: ["$totalSpend", 2] },
          totalProfit: { $round: ["$totalProfit", 2] },
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
 * GET /api/customers/avg-spending
 * -> average total spend per unique customer, and average spend per order
 */
router.get("/avg-spending", async (req, res, next) => {
  try {
    const match = buildMatchStage(req.query);

    const [result] = await Order.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$customerId",
          customerSpend: { $sum: "$sales" },
          customerOrders: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: null,
          totalCustomers: { $sum: 1 },
          totalRevenue: { $sum: "$customerSpend" },
          totalOrders: { $sum: "$customerOrders" },
        },
      },
      {
        $project: {
          _id: 0,
          totalCustomers: 1,
          averageSpendPerCustomer: { $round: [{ $divide: ["$totalRevenue", "$totalCustomers"] }, 2] },
          averageOrdersPerCustomer: { $round: [{ $divide: ["$totalOrders", "$totalCustomers"] }, 2] },
        },
      },
    ]);

    res.json(result || { totalCustomers: 0, averageSpendPerCustomer: 0, averageOrdersPerCustomer: 0 });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
