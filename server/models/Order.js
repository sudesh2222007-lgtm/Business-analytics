const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true },
    orderDate: { type: Date, required: true, index: true },

    customerId: { type: String, required: true, index: true },
    customerName: { type: String, required: true },
    customerType: { type: String, enum: ['New', 'Returning'], required: true },
    segment: {
      type: String,
      enum: ['Consumer', 'Corporate', 'Home Office'],
      required: true,
    },

    category: {
      type: String,
      enum: ['Electronics', 'Furniture', 'Clothing', 'Office Supplies', 'Food & Beverage'],
      required: true,
      index: true,
    },
    subCategory: { type: String, required: true },
    productName: { type: String, required: true },

    region: {
      type: String,
      enum: ['North', 'South', 'East', 'West', 'Central'],
      required: true,
      index: true,
    },

    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    discount: { type: Number, required: true, default: 0 }, // fraction, e.g. 0.15
    cost: { type: Number, required: true },

    sales: { type: Number, required: true }, // revenue after discount
    profit: { type: Number, required: true },
  },
  { timestamps: true }
);

// Useful compound indexes for common aggregation filters
OrderSchema.index({ orderDate: 1, category: 1 });
OrderSchema.index({ orderDate: 1, region: 1 });

module.exports = mongoose.model('Order', OrderSchema);
