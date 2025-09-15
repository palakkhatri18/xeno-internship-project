const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Customer = sequelize.define('Customer', {
  shopify_id: { type: DataTypes.BIGINT, allowNull: false, primaryKey: true },
  first_name: { type: DataTypes.STRING },
  last_name: { type: DataTypes.STRING },
  email: { type: DataTypes.STRING },
  total_spent: { type: DataTypes.DECIMAL(10, 2) }
}, { timestamps: false });
module.exports = Customer;