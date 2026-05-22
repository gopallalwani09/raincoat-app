const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Product = require('../models/Product');
const { protect } = require('../middleware/authMiddleware');

const { storage } = require('../config/cloudinary');
const upload = multer({ storage });

// @route   GET /api/products
// @desc    Fetch all products or filter by category
router.get('/', async (req, res) => {
  try {
    const category = req.query.category;
    const query = category && category !== 'All' ? { category } : {};
    const products = await Product.find(query).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST /api/products
// @desc    Create a product
router.post('/', protect, upload.array('images', 5), async (req, res) => {
  try {
    const { title, description, price, category, subcategory } = req.body;
    
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map(file => file.path);
    }
    
    if (!title || !description || !price || !category || !subcategory || imageUrls.length === 0) {
      return res.status(400).json({ message: 'Please provide all fields and at least one image' });
    }

    const product = new Product({
      title,
      description,
      price,
      category,
      subcategory,
      imageUrls,
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete a product
router.delete('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    await product.deleteOne();
    res.json({ message: 'Product removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   PUT /api/products/:id
// @desc    Update a product
router.put('/:id', protect, upload.array('images', 5), async (req, res) => {
  try {
    const { title, description, price, category, subcategory, existingImages } = req.body;
    
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Process existing images (if any were kept)
    let finalImageUrls = [];
    if (existingImages) {
        // existingImages might be a string if only one is sent, or an array
        finalImageUrls = Array.isArray(existingImages) ? existingImages : [existingImages];
    }

    // Add new uploaded images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => file.path);
      finalImageUrls = [...finalImageUrls, ...newImages];
    }

    if (finalImageUrls.length === 0) {
        return res.status(400).json({ message: 'Please provide at least one image' });
    }

    product.title = title || product.title;
    product.description = description || product.description;
    product.price = price || product.price;
    product.category = category || product.category;
    product.subcategory = subcategory || product.subcategory;
    product.imageUrls = finalImageUrls;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
