import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const OwnerStock = () => {
  const { user } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    desc: "",
    price: 0,
    oldPrice: 0,
    tag: "",
    mainCategory: "",
    subCategory: "",
    ageGroup: "",
    sku: "",
    stock: 10,
  });

  const [images, setImages] = useState([]); // { type: 'file'|'url', data: File|string }
  const [imageMode, setImageMode] = useState("url"); // 'url' or 'file'

  useEffect(() => {
    if (user) fetchProducts();
  }, [user]);

  const fetchProducts = async () => {
    try {
      const res = await axios.get("/api/products", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setProducts(res.data);
    } catch (err) {
      toast.error("Error fetching products ❌");
    }
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleImageChange = (idx, value) => {
    const newImages = [...images];
    newImages[idx] = { type: "url", data: value };
    setImages(newImages);
  };

  const handleFileUpload = (e, idx) => {
    const file = e.target.files[0];
    if (!file) return;
    const newImages = [...images];
    newImages[idx] = { type: "file", data: file };
    setImages(newImages);
  };

  const addImageField = () => setImages([...images, { type: imageMode, data: "" }]);

  const removeImageField = (idx) =>
    setImages(images.filter((_, index) => index !== idx));

  const handleSwitchImageMode = (mode) => {
    setImageMode(mode);
    setImages(images.map(img => ({ ...img, type: mode, data: "" })));
  };

  const handleSubmit = async () => {
    try {
      const form = new FormData();
      Object.entries(formData).forEach(([key, value]) =>
        form.append(key, value)
      );

      // Add URLs
      images
        .filter((img) => img.type === "url")
        .map((img) => img.data)
        .filter(Boolean)
        .forEach((url) => form.append("images[]", url));

      // Add files
      images
        .filter((img) => img.type === "file")
        .forEach((f) => form.append("images", f.data));

      if (editingId) {
        await axios.patch(`/api/products/${editingId}`, form, {
          headers: {
            Authorization: `Bearer ${user.token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        toast.success("Product updated successfully ✅");
      } else {
        await axios.post(`/api/products`, form, {
          headers: {
            Authorization: `Bearer ${user.token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        toast.success("Product added successfully ✅");
      }

      resetForm();
      fetchProducts();
    } catch (err) {
      toast.error("Error saving product ❌");
    }
  };

  const handleEdit = (product) => {
    setFormData({ ...product });
    setEditingId(product._id);
    setImages(
      product.images?.map((img) => ({ type: "url", data: img.url || img })) || []
    );
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await axios.delete(`/api/products/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setProducts(products.filter((p) => p._id !== id));
      toast.success("Product deleted successfully ✅");
    } catch (err) {
      toast.error("Error deleting product ❌");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      desc: "",
      price: 0,
      oldPrice: 0,
      tag: "",
      mainCategory: "",
      subCategory: "",
      ageGroup: "",
      sku: "",
      stock: 10,
    });
    setImages([]);
    setEditingId(null);
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <ToastContainer position="top-right" autoClose={2000} />
      <h1 className="text-2xl font-bold mb-4">Manage Stock</h1>

      {/* Image Mode Switch */}
      <div className="flex gap-2 mb-2">
        <button
          className={`p-1 rounded ${imageMode === "url" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          onClick={() => handleSwitchImageMode("url")}
        >
          URL
        </button>
        <button
          className={`p-1 rounded ${imageMode === "file" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          onClick={() => handleSwitchImageMode("file")}
        >
          File
        </button>
      </div>

      {/* Product Form */}
      <div className="border p-4 rounded mb-6">
        {[
          ["title", "Title"], ["desc", "Description"], ["price", "Price"], ["oldPrice", "Old Price"],
          ["tag", "Tag"], ["mainCategory", "Main Category"], ["subCategory", "Sub Category"],
          ["ageGroup", "Age Group"], ["sku", "SKU"], ["stock", "Stock"]
        ].map(([name, label]) => (
          <div key={name} className="mb-2">
            <label className="block">{label}</label>
            <input
              type={name === "price" || name === "oldPrice" || name === "stock" ? "number" : "text"}
              name={name}
              value={formData[name]}
              onChange={handleChange}
              className="border p-1 w-full rounded"
            />
          </div>
        ))}

        {/* Images */}
        <div className="mb-2">
          <label className="block mb-1">Images</label>
          {images.map((img, idx) => (
            <div key={idx} className="flex gap-2 mb-1 items-center">
              {imageMode === "url" ? (
                <input
                  type="text"
                  value={img.data}
                  onChange={(e) => handleImageChange(idx, e.target.value)}
                  className="border p-1 flex-1 rounded"
                  placeholder="Image URL"
                />
              ) : (
                <input type="file" onChange={(e) => handleFileUpload(e, idx)} />
              )}
              <button onClick={() => removeImageField(idx)} className="bg-red-600 text-white px-2 rounded">
                X
              </button>
            </div>
          ))}
          <button onClick={addImageField} className="bg-green-600 text-white px-2 py-1 rounded mt-1">
            + Add Image
          </button>
        </div>

        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-4 py-2 rounded mt-2"
        >
          {editingId ? "Update Product" : "Add Product"}
        </button>
      </div>

      {/* Product List */}
      <h2 className="font-semibold mb-2">Current Stock</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((p) => (
          <div key={p._id} className="border p-2 rounded shadow flex flex-col justify-between">
            <h3 className="font-bold">{p.title}</h3>
            <p>Stock: {p.stock}</p>
            <p>Price: ₹{p.price}</p>
            <div className="flex flex-wrap gap-2">
              {p.images?.map((img, idx) => (
                <img
                  key={idx}
                  src={img.url || img}
                  alt={p.title}
                  className="w-16 h-16 object-cover rounded"
                />
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <button onClick={() => handleEdit(p)} className="bg-blue-600 text-white p-1 rounded flex-1">
                Edit
              </button>
              <button onClick={() => handleDelete(p._id)} className="bg-red-600 text-white p-1 rounded flex-1">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OwnerStock;
