/**
 * Builds a MongoDB $match stage from common query-string filters used
 * across all dashboard endpoints. Every route accepts the same filters
 * so Power BI parameters can be mapped 1:1 onto them.
 *
 * Supported query params:
 *   startDate=YYYY-MM-DD
 *   endDate=YYYY-MM-DD
 *   region=South            (comma-separated for multiple: "South,North")
 *   category=Electronics    (comma-separated)
 *   year=2024
 *   status=Delivered        (comma-separated). Default: excludes "Cancelled".
 */
function buildMatchStage(query = {}) {
  const match = {};

  if (query.startDate || query.endDate) {
    match.orderDate = {};
    if (query.startDate) match.orderDate.$gte = new Date(query.startDate);
    if (query.endDate) match.orderDate.$lte = new Date(query.endDate);
  }

  if (query.region) {
    match.region = { $in: query.region.split(",").map((s) => s.trim()) };
  }

  if (query.category) {
    match.category = { $in: query.category.split(",").map((s) => s.trim()) };
  }

  if (query.year) {
    match.year = { $in: query.year.split(",").map((s) => Number(s.trim())) };
  }

  if (query.status) {
    match.orderStatus = { $in: query.status.split(",").map((s) => s.trim()) };
  } else {
    // Default: exclude cancelled orders from revenue/profit figures
    match.orderStatus = { $ne: "Cancelled" };
  }

  return match;
}

module.exports = { buildMatchStage };
