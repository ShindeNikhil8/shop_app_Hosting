import Product from "../models/Product.js";

// Get all products
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create a new product
export const createProduct = async (req, res) => {
  try {
    const {
      title,
      desc,
      images,
      price,
      oldPrice,
      tag,
      mainCategory,
      subCategory,
      ageGroup,
      sku,
      stock
    } = req.body;

    const product = new Product({
      title,
      desc,
      images, // must be array
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









