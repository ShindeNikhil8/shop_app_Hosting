import mongoose from "mongoose";

const LimitedItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("LimitedItem", LimitedItemSchema);
