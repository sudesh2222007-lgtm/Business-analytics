require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Order = require('../models/Order');

// ---- Reference data ----
const REGIONS = ['North', 'South', 'East', 'West', 'Central'];
const SEGMENTS = ['Consumer', 'Corporate', 'Home Office'];

const CATEGORY_PRODUCTS = {
  Electronics: {
    subCategories: ['Phones', 'Laptops', 'Accessories', 'Audio'],
    products: [
      ['Smartphone X12', 250, 500],
      ['UltraBook Pro 14"', 600, 1200],
      ['Wireless Earbuds', 20, 80],
      ['4K Monitor 27"', 150, 350],
      ['Bluetooth Speaker', 15, 60],
      ['Smartwatch Series 5', 80, 220],
    ],
  },
  Furniture: {
    subCategories: ['Chairs', 'Tables', 'Storage', 'Lighting'],
    products: [
      ['Ergonomic Office Chair', 60, 220],
      ['Standing Desk', 150, 400],
      ['Bookshelf Unit', 50, 150],
      ['LED Desk Lamp', 10, 35],
      ['Filing Cabinet', 40, 120],
    ],
  },
  Clothing: {
    subCategories: ['Menswear', 'Womenswear', 'Footwear', 'Accessories'],
    products: [
      ['Cotton T-Shirt', 3, 12],
      ['Denim Jeans', 12, 45],
      ['Running Shoes', 20, 70],
      ['Winter Jacket', 30, 110],
      ['Leather Belt', 5, 25],
    ],
  },
  'Office Supplies': {
    subCategories: ['Paper', 'Writing', 'Organization', 'Technology'],
    products: [
      ['A4 Paper Ream (500)', 2, 8],
      ['Gel Pen Pack', 1, 6],
      ['Sticky Notes Set', 1, 5],
      ['Stapler Heavy Duty', 3, 12],
      ['Label Printer', 25, 65],
    ],
  },
  'Food & Beverage': {
    subCategories: ['Snacks', 'Beverages', 'Pantry', 'Fresh'],
    products: [
      ['Coffee Beans 1kg', 6, 18],
      ['Granola Bars (Box)', 3, 10],
      ['Sparkling Water (12pk)', 4, 12],
      ['Olive Oil 1L', 5, 15],
      ['Mixed Nuts 500g', 4, 14],
    ],
  },
};

const CATEGORIES = Object.keys(CATEGORY_PRODUCTS);

const FIRST_NAMES = ['Aarav','Priya','Rahul','Sneha','Vikram','Anita','Karan','Divya','Arjun','Meera','Rohan','Kavya','Nikhil','Pooja','Sanjay','Isha','Manish','Riya','Aditya','Neha'];
const LAST_NAMES = ['Sharma','Patel','Reddy','Nair','Gupta','Iyer','Menon','Singh','Rao','Joshi','Kapoor','Verma','Das','Mehta','Chopra'];

function rand(min, max) {
  return Math.random() * (max - min) + min;
}
function randInt(min, max) {
  return Math.floor(rand(min, max + 1));
}
function pick(arr) {
  return arr[randInt(0, arr.length - 1)];
}
function round2(n) {
  return Math.round(n * 100) / 100;
}

async function seed() {
  await connectDB();

  console.log('Clearing existing orders...');
  await Order.deleteMany({});

  const NUM_CUSTOMERS = 180;
  const customers = Array.from({ length: NUM_CUSTOMERS }, (_, i) => ({
    customerId: `CUST-${String(i + 1).padStart(4, '0')}`,
    customerName: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
    segment: pick(SEGMENTS),
    // Track first purchase date per customer so we can mark New vs Returning consistently
    firstSeen: null,
  }));

  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - 2); // 2 years of history
  const endDate = new Date();
  const totalDays = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24));

  const NUM_ORDERS = 3000;
  const orders = [];

  // Seasonality: boost sales volume in certain months (e.g. Nov/Dec)
  const monthWeight = (month) => {
    if (month === 10 || month === 11) return 1.6; // Nov, Dec (0-indexed)
    if (month === 0) return 0.7; // Jan slump
    return 1;
  };

  for (let i = 0; i < NUM_ORDERS; i++) {
    const dayOffset = randInt(0, totalDays);
    const orderDate = new Date(startDate.getTime() + dayOffset * 24 * 60 * 60 * 1000);

    // Apply seasonality by occasionally re-rolling into a high-weight month
    if (Math.random() > monthWeight(orderDate.getMonth()) / 1.6 && monthWeight(orderDate.getMonth()) < 1) {
      // small chance to skip low-weight months by nudging into a neighboring month
    }

    const customer = pick(customers);
    const isFirstOrderForCustomer = customer.firstSeen === null;
    if (isFirstOrderForCustomer || orderDate < customer.firstSeen) {
      customer.firstSeen = orderDate;
    }

    const category = pick(CATEGORIES);
    const catData = CATEGORY_PRODUCTS[category];
    const subCategory = pick(catData.subCategories);
    const [productName, minPrice, maxPrice] = pick(catData.products);

    const unitPrice = round2(rand(minPrice, maxPrice));
    const quantity = randInt(1, 8);
    const discount = pick([0, 0, 0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.4]);
    const grossSales = unitPrice * quantity;
    const sales = round2(grossSales * (1 - discount));

    // Cost is 45-75% of unit price depending on category (electronics higher margin variance)
    const costFactor = rand(0.45, 0.78);
    const cost = round2(unitPrice * costFactor * quantity);
    const profit = round2(sales - cost);

    orders.push({
      orderId: `ORD-${String(i + 1).padStart(6, '0')}`,
      orderDate,
      customerId: customer.customerId,
      customerName: customer.customerName,
      customerType: null, // filled in second pass below
      segment: customer.segment,
      category,
      subCategory,
      productName,
      region: pick(REGIONS),
      quantity,
      unitPrice,
      discount,
      cost,
      sales,
      profit,
    });
  }

  // Second pass: determine New vs Returning per order based on whether it's
  // the customer's first order chronologically.
  const firstOrderDateByCustomer = {};
  orders
    .slice()
    .sort((a, b) => a.orderDate - b.orderDate)
    .forEach((o) => {
      if (!firstOrderDateByCustomer[o.customerId]) {
        firstOrderDateByCustomer[o.customerId] = o.orderDate;
      }
    });

  orders.forEach((o) => {
    o.customerType = o.orderDate.getTime() === firstOrderDateByCustomer[o.customerId].getTime() ? 'New' : 'Returning';
  });

  console.log(`Inserting ${orders.length} orders...`);
  await Order.insertMany(orders);

  console.log('Seed complete.');
  await mongoose.connection.close();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
