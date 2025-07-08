
const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// GET all transactions
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT t.*, 
             COALESCE(array_agg(
               json_build_object(
                 'id', ti.id,
                 'product_id', ti.product_id,
                 'product_name', p.name,
                 'quantity', ti.quantity,
                 'price_per_unit', ti.price_per_unit,
                 'subtotal', ti.subtotal
               )
             ) FILTER (WHERE ti.id IS NOT NULL), '{}') as items
      FROM transactions t
      LEFT JOIN transaction_items ti ON t.id = ti.transaction_id
      LEFT JOIN products p ON ti.product_id = p.id
      GROUP BY t.id
      ORDER BY t.transaction_date DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

// POST new transaction
router.post('/', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { transaction_type, customer_name, items, notes } = req.body;
    
    // Insert transaction
    const transactionResult = await client.query(
      'INSERT INTO transactions (transaction_type, customer_name, notes) VALUES ($1, $2, $3) RETURNING *',
      [transaction_type, customer_name, notes]
    );
    
    const transaction = transactionResult.rows[0];
    let total_amount = 0;
    
    // Insert transaction items and update stock
    for (const item of items) {
      const { product_id, quantity, price_per_unit } = item;
      const subtotal = quantity * price_per_unit;
      total_amount += subtotal;
      
      // Insert transaction item
      await client.query(
        'INSERT INTO transaction_items (transaction_id, product_id, quantity, price_per_unit, subtotal) VALUES ($1, $2, $3, $4, $5)',
        [transaction.id, product_id, quantity, price_per_unit, subtotal]
      );
      
      // Update stock
      const stockChange = transaction_type === 'IN' ? quantity : -quantity;
      await client.query(
        'UPDATE products SET stock_quantity = stock_quantity + $1 WHERE id = $2',
        [stockChange, product_id]
      );
    }
    
    // Update transaction total
    await client.query(
      'UPDATE transactions SET total_amount = $1 WHERE id = $2',
      [total_amount, transaction.id]
    );
    
    await client.query('COMMIT');
    res.status(201).json({ ...transaction, total_amount });
    
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});
