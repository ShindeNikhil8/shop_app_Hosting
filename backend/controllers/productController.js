import Product from "../models/Product.js";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

// ...existing code...

// Get all products
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

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

// Create a new product
export const createProduct = async (req, res) => {
  try {
    const {
      title,
      desc,
      images, // may be provided from frontend as array of URLs; will be combined with uploaded files
      price,
      oldPrice,
      tag,
      mainCategory,
      subCategory,
      ageGroup,
      sku,
      stock
    } = req.body;

    // imagesFromReq will hold either existing image URLs (from req.body.images)
    // or uploaded images from req.files (multer memory). We'll combine them.
    const imagesArray = [];

    // If client sent images as JSON string, try to parse (some frontends send JSON)
    if (images) {
      try {
        const parsed = typeof images === "string" ? JSON.parse(images) : images;
        if (Array.isArray(parsed)) {
          // accept objects like { url, public_id } or plain URLs
          parsed.forEach((it) => {
            if (typeof it === "string") imagesArray.push({ url: it });
            else if (it && it.url) imagesArray.push(it);
          });
        }
      } catch (e) {
        // not JSON - if it's a single URL string
        if (typeof images === "string" && images.trim()) imagesArray.push({ url: images });
      }
    }

    // If multer put files in req.files (memory storage), upload them to Cloudinary
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        // file.buffer is provided by multer.memoryStorage()
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
      images: imagesArray, // ensure your Product schema accepts images array
      price,
      oldPrice,
      tag,
      mainCategory,
      subCategory,
      ageGroup,
      sku,
      stock
    });

    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * Optional: append images to existing product
 */
export const addImagesToProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // simple owner check if you use req.user (keep or remove as per your auth)
    if (req.user && product.owner && product.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

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

    product.images = product.images || [];
    product.images.push(...newImages);
    await product.save();

    return res.json(product);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ...existing code...