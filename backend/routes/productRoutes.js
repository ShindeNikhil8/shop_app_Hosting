import express from "express";
import Product from "../models/Product.js";
import upload from "../middleware/cloudinary.js";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Helper: Upload buffer to Cloudinary
function uploadBufferToCloudinary(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    streamifier.createReadStream(buffer).pipe(stream);
  });
}

// Get all products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create product
router.post("/", protect, upload.array("images", 6), async (req, res) => {
  try {
    let images = req.body.images || [];
    if (!Array.isArray(images)) images = [images];
    images = images.map((i) => (typeof i === "string" ? { url: i } : i));

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await uploadBufferToCloudinary(file.buffer, {
          folder: "shop_app/products",
          resource_type: "image",
        });
        images.push({ url: result.secure_url, public_id: result.public_id });
      }
    }

    const product = new Product({
      title: req.body.title || "Untitled",
      desc: req.body.desc || "",
      mainCategory: req.body.mainCategory || "",
      subCategory: req.body.subCategory || "",
      ageGroup: req.body.ageGroup || "",
      price: Number(req.body.price || 0),
      oldPrice: Number(req.body.oldPrice || 0),
      tag: req.body.tag || "Featured",
      sku: req.body.sku || "",
      stock: Number(req.body.stock || 0),
      images,
      likes: 0,
      rating: 0,
      reviews: [],
    });

    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
});

// Update product
router.patch("/:id", protect, upload.array("images", 6), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    let images = req.body.images || [];
    if (!Array.isArray(images)) images = [images];
    images = images.map((i) => (typeof i === "string" ? { url: i } : i));

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await uploadBufferToCloudinary(file.buffer, {
          folder: "shop_app/products",
          resource_type: "image",
        });
        images.push({ url: result.secure_url, public_id: result.public_id });
      }
    }

    const fields = [
      "title", "desc", "mainCategory", "subCategory",
      "ageGroup", "price", "oldPrice", "tag", "sku", "stock"
    ];

    fields.forEach((f) => {
      if (req.body[f] !== undefined) product[f] = req.body[f];
    });

    product.images = images;

    const updated = await product.save();
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
});

// Delete product
router.delete("/:id", protect, async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
