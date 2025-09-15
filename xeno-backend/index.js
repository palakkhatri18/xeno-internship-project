require('dotenv').config();
const express = require('express');
const axios = require('axios');
const { Op } = require('sequelize');
const sequelize = require('./config/database');
const cors = require('cors');

const Product = require('./models/Product');
const Customer = require('./models/Customer');
const Order = require('./models/Order');

const shopifyAccessToken = process.env.SHOPIFY_API_ACCESS_TOKEN;
const shopifyStoreDomain = process.env.SHOPIFY_STORE_DOMAIN;

const app = express();
app.use(cors());
app.use(express.json());
const port = 3000;

app.post('/api/webhooks/order-created', async (req, res) => {
  try {
    const order = req.body;
    await Order.upsert({
      shopify_id: order.id,
      total_price: order.total_price,
      fulfillment_status: order.fulfillment_status || 'unfulfilled',
      customer_id: order.customer ? order.customer.id : null,
      created_at: order.created_at
    });
    res.status(200).send('Webhook received');
  } catch (error) {
    res.status(500).send('Error processing webhook');
  }
});

app.get('/api/products', async (req, res) => {
  try {
    const apiUrl = `https://${shopifyStoreDomain}/admin/api/2023-10/products.json`;
    const headers = { 'X-Shopify-Access-Token': shopifyAccessToken, 'Content-Type': 'application/json' };
    const response = await axios.get(apiUrl, { headers });
    const products = response.data.products;
    for (const product of products) {
      await Product.upsert({
        shopify_id: product.id,
        title: product.title,
        vendor: product.vendor,
        product_type: product.product_type
      });
    }
    res.json({ status: 'success', message: `Ingested ${products.length} products.` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to ingest products' });
  }
});

app.get('/api/customers', async (req, res) => {
  try {
    const apiUrl = `https://${shopifyStoreDomain}/admin/api/2023-10/customers.json`;
    const headers = { 'X-Shopify-Access-Token': shopifyAccessToken, 'Content-Type': 'application/json' };
    const response = await axios.get(apiUrl, { headers });
    const customers = response.data.customers;
    for (const customer of customers) {
      await Customer.upsert({
        shopify_id: customer.id,
        first_name: customer.first_name,
        last_name: customer.last_name,
        email: customer.email,
        total_spent: parseFloat(customer.total_spent.replace(/[^0-9.]/g, ''))
      });
    }
    res.json({ status: 'success', message: `Ingested ${customers.length} customers.` });
  } catch (error) {
    
    console.error('Failed to ingest customers:', error.message);
    res.status(500).json({ error: 'Failed to ingest customers' });
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    const apiUrl = `https://${shopifyStoreDomain}/admin/api/2023-10/orders.json?status=any`;
    const headers = { 'X-Shopify-Access-Token': shopifyAccessToken, 'Content-Type': 'application/json' };
    const response = await axios.get(apiUrl, { headers });
    const orders = response.data.orders;
    for (const order of orders) {
      await Order.upsert({
        shopify_id: order.id,
        total_price: order.total_price,
        fulfillment_status: order.fulfillment_status || 'unfulfilled',
        customer_id: order.customer ? order.customer.id : null,
        created_at: order.created_at
      });
    }
    res.json({ status: 'success', message: `Ingested ${orders.length} orders.` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to ingest orders' });
  }
});

app.get('/api/dashboard/summary', async (req, res) => {
  try {
    const totalCustomers = await Customer.count();
    const totalOrders = await Order.count();
    const totalRevenue = await Order.sum('total_price');
    res.json({ totalCustomers, totalOrders, totalRevenue: totalRevenue || 0 });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

app.get('/api/dashboard/top-customers', async (req, res) => {
  try {
    const topCustomers = await Customer.findAll({ order: [['total_spent', 'DESC']], limit: 5 });
    res.json(topCustomers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch top customers' });
  }
});

app.get('/api/dashboard/orders-by-date', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Please provide both startDate and endDate' });
    }
    const orders = await Order.findAll({ where: { created_at: { [Op.between]: [new Date(startDate), new Date(endDate)] } } });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders by date' });
  }
});

async function startServer() {
  try {
    await sequelize.sync();
    console.log(' Database synchronized');
    app.listen(port, () => {
      console.log(` Server is running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Unable to sync database:', error);
  }
}

startServer();