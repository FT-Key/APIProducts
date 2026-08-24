const Product = require('../models/Product');

// Sanitize string: strip HTML tags and trim
const sanitizeString = (str) => {
  if (typeof str !== 'string') return '';
  return str.replace(/<[^>]*>/g, '').trim();
};

// Validate URL format
const isValidUrl = (str) => {
  if (!str) return true;
  try {
    const url = new URL(str);
    return ['http:', 'https:'].includes(url.protocol);
  } catch {
    return false;
  }
};

// Allowed fields for create/update
const ALLOWED_FIELDS = ['name', 'price', 'description', 'imgUrl', 'stock'];

const sanitizeInput = (body) => {
  const clean = {};
  for (const field of ALLOWED_FIELDS) {
    if (body[field] !== undefined) {
      clean[field] = body[field];
    }
  }
  if (clean.name) clean.name = sanitizeString(clean.name);
  if (clean.description) clean.description = sanitizeString(clean.description);
  if (clean.imgUrl) clean.imgUrl = sanitizeString(clean.imgUrl);
  return clean;
};

const getAll = async (req, res) => {
  try {
    const products = await Product.find({ clientId: req.clientId });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching products' });
  }
};

const getById = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, clientId: req.clientId });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching product' });
  }
};

const create = async (req, res) => {
  try {
    const clean = sanitizeInput(req.body);

    if (!clean.name || clean.price === undefined) {
      return res.status(400).json({ error: 'name and price are required' });
    }

    if (typeof clean.price !== 'number' || clean.price < 0) {
      return res.status(400).json({ error: 'price must be a positive number' });
    }

    if (clean.imgUrl && !isValidUrl(clean.imgUrl)) {
      return res.status(400).json({ error: 'imgUrl must be a valid HTTP/HTTPS URL' });
    }

    if (clean.stock !== undefined && (typeof clean.stock !== 'number' || clean.stock < 0)) {
      return res.status(400).json({ error: 'stock must be a positive number' });
    }

    const product = new Product({
      name: clean.name,
      price: clean.price,
      description: clean.description || '',
      imgUrl: clean.imgUrl || '',
      stock: clean.stock || 0,
      clientId: req.clientId
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: 'Error creating product' });
  }
};

const update = async (req, res) => {
  try {
    const clean = sanitizeInput(req.body);

    if (clean.price !== undefined && (typeof clean.price !== 'number' || clean.price < 0)) {
      return res.status(400).json({ error: 'price must be a positive number' });
    }

    if (clean.imgUrl && !isValidUrl(clean.imgUrl)) {
      return res.status(400).json({ error: 'imgUrl must be a valid HTTP/HTTPS URL' });
    }

    if (clean.stock !== undefined && (typeof clean.stock !== 'number' || clean.stock < 0)) {
      return res.status(400).json({ error: 'stock must be a positive number' });
    }

    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, clientId: req.clientId },
      clean,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Error updating product' });
  }
};

const softDelete = async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, clientId: req.clientId },
      { active: false },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product deactivated (soft delete)', product });
  } catch (error) {
    res.status(500).json({ error: 'Error deactivating product' });
  }
};

const hardDelete = async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ _id: req.params.id, clientId: req.clientId });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product permanently deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting product' });
  }
};

module.exports = { getAll, getById, create, update, softDelete, hardDelete };
