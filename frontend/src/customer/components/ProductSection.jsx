import React, { useEffect, useState } from "react";
import ProductCard from "./ProductCard";

const ProductSection = ({ title, products, onUpdate, isOwner = false, addToCart }) => {
  const [productList, setProductList] = useState(products);

  const handleUpdate = (updatedProduct) => {
    setProductList((prev) =>
      prev.map((p) => (p._id === updatedProduct._id ? updatedProduct : p))
    );
    onUpdate(updatedProduct);
  };

  useEffect(() => {
    setProductList(products);
  }, [products]);

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 py-6 sm:py-8">
      <h2 className="text-xl sm:text-2xl font-bold mb-4">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {productList.length > 0 ? (
          productList.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onUpdate={handleUpdate}
              isOwner={isOwner}
              addToCart={addToCart}
            />
          ))
        ) : (
          <p className="text-center text-gray-500 col-span-full">No products found.</p>
        )}
      </div>
    </div>
  );
};

export default ProductSection;
