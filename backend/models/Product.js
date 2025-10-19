// ...existing code...
import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  desc: { type: String },
  images: [
    {
      url: { type: String, required: true },
      public_id: { type: String },
    },
  ], // array of image objects {url, public_id}
  price: { type: Number, required: true },
  oldPrice: { type: Number },
  tag: { type: String }, // e.g., Featured, New Arrival
  mainCategory: { type: String, required: true }, // Toys, Stationary, Gifts
  subCategory: { type: String }, // e.g., Educational Toys
  ageGroup: { type: String }, // e.g., 3-5, 6-8
  sku: { type: String },
  stock: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  reviews: [
    {
      name: { type: String },
      review: { type: String },
      rating: { type: Number, min: 0, max: 5 },
      comment: { type: String },
    },
  ],
}, { timestamps: true });

const Product = mongoose.model("Product", productSchema);

export default Product;
// ...existing code...