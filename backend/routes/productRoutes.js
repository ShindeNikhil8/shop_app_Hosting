import express from "express";
import Product from "../models/Product.js";
import upload from "../middleware/cloudinary.js";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * Upload a Buffer to Cloudinary using upload_stream
 * @param {Buffer} buffer
 * @param {Object} options
 * @returns {Promise<Object>}
 */
function uploadBufferToCloudinary(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    streamifier.createReadStream(buffer).pipe(stream);
  });
}

// ✅ Get all products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Create a new product (now accepts multipart/form-data with images)
router.post("/", protect, upload.array("images", 6), async (req, res) => {
  try {
    console.log("Incoming request body:", req.body);

    // Ensure images is always an array (can come from req.body or uploaded files)
    let images = req.body.images;
    if (images) {
      images = Array.isArray(images) ? images : [images];
    } else {
      images = [];
    }

    // If multer provided files in req.files (memory storage), upload them to Cloudinary
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await uploadBufferToCloudinary(file.buffer, {
          folder: "shop_app/products",
          resource_type: "image",
        });
        images.push({ url: result.secure_url, public_id: result.public_id });
      }
    }

    // Ensure price is a number
    const price = req.body.price ? Number(req.body.price) : 0;

    const product = new Product({
      title: req.body.title || "Untitled Product",
      desc: req.body.desc || "",
      mainCategory: req.body.mainCategory || "",
      subCategory: req.body.subCategory || "",
      ageGroup: req.body.ageGroup || "",
      price: price,
      oldPrice: req.body.oldPrice || 0,
      tag: req.body.tag || "Featured",
      images: images,
      sku: req.body.sku || "",
      stock: req.body.stock || 0,
      likes: req.body.likes || 0,
      rating: req.body.rating || 0,
      reviews: req.body.reviews || [],
    });

    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (err) {
    console.error("Error saving product:", err);
    res.status(400).json({ message: err.message });
  }
});

// ✅ Append images to an existing product
router.post("/:id/images", protect, upload.array("images", 6), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (!req.files || req.files.length === 0)
      return res.status(400).json({ message: "No files uploaded" });

    const newImages = [];
    for (const file of req.files) {
      const result = await uploadBufferToCloudinary(file.buffer, {
        folder: "shop_app/products",
        resource_type: "image",
      });
      newImages.push({ url: result.secure_url, public_id: result.public_id });
    }

    product.images = product.images || [];
    product.images.push(...newImages);
    await product.save();

    res.json(product);
  } catch (err) {
    console.error("Error appending images:", err);
    res.status(500).json({ message: err.message });
  }
});

// ✅ Filter products
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
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Like a product
router.patch("/:id/like", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    product.likes += 1;
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ✅ Rate a product
router.patch("/:id/rate", async (req, res) => {
  try {
    const { rating } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    product.rating = Number(((product.rating + Number(rating)) / 2).toFixed(1));
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ✅ Add a review
router.patch("/:id/review", async (req, res) => {
  try {
    const { review, rating } = req.body; // review: { name, comment }

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Push a simplified review object
    const newReview = {
      name: review?.name || "Anonymous",
      comment: review?.comment || "",
      rating: Number(rating) || 0,
    };
    product.reviews.push(newReview);

    // Update average rating
    const avgRating =
      product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length;
    product.rating = Number(avgRating.toFixed(1));

    await product.save();
    res.json(product); // returns full product including new review
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ✅ Customer loves (top 4 by likes)
router.get("/customerloves", async (req, res) => {
  try {
    const products = await Product.find().sort({ likes: -1 }).limit(4);
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Get single product with related products
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const relatedProducts = await Product.find({
      subCategory: product.subCategory,
      _id: { $ne: product._id },
    }).limit(4);

    res.json({ product, relatedProducts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Update product
router.patch("/:id", async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Product not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ✅ Delete product
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch("/:id/sell", async (req, res) => {
  try {
    const { quantity = 1 } = req.body; // get quantity from request
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    if (product.stock < quantity)
      return res.status(400).json({ message: "Not enough stock" });

    product.stock -= quantity;
    await product.save();
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});




export default router;