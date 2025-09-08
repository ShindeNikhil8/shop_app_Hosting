import React, { useState } from "react";
import ProductSection from "../ProductSection";

const Product = ({ products, onUpdate, isOwner, addToCart }) => {
  const [activeTab, setActiveTab] = useState("Featured");
  const tabs = ["Featured", "Best Seller", "New Arrival"];

  const filteredProducts = products
    .filter((p) => p.tag?.toLowerCase() === activeTab.toLowerCase() && p.stock > 0)
    .slice(0, 8); // Show only 8 products

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 sm:mb-8 text-center">
        Top picks for your little ones
      </h2>

      <div className="flex flex-wrap justify-center gap-4 border-b mb-4 sm:mb-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 text-sm sm:text-base ${
              activeTab === tab
                ? "font-bold border-b-2 border-black"
                : "text-gray-500 hover:text-black"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <ProductSection
        title={activeTab}
        products={filteredProducts}
        onUpdate={onUpdate}
        isOwner={isOwner}
        addToCart={addToCart}
      />
    </div>
  );
};

export default Product;
