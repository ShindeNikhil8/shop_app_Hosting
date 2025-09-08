import React from "react";
import { useCart } from "../../context/CartContext";
import { X } from "lucide-react";
import { Link } from "react-router-dom";

const CartPage = () => {
  const { cart, removeFromCart, updateQuantity } = useCart();

  if (!cart || cart.length === 0)
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">Your Cart is Empty</h2>
        <Link to="/shop" className="text-blue-500 underline">
          Go Shopping
        </Link>
      </div>
    );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Your Cart</h2>
      <div className="space-y-6">
        {cart.map((item) => {
          const product = item.product || {};
          const images = product.images || [];
          return (
            <div
              key={product._id || Math.random()}
              className="flex flex-col md:flex-row border p-4 rounded-lg shadow gap-4"
            >
              {/* Product Image */}
              <div className="flex-shrink-0">
                <img
                  src={images[0] || "https://via.placeholder.com/150"}
                  alt={product.title || "Product"}
                  className="w-32 h-32 object-cover rounded"
                />
              </div>

              {/* Product Info */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{product.title || "No Title"}</h3>
                  <p className="text-red-600 font-bold text-lg">
                    ₹{product.price || 0}
                  </p>
                  {product.oldPrice && (
                    <span className="line-through text-gray-400">
                      ₹{product.oldPrice}
                    </span>
                  )}
                  <div className="mt-2 text-sm text-gray-700 space-y-1">
                    <p>Main Category: {product.mainCategory || "N/A"}</p>
                    <p>Sub Category: {product.subCategory || "N/A"}</p>
                    <p>Age Group: {product.ageGroup || "N/A"}</p>
                    <p>SKU: {product.sku || "N/A"}</p>
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="mt-4 flex items-center gap-4">
                  <button
                    className="px-2 py-1 border rounded"
                    onClick={() =>
                      updateQuantity(product._id, Math.max(item.quantity - 1, 1))
                    }
                  >
                    -
                  </button>
                  <span className="font-semibold">{item.quantity}</span>
                  <button
                    className="px-2 py-1 border rounded"
                    onClick={() =>
                      updateQuantity(product._id, item.quantity + 1)
                    }
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Remove Button */}
              <div className="flex items-start md:items-center">
                <button
                  className="text-red-500"
                  onClick={() => removeFromCart(product._id)}
                >
                  <X size={24} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CartPage;
