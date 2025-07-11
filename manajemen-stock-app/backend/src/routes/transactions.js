const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Get all transactions
router.get('/', async (req, res) => {
  try {
    const allTransactions = await pool.query('SELECT * FROM transactions ORDER BY transaction_date DESC');
    res.json(allTransactions.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Add a new transaction (multi-item support)
router.post('/', async (req, res) => {
  const client = await pool.connect();
  try {
    const { transaction_type, customer_name, items } = req.body;
    let total_amount = 0;
    let total_profit = 0;

    await client.query('BEGIN');

    // 1. Insert into transactions table
    const newTransaction = await client.query(
      'INSERT INTO transactions (transaction_type, customer_name) VALUES($1, $2) RETURNING * ',
      [transaction_type, customer_name]
    );
    const transactionId = newTransaction.rows[0].transaction_id;

    // 2. Process each item in the transaction
    for (const item of items) {
      const { product_id, quantity } = item;

      // Get product details (price, stock, etc.)
      const product = await client.query('SELECT * FROM products WHERE id = $1', [product_id]);
      if (product.rows.length === 0) {
        throw new Error(`Product with ID ${product_id} not found.`);
      }
      const { stock_quantity, selling_price, purchase_price } = product.rows[0];

      // Check stock for 'OUT' transactions
      if (transaction_type === 'OUT' && stock_quantity < quantity) {
        throw new Error(`Insufficient stock for product ${product.rows[0].name}. Available: ${stock_quantity}, Requested: ${quantity}`);
      }

      // Calculate item profit and amount
      const itemProfit = (selling_price - purchase_price) * quantity;
      const itemAmount = selling_price * quantity;

      total_amount += itemAmount;
      total_profit += itemProfit;

      // Insert into transaction_items table
      await client.query(
        'INSERT INTO transaction_items (transaction_id, product_id, quantity, price_at_transaction, purchase_price_at_transaction, item_profit) VALUES($1, $2, $3, $4, $5, $6)',
        [transactionId, product_id, quantity, selling_price, purchase_price, itemProfit]
      );

      // Update product stock
      const newStockQuantity = transaction_type === 'IN' ? stock_quantity + quantity : stock_quantity - quantity;
      await client.query('UPDATE products SET stock_quantity = $1 WHERE id = $2', [newStockQuantity, product_id]);

      // Insert into stock_history
      await client.query(
        'INSERT INTO stock_history (product_id, change_type, quantity_change, new_stock, transaction_id) VALUES($1, $2, $3, $4, $5)',
        [product_id, transaction_type, quantity, newStockQuantity, transactionId]
      );
    }

    // 3. Update total_amount and total_profit in transactions table
    await client.query(
      'UPDATE transactions SET total_amount = $1, total_profit = $2 WHERE transaction_id = $3',
      [total_amount, total_profit, transactionId]
    );

    await client.query('COMMIT');
    res.status(201).json({ message: 'Transaction completed successfully', transaction: newTransaction.rows[0] });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error processing transaction:', err.message);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// Clear all transactions
router.delete('/clear', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Delete from transaction_items (due to foreign key constraints)
    await client.query('DELETE FROM transaction_items');
    // Delete from stock_history (due to foreign key constraints)
    await client.query('DELETE FROM stock_history');
    // Delete from transactions
    await client.query('DELETE FROM transactions');

    await client.query('COMMIT');
    res.status(200).json({ message: 'All transaction history cleared successfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error clearing transaction history:', err.message);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;