import express from "express";
import { protect } from "../controllers/authController.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

const router = express.Router();

// Middleware to block owners
const blockOwner = (req, res, next) => {
  if (req.user.isOwner) {
    return res.status(403).json({ message: "Owners cannot use the cart" });
  }
  next();
};

// ✅ GET user cart (only signed-in normal users)
router.get("/", protect, blockOwner, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("cart.product");
    res.json(user.cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ ADD product to cart
router.post("/add", protect, blockOwner, async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    const user = await User.findById(req.user._id);
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const itemIndex = user.cart.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex > -1) {
      user.cart[itemIndex].quantity += quantity || 1;
    } else {
      user.cart.push({ product: productId, quantity: quantity || 1 });
    }

    await user.save();
    const populatedUser = await User.findById(req.user._id).populate("cart.product");
    res.json(populatedUser.cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ REMOVE product from cart
router.delete("/remove/:productId", protect, blockOwner, async (req, res) => {
  try {
    const { productId } = req.params;
    const user = await User.findById(req.user._id);
    user.cart = user.cart.filter(item => item.product.toString() !== productId);

    await user.save();
    const populatedUser = await User.findById(req.user._id).populate("cart.product");
    res.json(populatedUser.cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ UPDATE product quantity
router.patch("/update", protect, blockOwner, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const user = await User.findById(req.user._id);
    const item = user.cart.find(item => item.product.toString() === productId);

    if (item) item.quantity = quantity;

    await user.save();
    const populatedUser = await User.findById(req.user._id).populate("cart.product");
    res.json(populatedUser.cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
