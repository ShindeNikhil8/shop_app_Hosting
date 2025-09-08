import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";
import { toast } from "react-toastify";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState([]);

  useEffect(() => {
    if (user) {
      axios
        .get("http://localhost:5000/api/cart", {
          headers: { Authorization: `Bearer ${user.token}` },
        })
        .then((res) => setCart(res.data))
        .catch((err) => console.error("Cart fetch error:", err));
    } else {
      setCart([]);
    }
  }, [user]);

  const addToCart = async (productId, quantity = 1) => {
    if (!user) {
      toast.info("Please login to add to cart");
      return;
    }
    try {
      const res = await axios.post(
        "http://localhost:5000/api/cart/add",
        { productId, quantity },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setCart(res.data);
      toast.success("Product added to cart ✅");
    } catch (err) {
      toast.error(err.response?.data?.message || "Error adding to cart");
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const res = await axios.delete(
        `http://localhost:5000/api/cart/remove/${productId}`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setCart(res.data);
      toast.success("Product removed from cart ✅");
    } catch (err) {
      toast.error(err.response?.data?.message || "Error removing from cart");
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      const res = await axios.patch(
        "http://localhost:5000/api/cart/update",
        { productId, quantity },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setCart(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Error updating quantity");
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQuantity }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
