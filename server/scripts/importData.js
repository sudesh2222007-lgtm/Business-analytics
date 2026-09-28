/**
 * Imports business_analytics_ecommerce_10000.csv into MongoDB.
 *
 * Usage:
 *   npm run import-data
 *
 * What it does:
 *   1. Streams the CSV with csv-parser
 *   2. Normalizes/casts each row to match the Order schema
 *   3. Computes derived fields (year, quarter, month, monthLabel)
 *   4. Sorts orders per customer by date to compute customerOrderSeq
 *      and isReturningCustomer (seq 1 = new, seq > 1 = returning)
 *   5. Wipes the existing Orders collection and bulk-inserts everything
 */

require("dotenv").config();
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Order = require("../models/Order");

const CSV_PATH = process.env.CSV_PATH || path.join(__dirname, "../../data/business_analytics_ecommerce_10000.csv");

function toDate(dateStr) {
  // CSV format: YYYY-MM-DD
  return new Date(dateStr + "T00:00:00.000Z");
}

function quarterOf(monthIndex1to12) {
  return Math.floor((monthIndex1to12 - 1) / 3) + 1;
}

async function run() {
  if (!fs.existsSync(CSV_PATH)) {
    console.error(`CSV not found at ${CSV_PATH}. Set CSV_PATH in .env or place the file there.`);
    process.exit(1);
  }

  await connectDB();

  const rawRows = [];

  await new Promise((resolve, reject) => {
    fs.createReadStream(CSV_PATH)
      .pipe(csv())
      .on("data", (row) => rawRows.push(row))
      .on("end", resolve)
      .on("error", reject);
  });

  console.log(`Read ${rawRows.length} rows from CSV`);

  // Cast + derive time fields
  const parsed = rawRows.map((r) => {
    const date = toDate(r.Order_Date);
    const month = date.getUTCMonth() + 1;
    const year = date.getUTCFullYear();
    return {
      orderId: r.Order_ID,
      orderDate: date,
      customerId: r.Customer_ID,
      customerName: r.Customer_Name,
      gender: r.Gender,
      age: Number(r.Age),
      city: r.City,
      state: r.State,
      region: r.Region,
      product: r.Product,
      category: r.Category,
      quantity: Number(r.Quantity),
      unitPrice: Number(r.Unit_Price),
      discount: Number(r.Discount),
      sales: Number(r.Sales),
      cost: Number(r.Cost),
      profit: Number(r.Profit),
      paymentMethod: r.Payment_Method,
      orderStatus: r.Order_Status,
      year,
      quarter: quarterOf(month),
      month,
      monthLabel: `${year}-${String(month).padStart(2, "0")}`,
    };
  });

  // Compute customerOrderSeq / isReturningCustomer per customer, ordered by date
  const byCustomer = new Map();
  for (const row of parsed) {
    if (!byCustomer.has(row.customerId)) byCustomer.set(row.customerId, []);
    byCustomer.get(row.customerId).push(row);
  }

  for (const rows of byCustomer.values()) {
    rows.sort((a, b) => a.orderDate - b.orderDate);
    rows.forEach((row, idx) => {
      row.customerOrderSeq = idx + 1;
      row.isReturningCustomer = idx > 0;
    });
  }

  console.log("Wiping existing Orders collection...");
  await Order.deleteMany({});

  console.log("Inserting documents...");
  const BATCH = 1000;
  for (let i = 0; i < parsed.length; i += BATCH) {
    await Order.insertMany(parsed.slice(i, i + BATCH), { ordered: false });
    console.log(`  inserted ${Math.min(i + BATCH, parsed.length)} / ${parsed.length}`);
  }

  console.log("Done. Total customers:", byCustomer.size);
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error("Import failed:", err);
  process.exit(1);
});
