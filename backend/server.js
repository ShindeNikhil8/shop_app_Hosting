import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import productRoutes from "./routes/productRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import cors from "cors";
import errorHandler from "./middleware/errorMiddleware.js";
import contactRoutes from "./routes/contactRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import limitedItemsRoutes from "./routes/limitedItems.js";

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(cors({
  // Add your Netlify frontend URL here
  origin: "https://sunny-melba-247af7.netlify.app", 
  credentials: true
}));
app.use(express.json());

// Routes
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/limited-items", limitedItemsRoutes);

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
