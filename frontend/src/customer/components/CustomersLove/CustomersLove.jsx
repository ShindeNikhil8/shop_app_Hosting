import React from "react";
import ProductCard from "../ProductCard";

const CustomerLoves = ({ products, onUpdate }) => {
  const customerLoves = [...products]
    .filter((p) => p.likes > 0 || p.rating > 0)
    .sort((a, b) => b.likes - a.likes || b.rating - a.rating)
    .slice(0, 4);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
        Customer Loves
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {customerLoves.length > 0 ? (
          customerLoves.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onUpdate={onUpdate} // live update
            />
          ))
        ) : (
          <p className="text-center text-gray-500">No products found.</p>
        )}
      </div>
    </div>
  );
};

export default CustomerLoves;
