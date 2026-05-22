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
// @desc    Fetch products with filtering, sorting, and pagination
router.get('/', async (req, res) => {
  try {
    const { category, subcategory, sort, page, limit, search } = req.query;
    
    const query = {};
    if (category && category !== 'All') {
      query.category = category;
    }
    if (subcategory && subcategory !== 'All') {
      query.subcategory = subcategory;
    }
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    let sortOptions = { createdAt: -1 };
    if (sort === 'asc') {
      sortOptions = { price: 1 };
    } else if (sort === 'desc') {
      sortOptions = { price: -1 };
    }

    const pageNum = parseInt(page) || 1;
    // Default limit 7 unless explicitly specified as 0 or another number
    const limitNum = limit !== undefined && !isNaN(parseInt(limit)) ? parseInt(limit) : 7;
    
    let productsQuery = Product.find(query).sort(sortOptions);
    
    if (limitNum > 0) {
      const skip = (pageNum - 1) * limitNum;
      productsQuery = productsQuery.skip(skip).limit(limitNum);
    }
    
    const products = await productsQuery;
    const totalProducts = await Product.countDocuments(query);
    
    res.json({
      products,
      totalPages: limitNum > 0 ? Math.ceil(totalProducts / limitNum) : 1,
      currentPage: pageNum,
      totalProducts
    });
  } catch (error) {
    console.error(error);
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
