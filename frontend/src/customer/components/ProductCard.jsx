import React from "react";
import { FaStar, FaRegHeart, FaHeart, FaCartPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const ProductCard = ({ product, onUpdate, view = "grid", isOwner = false, addToCart }) => {
  const navigate = useNavigate();
  const mainImage = product.images?.[0] || "https://via.placeholder.com/150";

  const handleLike = async (e) => {
    e.stopPropagation();
    try {
      const res = await fetch(`http://localhost:5000/api/products/${product._id}/like`, { method: "PATCH" });
      if (!res.ok) throw new Error("Failed to like product");
      const updatedProduct = await res.json();
      onUpdate(updatedProduct);
    } catch (err) {
      console.error("Like error:", err);
    }
  };

  const handleSell = async (e) => {
    e.stopPropagation();
    if (product.stock <= 0) return;
    try {
      const res = await fetch(`http://localhost:5000/api/products/${product._id}/sell`, { method: "PATCH" });
      if (!res.ok) throw new Error("Failed to sell product");
      const updatedProduct = await res.json();
      onUpdate(updatedProduct);
    } catch (err) {
      console.error("Sell error:", err);
    }
  };

  const handleAddToCartClick = (e) => {
    e.stopPropagation();
    if (addToCart) addToCart(product._id, 1);
  };

  return (
    <div
      className={`bg-white shadow-md rounded-lg p-3 sm:p-4 cursor-pointer hover:scale-105 transition-transform flex flex-col ${
        view === "list" ? "md:flex-row md:gap-4" : ""
      }`}
      onClick={() => navigate(`/product/${product._id}`)}
    >
      <img
        src={mainImage}
        alt={product.title}
        className={`object-contain rounded-md ${
          view === "list" ? "md:w-1/3 md:h-48 w-full h-36 mb-3 md:mb-0" : "w-full h-40 mb-3"
        }`}
      />

      <div className={view === "list" ? "flex-1" : ""}>
        <h3 className="text-sm sm:text-base font-semibold">{product.title}</h3>
        <p className="text-gray-600 text-xs sm:text-sm">
          {view === "grid" ? product.desc?.substring(0, 60) + "..." : product.desc}
        </p>

        <div className="mt-2 flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-red-600 font-bold text-sm sm:text-base">₹{product.price}</span>
            {product.oldPrice && <span className="line-through text-gray-400 text-xs sm:text-sm">₹{product.oldPrice}</span>}
          </div>
          {product.stock > 0 ? (
            <span className="text-green-600 text-xs sm:text-sm">In Stock: {product.stock}</span>
          ) : (
            <span className="text-red-600 font-bold text-xs sm:text-sm">Out of Stock</span>
          )}
        </div>

        {/* Tags */}
        <div className="mt-2 flex gap-1 flex-wrap text-xs sm:text-sm">
          {product.tag && <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded">{product.tag}</span>}
          {product.mainCategory && <span className="px-2 py-0.5 bg-blue-100 text-blue-600 rounded">{product.mainCategory}</span>}
          {product.subCategory && <span className="px-2 py-0.5 bg-purple-100 text-purple-600 rounded">{product.subCategory}</span>}
          {product.ageGroup && <span className="px-2 py-0.5 bg-green-100 text-green-600 rounded">{product.ageGroup}</span>}
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mt-3 text-xs sm:text-sm">
          <button className={`flex items-center ${product.likes ? "text-red-600" : "text-red-500"}`} onClick={handleLike}>
            {product.likes ? <FaHeart size={16} /> : <FaRegHeart size={16} />}
            <span className="ml-1">{product.likes || 0}</span>
          </button>

          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <FaStar key={i} size={12} className={i < Math.round(product.rating) ? "text-yellow-400" : "text-gray-300"} />
            ))}
            <span className="ml-1">{product.rating.toFixed(1)}</span>
          </div>

          {isOwner ? (
            <button
              className={`px-2 py-1 rounded text-white text-xs sm:text-sm ${
                product.stock > 0 ? "bg-green-600 hover:bg-green-700" : "bg-gray-400 cursor-not-allowed"
              }`}
              onClick={handleSell}
              disabled={product.stock <= 0}
            >
              {product.stock > 0 ? "Sell" : "Out of Stock"}
            </button>
          ) : (
            <button onClick={handleAddToCartClick}>
              <FaCartPlus size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
