const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Validation Middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }
  next();
};

// Create order (checkout)
router.post(
  '/', 
  authenticateToken, 
  [
    body('shipping_name').trim().isLength({ min: 3 }).withMessage('Full name is required (min 3 chars)'),
    body('shipping_address').trim().isLength({ min: 5 }).withMessage('Valid street address is required'),
    body('shipping_city').trim().isLength({ min: 2 }).withMessage('City name is required'),
    body('shipping_zip').trim().matches(/^[A-Za-z0-9\s-]{3,10}$/).withMessage('Valid ZIP/Postal code is required'),
    body('shipping_phone').trim().matches(/^\+?[0-9\s\-\(\)]{8,20}$/).withMessage('Valid phone number is required'),
  ],
  validate,
  (req, res) => {
    try {
      const { shipping_name, shipping_address, shipping_city, shipping_zip, shipping_phone } = req.body;

    // Get cart items
    const cartItems = db.prepare(`
      SELECT ci.*, p.price, p.name, p.stock
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ?
    `).all(req.user.id);

    if (cartItems.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Create order within transaction
    const createOrder = db.transaction(() => {
      const result = db.prepare(`
        INSERT INTO orders (user_id, total, shipping_name, shipping_address, shipping_city, shipping_zip, shipping_phone)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(req.user.id, total, shipping_name, shipping_address, shipping_city, shipping_zip, shipping_phone);

      const orderId = result.lastInsertRowid;

      const insertItem = db.prepare('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)');
      const updateStock = db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?');

      for (const item of cartItems) {
        insertItem.run(orderId, item.product_id, item.quantity, item.price);
        updateStock.run(item.quantity, item.product_id);
      }

      // Clear cart
      db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(req.user.id);

      return orderId;
    });

    const orderId = createOrder();
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Get user's orders
router.get('/', authenticateToken, (req, res) => {
  try {
    const orders = db.prepare(`
      SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC
    `).all(req.user.id);

    for (const order of orders) {
      order.items = db.prepare(`
        SELECT oi.*, p.name, p.image
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `).all(order.id);
    }

    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Admin: Get all orders
router.get('/all', authenticateToken, requireAdmin, (req, res) => {
  try {
    const orders = db.prepare(`
      SELECT o.*, u.name as user_name, u.email as user_email
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
    `).all();

    for (const order of orders) {
      order.items = db.prepare(`
        SELECT oi.*, p.name, p.image
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `).all(order.id);
    }

    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Admin: Update order status
router.put(
  '/:id/status', 
  authenticateToken, 
  requireAdmin, 
  [
    body('status').isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled']).withMessage('Invalid status')
  ],
  validate,
  (req, res) => {
    try {
      const { status } = req.body;

      db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, req.params.id);
      const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);

      res.json(order);
    } catch (err) {
      res.status(500).json({ error: 'Failed to update order' });
    }
  }
);

module.exports = router;
