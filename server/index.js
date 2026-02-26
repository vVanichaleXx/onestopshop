const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));

// Admin: Get stats
const db = require('./db');
const { authenticateToken, requireAdmin } = require('./middleware/auth');

app.get('/api/admin/stats', authenticateToken, requireAdmin, (req, res) => {
  try {
    const totalProducts = db.prepare('SELECT COUNT(*) as count FROM products').get().count;
    const totalOrders = db.prepare('SELECT COUNT(*) as count FROM orders').get().count;
    const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
    const totalRevenue = db.prepare('SELECT COALESCE(SUM(total), 0) as total FROM orders WHERE status != ?').get('cancelled').total;

    const recentOrders = db.prepare(`
      SELECT o.*, u.name as user_name, u.email as user_email
      FROM orders o JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC LIMIT 5
    `).all();

    res.json({ totalProducts, totalOrders, totalUsers, totalRevenue, recentOrders });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Admin: Get all users
app.get('/api/admin/users', authenticateToken, requireAdmin, (req, res) => {
  try {
    const users = db.prepare('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC').all();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 OneStopShop API running on http://localhost:${PORT}`);
});
