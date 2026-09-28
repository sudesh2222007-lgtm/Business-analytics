# Business Performance Analytics (MERN)

A full-stack analytics dashboard — MongoDB, Express, React, Node — that mirrors a
4-page Power BI report: Executive Dashboard, Sales Analysis, Customer Analytics, and
Profitability Analysis. The backend computes every metric with MongoDB aggregation
pipelines; the frontend renders it with Recharts in a dark, Power-BI-style layout with
global filters (date range, region, category, segment).

## Project structure

```
business-analytics-mern/
├── server/                  Express + Mongoose API
│   ├── config/db.js         MongoDB connection
│   ├── models/Order.js      Order schema (the single fact table)
│   ├── controllers/         One aggregation controller per dashboard page
│   ├── routes/analytics.js  /api/analytics/* routes
│   ├── seed/seed.js         Generates ~3,000 realistic synthetic orders
│   └── server.js            App entry point
└── client/                  React (Vite) frontend
    └── src/
        ├── pages/           ExecutiveDashboard, SalesAnalysis, CustomerAnalytics, ProfitabilityAnalysis
        ├── components/      Sidebar, FilterBar, KpiCard, ChartCard
        ├── hooks/useFilters.js
        └── api.js           Axios client for the analytics API
```

## Data model

Every document in the `orders` collection is one line item:

```
orderId, orderDate, customerId, customerName, customerType (New/Returning),
segment (Consumer/Corporate/Home Office),
category, subCategory, productName,
region (North/South/East/West/Central),
quantity, unitPrice, discount, cost, sales, profit
```

`sales` = `quantity * unitPrice * (1 - discount)`, `profit` = `sales - cost`. This single
collection is enough to answer all four pages via aggregation — no separate rollup
tables needed at this scale.

## API endpoints

All under `/api/analytics`, and all accept optional query params
`startDate`, `endDate`, `region`, `category`, `segment` to filter:

| Endpoint         | Powers                                                              |
|-------------------|---------------------------------------------------------------------|
| `GET /executive`      | Total revenue/profit/orders, AOV, monthly revenue, revenue vs profit |
| `GET /sales`           | Category/product/region sales, monthly + quarterly trends           |
| `GET /customers`       | New vs returning, segments, top 10 customers, avg customer spend    |
| `GET /profitability`   | Profit by category/region, discount-vs-profit bands, top/bottom products |
| `GET /filters`         | Distinct regions/categories/segments + min/max order date, for dropdowns |

## Setup

### 1. Prerequisites
- Node.js 18+
- A MongoDB instance (local `mongod`, Docker, or MongoDB Atlas)

### 2. Backend

```bash
cd server
npm install
cp .env.example .env        # edit MONGO_URI if not using local default
npm run seed                # generates ~3,000 synthetic orders (2 years of history)
npm run dev                 # starts API on http://localhost:5000
```

### 3. Frontend

```bash
cd client
npm install
npm run dev                 # starts React app on http://localhost:5173
```

The Vite dev server proxies `/api/*` to `http://localhost:5000`, so just open
`http://localhost:5173`.

### 4. Production build

```bash
cd client
npm run build                # outputs client/dist — serve with any static host,
                              # or have Express serve it (see note below)
```

To serve the built frontend from Express itself, add near the bottom of `server.js`:

```js
app.use(express.static(path.join(__dirname, '../client/dist')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../client/dist/index.html')));
```

## Notes

- The seed script is deterministic in structure but randomized in values — re-run
  `npm run seed` any time to reset the dataset (it clears the collection first).
- Seasonality is baked in (Nov/Dec spike, January dip) so the trend charts aren't flat.
- Swap the synthetic seed for a real CSV/ETL import later by writing to the same
  `Order` schema — the aggregation pipelines don't care where the data came from.
- This is intentionally a lean, single-collection MVP. If it grows, consider a
  separate `Customer` collection and referencing it, plus indexes tuned to your
  actual filter usage patterns (a few sensible ones are already in `Order.js`).
