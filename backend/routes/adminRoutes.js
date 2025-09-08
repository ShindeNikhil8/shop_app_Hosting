import express from "express";
import Product from "../models/Product.js";
import { verifyOwner } from "../middleware/authMiddleware.js"; // owner auth middleware
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

const router = express.Router();

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

// Storage for multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: { folder: "shop_products" },
});
const upload = multer({ storage });

// Add new product
router.post("/product", verifyOwner, upload.array("images", 5), async (req, res) => {
  try {
    const images = req.files ? req.files.map((f) => f.path) : req.body.images || [];
    const product = new Product({ ...req.body, images });
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update product
router.put("/product/:id", verifyOwner, upload.array("images", 5), async (req, res) => {
  try {
    const images = req.files ? req.files.map((f) => f.path) : req.body.images;
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { ...req.body, images },
      { new: true }
    );
    res.json(updatedProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete product
router.delete("/product/:id", verifyOwner, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get all products
router.get("/products", verifyOwner, async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

// Get limited stock products (<=5)
router.get("/products/limited", verifyOwner, async (req, res) => {
  const products = await Product.find({ stock: { $lte: 5 } });
  res.json(products);
});

export default router;
