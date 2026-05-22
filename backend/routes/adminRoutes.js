const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');

// @route   POST /api/admin/login
// @desc    Auth admin & get token
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    let admin = await Admin.findOne({ username });
    if (!admin) {
        // Automatically create the admin the first time they try to log in with 'admin' / 'admin123'
        if(username === 'admin' && password === 'admin123') {
            admin = await Admin.create({ username, password });
        } else {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
    } else {
        if (password !== admin.password) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
    }

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET || 'supersecretkey', {
      expiresIn: '30d',
    });

    res.json({ _id: admin._id, username: admin.username, token });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
