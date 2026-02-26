const express = require('express');
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get user's cart
router.get('/', authenticateToken, (req, res) => {
  try {
    const items = db.prepare(`
      SELECT ci.id, ci.quantity, p.id as product_id, p.name, p.price, p.image, p.stock
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ?
    `).all(req.user.id);

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    res.json({ items, total });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

// Add to cart
router.post('/', authenticateToken, (req, res) => {
  try {
    const { product_id, quantity = 1 } = req.body;

    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(product_id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const existing = db.prepare('SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?')
      .get(req.user.id, product_id);

    if (existing) {
      db.prepare('UPDATE cart_items SET quantity = quantity + ? WHERE id = ?')
        .run(quantity, existing.id);
    } else {
      db.prepare('INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)')
        .run(req.user.id, product_id, quantity);
    }

    // Return updated cart
    const items = db.prepare(`
      SELECT ci.id, ci.quantity, p.id as product_id, p.name, p.price, p.image, p.stock
      FROM cart_items ci JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ?
    `).all(req.user.id);

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    res.json({ items, total });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add to cart' });
  }
});

// Update cart item quantity
router.put('/:id', authenticateToken, (req, res) => {
  try {
    const { quantity } = req.body;
    if (quantity < 1) {
      db.prepare('DELETE FROM cart_items WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
    } else {
      db.prepare('UPDATE cart_items SET quantity = ? WHERE id = ? AND user_id = ?')
        .run(quantity, req.params.id, req.user.id);
    }

    const items = db.prepare(`
      SELECT ci.id, ci.quantity, p.id as product_id, p.name, p.price, p.image, p.stock
      FROM cart_items ci JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ?
    `).all(req.user.id);

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    res.json({ items, total });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update cart' });
  }
});

// Remove from cart
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    db.prepare('DELETE FROM cart_items WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);

    const items = db.prepare(`
      SELECT ci.id, ci.quantity, p.id as product_id, p.name, p.price, p.image, p.stock
      FROM cart_items ci JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ?
    `).all(req.user.id);

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    res.json({ items, total });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove from cart' });
  }
});

module.exports = router;
