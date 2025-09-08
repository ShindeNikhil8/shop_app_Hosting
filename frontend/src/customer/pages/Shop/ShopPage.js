import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import FilterSidebar from "../../components/ShopPage/FilterSidebar";
import ProductCard from "../../components/ProductCard";

const ShopPage = () => {
  const location = useLocation();
  const [filters, setFilters] = useState({});
  const [products, setProducts] = useState([]);
  const [initialFilters, setInitialFilters] = useState({});

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const subCategoryParam = params.get("subCategory");

    if (subCategoryParam) {
      setInitialFilters({
        mainCategories: ["Toys"],
        subCategories: [subCategoryParam],
      });
      setFilters({
        mainCategories: ["Toys"],
        subCategories: [subCategoryParam],
      });
    }
  }, [location.search]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const query = new URLSearchParams();
        if (filters.mainCategories?.length) query.append("mainCategory", filters.mainCategories.join(","));
        if (filters.subCategories?.length) query.append("subCategory", filters.subCategories.join(","));
        if (filters.ageGroups?.length) query.append("ageGroup", filters.ageGroups.join(","));
        if (filters.price) {
          query.append("minPrice", filters.price[0]);
          query.append("maxPrice", filters.price[1]);
        }
        const { data } = await axios.get(`http://localhost:5000/api/products/filter?${query.toString()}`);
        setProducts(data.filter((p) => p.stock > 0));
      } catch (err) {
        console.error(err);
      }
    };
    fetchProducts();
  }, [filters]);

  return (
    <div className="flex flex-col md:flex-row max-w-7xl mx-auto px-2 sm:px-4 py-6 gap-4 md:gap-6">
      <FilterSidebar onFilterChange={setFilters} initialFilters={initialFilters} />

      <div className="flex-1">
        {products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onUpdate={(updatedProduct) =>
                  setProducts((prev) => prev.map((p) => (p._id === updatedProduct._id ? updatedProduct : p)))
                }
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center mt-4">No products found.</p>
        )}
      </div>
    </div>
  );
};

export default ShopPage;
