import express from "express";
import { protect } from "../controllers/authController.js";

const router = express.Router();

// GET profile info
router.get("/", protect, (req, res) => {
  res.json({
    _id: req.user._id,
    username: req.user.username,
    email: req.user.email,
    isOwner: req.user.isOwner,
  });
});

export default router;
