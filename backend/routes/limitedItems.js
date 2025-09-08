import express from "express";
import LimitedItem from "../models/LimitedItem.js";
import Product from "../models/Product.js";

const router = express.Router();

// Get all limited items (split into inStock & outOfStock)
router.get("/", async (req, res) => {
  try {
    const items = await LimitedItem.find().populate("product");

    const inStockItems = items.filter(
      (item) => item.product && item.product.stock > 0
    );
    const outOfStockItems = items.filter(
      (item) => item.product && item.product.stock === 0
    );

    res.json({
      inStockItems: inStockItems || [],
      outOfStockItems: outOfStockItems || [],
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a product to limited items
router.post("/", async (req, res) => {
  try {
    const { productId } = req.body;

    // Prevent duplicate entries
    const exists = await LimitedItem.findOne({ product: productId });
    if (exists) return res.status(400).json({ message: "Already in limited items" });

    const newItem = new LimitedItem({ product: productId });
    const saved = await newItem.save();
    const populated = await saved.populate("product");
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a limited item
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await LimitedItem.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Item not found" });
    res.json({ message: "Limited item removed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update stock for a product in limited items
// - adds addedStock to the product stock
// - saves product in DB
// - removes the LimitedItem record if stock > 0 (automatic removal when item is restocked)
router.put("/update-stock/:id", async (req, res) => {
  try {
    const { addedStock } = req.body;
    const limitedItem = await LimitedItem.findById(req.params.id).populate("product");

    if (!limitedItem) return res.status(404).json({ message: "Limited item not found" });
    if (!limitedItem.product) return res.status(404).json({ message: "Product not found" });

    const add = parseInt(addedStock, 10) || 0;
    limitedItem.product.stock = (limitedItem.product.stock || 0) + add;
    await limitedItem.product.save();

    // IMPORTANT: remove from limited items when stock becomes > 0
    if (limitedItem.product.stock > 0) {
      await LimitedItem.findByIdAndDelete(req.params.id);
      return res.json({
        message: "Stock updated and removed from limited items",
        removed: true,
        product: limitedItem.product,
      });
    }

    res.json({ message: "Stock updated", removed: false, product: limitedItem.product });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
