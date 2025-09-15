const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Product = sequelize.define('Product', {
  shopify_id: { type: DataTypes.BIGINT, allowNull: false, primaryKey: true },
  title: { type: DataTypes.STRING, allowNull: false },
  vendor: { type: DataTypes.STRING },
  product_type: { type: DataTypes.STRING }
}, { timestamps: false });
module.exports = Product;