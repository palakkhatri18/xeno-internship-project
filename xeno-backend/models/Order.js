const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Order = sequelize.define('Order', {
  shopify_id: { type: DataTypes.BIGINT, allowNull: false, primaryKey: true },
  total_price: { type: DataTypes.DECIMAL(10, 2) },
  fulfillment_status: { type: DataTypes.STRING },
  customer_id: { type: DataTypes.BIGINT },
  created_at: { type: DataTypes.DATE }
}, { timestamps: false });
module.exports = Order;