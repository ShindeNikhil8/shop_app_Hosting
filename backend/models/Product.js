import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  name: { type: String },
  comment: { type: String },
  rating: { type: Number, min: 0, max: 5 },
});

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    desc: { type: String },
    images: [
      {
        url: { type: String, required: true },
        public_id: { type: String },
      },
    ],
    price: { type: Number, required: true },
    oldPrice: { type: Number },
    tag: { type: String },
    mainCategory: { type: String, required: true },
    subCategory: { type: String },
    ageGroup: { type: String },
    sku: { type: String },
    stock: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    reviews: [reviewSchema],
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
