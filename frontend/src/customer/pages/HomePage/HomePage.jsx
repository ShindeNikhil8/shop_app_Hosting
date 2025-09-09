import React, { useEffect, useState } from "react";
import axios from "axios";
import MainCarosel from "../../components/HomeCarosel/MainCarosel";
import Categories from "../../components/Categories/Categories";
import Product from "../../components/ProductHomepage/Product";
import CustomerLoves from "../../components/CustomersLove/CustomersLove";
import { useAuth } from "../../../context/AuthContext";
import { useCart } from "../../../context/CartContext";

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const { user } = useAuth();
  const { addToCart } = useCart();

  useEffect(() => {
    axios
      .get("https://shop-app-hosting.vercel.app/api/products")
      .then((res) => setProducts(res.data))
      .catch((err) => console.error(err));
  }, []);

  const handleUpdate = (updatedProduct) => {
    setProducts((prev) => prev.map((p) => (p._id === updatedProduct._id ? updatedProduct : p)));
  };

  return (
    <div className="px-2 sm:px-4">
      <MainCarosel />
      <Categories />
      <Product products={products} onUpdate={handleUpdate} isOwner={user?.isOwner} addToCart={addToCart} />
      <CustomerLoves products={products} onUpdate={handleUpdate} isOwner={user?.isOwner} addToCart={addToCart} />
    </div>
  );
};

export default HomePage;
