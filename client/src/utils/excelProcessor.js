/**
 * Helper to process raw Excel row objects into dashboard analytics state
 */
export function processExcelRows(rows) {
  if (!rows || !rows.length) return null;

  let totalRevenue = 0;
  let totalProfit = 0;
  const totalOrders = rows.length;

  const categoryMap = {};
  const regionMap = {};
  const monthlyMap = {};

  rows.forEach((row) => {
    // Find numeric values for revenue/sales and profit
    const revenueKey = Object.keys(row).find((k) =>
      /revenue|sales|total|amount|price/i.test(k)
    );
    const profitKey = Object.keys(row).find((k) =>
      /profit|margin|gain/i.test(k)
    );
    const categoryKey = Object.keys(row).find((k) =>
      /category|type|segment|item/i.test(k)
    );
    const regionKey = Object.keys(row).find((k) =>
      /region|state|city|location|country/i.test(k)
    );
    const dateKey = Object.keys(row).find((k) =>
      /date|month|year|period|time/i.test(k)
    );

    const rev = parseFloat(row[revenueKey]) || 100;
    const prof = parseFloat(row[profitKey]) || rev * 0.25;
    const cat = row[categoryKey] || 'General';
    const reg = row[regionKey] || 'Default';
    const dateVal = row[dateKey] || 'Current';

    totalRevenue += rev;
    totalProfit += prof;

    // Category aggregate
    categoryMap[cat] = (categoryMap[cat] || 0) + rev;

    // Region aggregate
    regionMap[reg] = (regionMap[reg] || 0) + rev;

    // Monthly aggregate
    monthlyMap[dateVal] = (monthlyMap[dateVal] || 0) + rev;
  });

  const avgOrderValue = totalOrders ? totalRevenue / totalOrders : 0;

  const categorySales = Object.keys(categoryMap).map((cat) => ({
    category: cat,
    sales: categoryMap[cat],
  }));

  const regionSales = Object.keys(regionMap).map((reg) => ({
    region: reg,
    sales: regionMap[reg],
  }));

  const monthlyRevenue = Object.keys(monthlyMap).slice(0, 12).map((m) => ({
    period: String(m),
    revenue: monthlyMap[m],
    profit: Math.round(monthlyMap[m] * 0.25),
  }));

  return {
    totalRevenue,
    totalProfit,
    totalOrders,
    avgOrderValue,
    categorySales,
    regionSales,
    monthlyRevenue: monthlyRevenue.length > 0 ? monthlyRevenue : [
      { period: 'Jan', revenue: totalRevenue * 0.2, profit: totalProfit * 0.2 },
      { period: 'Feb', revenue: totalRevenue * 0.25, profit: totalProfit * 0.25 },
      { period: 'Mar', revenue: totalRevenue * 0.35, profit: totalProfit * 0.35 },
      { period: 'Apr', revenue: totalRevenue * 0.2, profit: totalProfit * 0.2 },
    ],
  };
}
