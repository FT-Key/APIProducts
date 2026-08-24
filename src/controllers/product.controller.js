const Product = require('../models/Product');

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
    const { name, price, description, stock } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ error: 'name and price are required' });
    }

    const product = new Product({
      name,
      price,
      description: description || '',
      stock: stock || 0,
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
    const { name, price, description, stock } = req.body;

    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, clientId: req.clientId },
      { name, price, description, stock },
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
