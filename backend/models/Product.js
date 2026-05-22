const mongoose = require('mongoose');

const productSchema = mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true, enum: ['Men', 'Women', 'Kids'] },
    subcategory: { type: String, required: true },
    imageUrls: [{ type: String, required: true }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
