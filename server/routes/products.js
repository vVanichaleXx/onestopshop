const express = require('express');
const db = require('../db');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Get all products (public)
router.get('/', (req, res) => {
  try {
    const { category, search, sort, featured, limit = 50, offset = 0 } = req.query;

    let query = `SELECT p.*, c.name as category_name, c.slug as category_slug
                 FROM products p
                 LEFT JOIN categories c ON p.category_id = c.id
                 WHERE 1=1`;
    const params = [];

    if (category) {
      query += ` AND c.slug = ?`;
      params.push(category);
    }
    if (search) {
      query += ` AND (p.name LIKE ? OR p.description LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }
    if (featured === 'true') {
      query += ` AND p.featured = 1`;
    }

    switch (sort) {
      case 'price_asc': query += ` ORDER BY p.price ASC`; break;
      case 'price_desc': query += ` ORDER BY p.price DESC`; break;
      case 'rating': query += ` ORDER BY p.rating DESC`; break;
      case 'newest': query += ` ORDER BY p.created_at DESC`; break;
      default: query += ` ORDER BY p.featured DESC, p.rating DESC`;
    }

    query += ` LIMIT ? OFFSET ?`;
    params.push(Number(limit), Number(offset));

    const products = db.prepare(query).all(...params);
    const total = db.prepare('SELECT COUNT(*) as count FROM products').get().count;

    res.json({ products, total });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get categories
router.get('/categories', (req, res) => {
  try {
    const categories = db.prepare(`
      SELECT c.*, COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.id
      GROUP BY c.id
    `).all();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get single product
router.get('/:id', (req, res) => {
  try {
    const product = db.prepare(`
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `).get(req.params.id);

    if (!product) return res.status(404).json({ error: 'Product not found' });

    // Get related products
    const related = db.prepare(`
      SELECT * FROM products
      WHERE category_id = ? AND id != ?
      LIMIT 4
    `).all(product.category_id, product.id);

    res.json({ ...product, related });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Admin: Create product
router.post('/', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { name, description, price, original_price, image, category_id, stock, featured } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const result = db.prepare(`
      INSERT INTO products (name, slug, description, price, original_price, image, category_id, stock, featured)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(name, slug, description, price, original_price || null, image, category_id, stock || 0, featured ? 1 : 0);

    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Admin: Update product
router.put('/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { name, description, price, original_price, image, category_id, stock, featured } = req.body;

    db.prepare(`
      UPDATE products
      SET name=?, description=?, price=?, original_price=?, image=?, category_id=?, stock=?, featured=?
      WHERE id=?
    `).run(name, description, price, original_price || null, image, category_id, stock || 0, featured ? 1 : 0, req.params.id);

    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Admin: Delete product
router.delete('/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

module.exports = router;
