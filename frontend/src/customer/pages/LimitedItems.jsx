import React, { useState, useEffect } from "react";
import { FaPlus, FaTrash } from "react-icons/fa";

const API_ALL_PRODUCTS = "http://localhost:5000/api/products";
const API_LIMITED_ITEMS = "http://localhost:5000/api/limited-items";

const LimitedItems = () => {
  const [limitedItems, setLimitedItems] = useState({ inStockItems: [], outOfStockItems: [] });
  const [allProducts, setAllProducts] = useState([]);
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [deleteProduct, setDeleteProduct] = useState(null);
  const [showAddStockPopup, setShowAddStockPopup] = useState(false);
  // stockProduct is an object: { product: {...}, limitedItemId: string|null }
  const [stockProduct, setStockProduct] = useState(null);
  const [stockQty, setStockQty] = useState(0);

  // Fetch all products
  const fetchAllProducts = async () => {
    try {
      const res = await fetch(API_ALL_PRODUCTS);
      const data = await res.json();
      setAllProducts(data ?? []);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  // Fetch limited items
  const fetchLimitedItems = async () => {
    try {
      const res = await fetch(API_LIMITED_ITEMS);
      const data = await res.json();
      setLimitedItems({
        inStockItems: data.inStockItems ?? [],
        outOfStockItems: data.outOfStockItems ?? [],
      });
    } catch (err) {
      console.error("Error fetching limited items:", err);
    }
  };

  useEffect(() => {
    fetchAllProducts();
    fetchLimitedItems();
  }, []);

  // Add product to limited items (manual addition)
  const handleAdd = async () => {
    if (!selectedProduct) return;
    try {
      await fetch(`${API_LIMITED_ITEMS}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: selectedProduct._id }),
      });
      setShowAddPopup(false);
      setSelectedProduct(null);
      await fetchLimitedItems();
    } catch (err) {
      console.error("Error adding limited item:", err);
    }
  };

  // Delete product from limited items (delete by limitedItem _id)
  const handleDelete = async () => {
    if (!deleteProduct) return;
    try {
      await fetch(`${API_LIMITED_ITEMS}/${deleteProduct._id}`, { method: "DELETE" });
      setShowDeletePopup(false);
      setDeleteProduct(null);
      await fetchLimitedItems();
    } catch (err) {
      console.error("Error deleting limited item:", err);
    }
  };

  // Add stock to product (handles both manual limited items and auto out-of-stock items)
  const handleAddStock = async () => {
    if (!stockProduct || stockQty <= 0) return;

    try {
      const added = parseInt(stockQty, 10) || 0;

      if (stockProduct.limitedItemId) {
        // Update via limited-items/update-stock/:limitedItemId
        await fetch(`${API_LIMITED_ITEMS}/update-stock/${stockProduct.limitedItemId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ addedStock: added }),
        });
      } else {
        // Product is not a manual limited item (auto out-of-stock). Patch product stock directly.
        const newStock = (stockProduct.product.stock || 0) + added;
        await fetch(`${API_ALL_PRODUCTS}/${stockProduct.product._id}`, {
          method: "PATCH", // your backend supports patch for product updates
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stock: newStock }),
        });
        // If there's an existing LimitedItem for this product, backend won't know — so refresh limited items and it'll show/remove accordingly.
      }

      // Close popup & refresh both lists so UI updates immediately
      setShowAddStockPopup(false);
      setStockQty(0);
      setStockProduct(null);

      await fetchAllProducts();
      await fetchLimitedItems();
    } catch (err) {
      console.error("Error adding stock:", err);
    }
  };

  // Products that are auto out of stock (not present in manual limited items)
  const autoOutOfStock = allProducts.filter(
    (p) =>
      p.stock === 0 &&
      !limitedItems.outOfStockItems.some((item) => String(item.product?._id) === String(p._id))
  );

  // Low Stock - less than 3 (auto detection)
  const lowStockItems = allProducts.filter((p) => p.stock > 0 && p.stock < 3);

  // Products for Add dropdown — show current shop items (exclude out-of-stock if you prefer)
  const dropdownProducts = allProducts.filter((p) => p.stock > 0);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Limited Items Management</h2>

      {/* Add Button */}
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2 mb-4"
        onClick={() => {
          setShowAddPopup(true);
          // make sure products are fresh
          fetchAllProducts();
        }}
      >
        <FaPlus /> Add Limited Item
      </button>

      {/* In Stock Section */}
      <h3 className="text-xl font-semibold mt-6 mb-2">In Stock</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {limitedItems.inStockItems.length > 0 ? (
          limitedItems.inStockItems.map((item) => (
            <div
              key={item._id}
              className="border p-4 rounded shadow flex justify-between items-center"
            >
              <div>
                <h3 className="font-semibold">{item.product?.title}</h3>
                <span className="text-yellow-600">Running Low: {item.product?.stock}</span>
              </div>
              <div className="flex gap-2">
                <button
                  className="text-blue-600 hover:text-blue-800"
                  onClick={() => {
                    setStockProduct({ product: item.product, limitedItemId: item._id });
                    setShowAddStockPopup(true);
                  }}
                >
                  Add Stock
                </button>
                <button
                  className="text-red-600 hover:text-red-800"
                  onClick={() => {
                    setDeleteProduct(item);
                    setShowDeletePopup(true);
                  }}
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No limited items in stock.</p>
        )}
      </div>

      {/* Low Stock Section */}
      {/* Low Stock Section */}
<h3 className="text-xl font-semibold mt-6 mb-2">Low Stock (Less than 3)</h3>
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  {lowStockItems.length > 0 ? (
    lowStockItems.map((product) => (
      <div
        key={product._id}
        className="border p-4 rounded shadow flex justify-between items-center bg-yellow-100"
      >
        <div>
          <h3 className="font-semibold">{product.title}</h3>
          <span className="text-yellow-800">Stock: {product.stock}</span>
        </div>
        <div className="flex gap-2">
          <button
            className="text-blue-600 hover:text-blue-800"
            onClick={() => {
              // no limitedItemId because it's from allProducts directly
              setStockProduct({ product, limitedItemId: null });
              setShowAddStockPopup(true);
            }}
          >
            Add Stock
          </button>
        </div>
      </div>
    ))
  ) : (
    <p className="text-gray-500">No low stock items.</p>
  )}
</div>


      {/* Out of Stock Section */}
      <h3 className="text-xl font-semibold mt-6 mb-2">Out of Stock</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Manual out-of-stock limited items (from DB) */}
        {limitedItems.outOfStockItems.map((item) => (
          <div
            key={item._id}
            className="border p-4 rounded shadow flex justify-between items-center bg-gray-100"
          >
            <div>
              <h3 className="font-semibold">{item.product?.title}</h3>
              <span className="text-red-600">Out of Stock</span>
            </div>
            <div className="flex gap-2">
              <button
                className="text-blue-600 hover:text-blue-800"
                onClick={() => {
                  setStockProduct({ product: item.product, limitedItemId: item._id });
                  setShowAddStockPopup(true);
                }}
              >
                Add Stock
              </button>
              <button
                className="text-red-600 hover:text-red-800"
                onClick={() => {
                  setDeleteProduct(item);
                  setShowDeletePopup(true);
                }}
              >
                <FaTrash />
              </button>
            </div>
          </div>
        ))}

        {/* Auto-detected out-of-stock (not manually added) */}
        {autoOutOfStock.map((product) => (
          <div
            key={product._id}
            className="border p-4 rounded shadow flex justify-between items-center bg-gray-100"
          >
            <div>
              <h3 className="font-semibold">{product.title}</h3>
              <span className="text-red-600">Out of Stock</span>
            </div>
            <button
              className="text-blue-600 hover:text-blue-800"
              onClick={() => {
                // no limitedItemId because it's not in the LimitedItem collection
                setStockProduct({ product, limitedItemId: null });
                setShowAddStockPopup(true);
              }}
            >
              Add Stock
            </button>
          </div>
        ))}

        {limitedItems.outOfStockItems.length === 0 && autoOutOfStock.length === 0 && (
          <p className="text-gray-500">No out-of-stock items.</p>
        )}
      </div>

      {/* Add Limited Item Popup (manual) */}
      {showAddPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h3 className="font-semibold mb-2">Select Product (In-stock items)</h3>
            <select
              onChange={(e) =>
                setSelectedProduct(allProducts.find((p) => p._id === e.target.value) ?? null)
              }
              className="border p-2 w-full mb-4"
            >
              <option value="">-- Select Product --</option>
              {dropdownProducts.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.title} (Stock: {p.stock})
                </option>
              ))}
            </select>

            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Add
              </button>
              <button
                onClick={() => setShowAddPopup(false)}
                className="bg-gray-400 px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Stock Popup */}
      {showAddStockPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h3 className="font-semibold mb-4">Add Stock for {stockProduct?.product?.title}</h3>
            <input
              type="number"
              value={stockQty}
              onChange={(e) => setStockQty(e.target.value)}
              className="border p-2 w-full mb-4"
              min={1}
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddStock}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Update Stock
              </button>
              <button
                onClick={() => {
                  setShowAddStockPopup(false);
                  setStockProduct(null);
                }}
                className="bg-gray-400 px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeletePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h3 className="font-semibold mb-4">
              Remove {deleteProduct?.product?.title} from Limited Items?
            </h3>
            <div className="flex gap-2">
              <button
                onClick={handleDelete}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeletePopup(false)}
                className="bg-gray-400 px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LimitedItems;
