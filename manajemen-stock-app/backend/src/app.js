const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const productsRoutes = require('./routes/products');
const transactionsRoutes = require('./routes/transactions');

app.use('/api/products', productsRoutes);
app.use('/api/transactions', transactionsRoutes);

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Manajemen Stok API is running!' });
});

module.exports = app;
