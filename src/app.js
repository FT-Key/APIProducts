require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const indexRoutes = require('./routes/index');
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');

const app = express();

// CORS: allows any origin
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// General rate limit: 200 requests per 15 minutes per IP
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Try again in 15 minutes.' }
});

// Stricter rate limit for auth: 10 requests per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many token requests. Try again in 15 minutes.' }
});

app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(express.json());
app.use(generalLimiter);

app.use('/', indexRoutes);
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/products', productRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

module.exports = app;
