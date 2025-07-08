const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// GET all products
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY id');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST new product
router.post('/', async (req, res) => {
  try {
    const { name, purchase_price, selling_price, stock_quantity, minimum_stock } = req.body;
    const result = await pool.query(
      'INSERT INTO products (name, purchase_price, selling_price, stock_quantity, minimum_stock) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, purchase_price, selling_price, stock_quantity, minimum_stock || 5]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
