const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const rateLimit = require("express-rate-limit");
const db = require('../db');
const { authenticateToken, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// Strict Auth Limiter prevents brute force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 auth requests per 15 minutes
  message: { error: 'Too many authentication attempts, please try again later.' }
});

// Validation Error Formatter Middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }
  next();
};

// Register
router.post(
  '/register',
  authLimiter,
  [
    body('name').trim().isLength({ min: 2 }).withMessage('Name is required and must be at least 2 characters'),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
      // Custom strong password check if needed: .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).*$/).withMessage('Password must contain upper, lower case and a number')
  ],
  validate,
  (req, res) => {
    try {
      const { name, email, password } = req.body;

      const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
      if (existing) {
        return res.status(409).json({ error: 'Email already registered' });
      }

      const hash = bcrypt.hashSync(password, 10);
      const result = db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)').run(name, email, hash);

      const user = { id: result.lastInsertRowid, name, email, role: 'customer' };
      const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });

      res.status(201).json({ user, token });
    } catch (err) {
      res.status(500).json({ error: 'Registration failed' });
    }
  }
);

// Login
router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required')
  ],
  validate,
  (req, res) => {
    try {
      const { email, password } = req.body;

      const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
      if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const payload = { id: user.id, name: user.name, email: user.email, role: user.role };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

      res.json({ user: payload, token });
    } catch (err) {
      res.status(500).json({ error: 'Login failed' });
    }
  }
);

// Get current user
router.get('/me', authenticateToken, (req, res) => {
  const user = db.prepare('SELECT id, name, email, role, created_at FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

module.exports = router;
