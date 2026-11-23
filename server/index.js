require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('./db');

const app = express();
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

const makeToken = (user) =>
  jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

// Middleware: runs before protected routes
function requireAuth(req, res, next) {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  try {
    req.userId = jwt.verify(token, process.env.JWT_SECRET).id;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

app.post('/api/auth/signup', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !/^\S+@\S+\.\S+$/.test(email) || !password || password.length < 8) {
    return res.status(400).json({ error: 'Valid email and password (min 8 chars) required' });
  }
  try {
    const hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email',
      [email.toLowerCase(), hash]
    );
    res.status(201).json({ user: rows[0], token: makeToken(rows[0]) });
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ error: 'Email already registered' });
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/signin', async (req, res) => {
  const { email, password } = req.body;
  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [
      (email || '').toLowerCase(),
    ]);
    const user = rows[0];
    // Same message for both failures so attackers can't tell which emails exist
    if (!user || !(await bcrypt.compare(password || '', user.password_hash))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    res.json({ user: { id: user.id, email: user.email }, token: makeToken(user) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

// Protected route: returns the current user
app.get('/api/auth/me', requireAuth, async (req, res) => {
  const { rows } = await pool.query('SELECT id, email FROM users WHERE id = $1', [req.userId]);
  if (!rows[0]) return res.status(401).json({ error: 'User not found' });
  res.json({ user: rows[0] });
});

app.listen(process.env.PORT, () => console.log(`API on :${process.env.PORT}`));