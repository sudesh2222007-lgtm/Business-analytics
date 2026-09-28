const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const executiveRoutes = require("./routes/executive");
const salesRoutes = require("./routes/sales");
const customerRoutes = require("./routes/customers");
const profitabilityRoutes = require("./routes/profitability");
const metaRoutes = require("./routes/meta");

const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    name: "Business Performance Analytics API",
    status: "ok",
    pages: {
      executiveDashboard: "/api/executive/*",
      salesAnalysis: "/api/sales/*",
      customerAnalytics: "/api/customers/*",
      profitabilityAnalysis: "/api/profitability/*",
    },
    meta: "/api/meta/filters, /api/orders",
  });
});

app.use("/api/executive", executiveRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/profitability", profitabilityRoutes);
app.use("/api/meta", metaRoutes);
app.use("/api", metaRoutes); // also exposes /api/orders directly

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// centralized error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || "Server error" });
});

module.exports = app;
