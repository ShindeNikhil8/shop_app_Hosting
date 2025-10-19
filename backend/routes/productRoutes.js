import express from "express";
import Product from "../models/Product.js";
import upload from "../middleware/upload.js";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Upload buffer to Cloudinary
function uploadBufferToCloudinary(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    streamifier.createReadStream(buffer).pipe(stream);
  });
}

// ---------------- GET ALL PRODUCTS ----------------
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: "Error fetching products", error: err.message });
  }
});

// ---------------- GET SINGLE PRODUCT + RELATED ----------------
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const relatedProducts = await Product.find({
      subCategory: product.subCategory,
      _id: { $ne: product._id },
    }).limit(4);

    res.status(200).json({ product, relatedProducts });
  } catch (err) {
    res.status(500).json({ message: "Error fetching product", error: err.message });
  }
});

// ---------------- CREATE PRODUCT ----------------
router.post("/", protect, upload.array("images", 6), async (req, res) => {
  try {
    const { title, desc, images, price, oldPrice, tag, mainCategory, subCategory, ageGroup, sku, stock } = req.body;

    const imagesArray = [];

    // Handle images from frontend URLs
    if (images) {
      const parsed = typeof images === "string" ? JSON.parse(images) : images;
      if (Array.isArray(parsed)) {
        parsed.forEach((img) => {
          if (typeof img === "string") imagesArray.push({ url: img });
          else if (img && img.url) imagesArray.push(img);
        });
      }
    }

    // Handle uploaded files
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await uploadBufferToCloudinary(file.buffer, {
          folder: "shop_app/products",
          resource_type: "image",
        });
        imagesArray.push({ url: result.secure_url, public_id: result.public_id });
      }
    }

    const product = new Product({
      title,
      desc,
      images: imagesArray,
      price,
      oldPrice,
      tag,
      mainCategory,
      subCategory,
      ageGroup,
      sku,
      stock,
    });

    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (err) {
    res.status(400).json({ message: "Error saving product", error: err.message });
  }
});

// ---------------- APPEND IMAGES ----------------
router.post("/:id/images", protect, upload.array("images", 6), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const newImages = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await uploadBufferToCloudinary(file.buffer, {
          folder: "shop_app/products",
          resource_type: "image",
        });
        newImages.push({ url: result.secure_url, public_id: result.public_id });
      }
    }

    product.images.push(...newImages);
    await product.save();
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: "Error uploading images", error: err.message });
  }
});

// ---------------- UPDATE PRODUCT ----------------
router.patch("/:id", protect, async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Product not found" });
    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ message: "Error updating product", error: err.message });
  }
});

// ---------------- DELETE PRODUCT ----------------
router.delete("/:id", protect, async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Product not found" });
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting product", error: err.message });
  }
});

// ---------------- SELL PRODUCT ----------------
router.patch("/:id/sell", protect, async (req, res) => {
  try {
    const { quantity = 1 } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    if (product.stock < quantity)
      return res.status(400).json({ message: "Not enough stock" });

    product.stock -= quantity;
    await product.save();
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: "Error updating stock", error: err.message });
  }
});

// ---------------- LIKE PRODUCT ----------------
router.patch("/:id/like", protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    product.likes += 1;
    await product.save();
    res.status(200).json(product);
  } catch (err) {
    res.status(400).json({ message: "Error liking product", error: err.message });
  }
});

// ---------------- RATE PRODUCT ----------------
router.patch("/:id/rate", protect, async (req, res) => {
  try {
    const { rating } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    product.rating = Number(((product.rating + Number(rating)) / 2).toFixed(1));
    await product.save();
    res.status(200).json(product);
  } catch (err) {
    res.status(400).json({ message: "Error rating product", error: err.message });
  }
});

// ---------------- ADD REVIEW ----------------
router.patch("/:id/review", protect, async (req, res) => {
  try {
    const { review, rating } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    product.reviews.push({
      name: review?.name || "Anonymous",
      comment: review?.comment || "",
      rating: Number(rating) || 0,
    });

    const avgRating =
      product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length;
    product.rating = Number(avgRating.toFixed(1));

    await product.save();
    res.status(200).json(product);
  } catch (err) {
    res.status(400).json({ message: "Error adding review", error: err.message });
  }
});

// ---------------- CUSTOMER LOVES ----------------
router.get("/customerloves/top", async (req, res) => {
  try {
    const products = await Product.find().sort({ likes: -1 }).limit(4);
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: "Error fetching top products", error: err.message });
  }
});

// ---------------- FILTER PRODUCTS ----------------
router.get("/filter", async (req, res) => {
  try {
    const { mainCategory, subCategory, minPrice, maxPrice, ageGroup } = req.query;
    const filter = {};

    if (mainCategory) filter.mainCategory = { $in: mainCategory.split(",") };
    if (subCategory) filter.subCategory = { $in: subCategory.split(",") };
    if (ageGroup) filter.ageGroup = { $in: ageGroup.split(",") };
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const products = await Product.find(filter);
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: "Error filtering products", error: err.message });
  }
});

export default router;
