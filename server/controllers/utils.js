// Builds a MongoDB match filter from common query params: startDate, endDate, region, category
function buildMatch(query) {
  const match = {};

  if (query.startDate || query.endDate) {
    match.orderDate = {};
    if (query.startDate) match.orderDate.$gte = new Date(query.startDate);
    if (query.endDate) match.orderDate.$lte = new Date(query.endDate);
  }

  if (query.region && query.region !== 'All') match.region = query.region;
  if (query.category && query.category !== 'All') match.category = query.category;
  if (query.segment && query.segment !== 'All') match.segment = query.segment;

  return match;
}

module.exports = { buildMatch };
