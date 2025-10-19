import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const OwnerStock = () => {
  const { user } = useContext(AuthContext);
  const [products, setProducts] = useState([]);

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
  const [editingId, setEditingId] = useState(null);

  const [categories, setCategories] = useState({
    Toys: ["Educational Toys", "Playsets", "Control Toys", "Stuffed Toys", "Eco-Friendly Toys"],
    Stationary: ["Pens", "Pencils", "Notebooks", "Markers"],
    Gifts: ["Gift Cards", "Plush Toys", "Accessories"],
  });
  const [ageGroups, setAgeGroups] = useState(["0-2", "3-5", "6-8", "9-12", "13+"]);
  const [skuOptions, setSkuOptions] = useState(["SKU1", "SKU2", "SKU3"]);
  const [tags, setTags] = useState([
    "Educational Toys", "Playsets", "Control Toys", "Stuffed Toys", "Eco-Friendly Toys",
    "Pens", "Pencils", "Notebooks", "Markers",
    "Gift Cards", "Plush Toys", "Accessories","Featured", "New Arrival", "Best Seller"
  ]);

  const [imageMode, setImageMode] = useState("url"); // 'url' or 'device'

  useEffect(() => {
    if (user) fetchProducts();
  }, [user]);

  const fetchProducts = async () => {
    try {
      const res = await axios.get("https://shop-app-hosting.vercel.app/api/products", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setProducts(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Error fetching products ❌");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddOption = (type) => {
    const value = prompt(`Enter new ${type}:`);
    if (!value) return;
    if (type === "Main Category") setCategories({ ...categories, [value]: [] });
    if (type === "Sub Category") {
      if (!formData.mainCategory) return toast.warn("Select Main Category first ⚠️");
      const newSubs = [...categories[formData.mainCategory], value];
      setCategories({ ...categories, [formData.mainCategory]: newSubs });
    }
    if (type === "Age Group") setAgeGroups([...ageGroups, value]);
    if (type === "SKU") setSkuOptions([...skuOptions, value]);
    if (type === "Tag") setTags([...tags, value]);
  };

  const handleImageChange = (idx, value) => {
    const newImages = [...images];
    newImages[idx] = { ...newImages[idx], data: value };
    setImages(newImages);
  };

  const handleFileUpload = (e, idx) => {
    const file = e.target.files[0];
    if (!file) return;
    const newImages = [...images];
    newImages[idx] = { type: "file", data: file };
    setImages(newImages);
  };

  const handleSubmit = async () => {
    try {
      const form = new FormData();

      // Append text data
      Object.entries(formData).forEach(([key, value]) => {
        form.append(key, value);
      });

      // Separate files and URL images
      const urlImages = images.filter(img => img.type === "url").map(img => img.data);
      const fileImages = images.filter(img => img.type === "file");

      urlImages.forEach(url => form.append("images[]", url)); // backend will accept URLs directly
      fileImages.forEach(f => form.append("images", f.data)); // backend will upload to Cloudinary

      if (editingId) {
        await axios.patch(`https://shop-app-hosting.vercel.app/api/products/${editingId}`, form, {
          headers: { Authorization: `Bearer ${user.token}`, "Content-Type": "multipart/form-data" },
        });
        toast.success("Product updated successfully ✅");
      } else {
        await axios.post("https://shop-app-hosting.vercel.app/api/products", form, {
          headers: { Authorization: `Bearer ${user.token}`, "Content-Type": "multipart/form-data" },
        });
        toast.success("Product added successfully ✅");
      }

      resetForm();
      fetchProducts();
    } catch (err) {
      console.error(err.response?.data || err);
      toast.error("Error saving product ❌");
    }
  };

  const handleEdit = (product) => {
    setFormData({
      title: product.title || "",
      desc: product.desc || "",
      price: product.price || 0,
      oldPrice: product.oldPrice || 0,
      tag: product.tag || "",
      mainCategory: product.mainCategory || "",
      subCategory: product.subCategory || "",
      ageGroup: product.ageGroup || "",
      sku: product.sku || "",
      stock: product.stock || 10,
    });

    setEditingId(product._id);
    setImages(
      product.images?.map(img => ({ type: "url", data: img.url || img })) || []
    );
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await axios.delete(`https://shop-app-hosting.vercel.app/api/products/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setProducts(products.filter((p) => p._id !== id));
      toast.success("Product deleted successfully ✅");
    } catch (err) {
      console.error(err);
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

      {/* Form */}
      <div className="mb-6 space-y-4">
        <input name="title" placeholder="Title" value={formData.title} onChange={handleChange} className="border p-2 rounded w-full"/>
        <textarea name="desc" placeholder="Description" value={formData.desc} onChange={handleChange} className="border p-2 rounded w-full"/>

        {/* Category, Subcategory, Age Group, SKU, Tag, Price, OldPrice, Stock (same as before) */}
        {/* ... same as your current code ... */}

        {/* Image Mode Toggle */}
        <div className="flex gap-2 mt-2">
          <button
            type="button"
            onClick={() => setImageMode("url")}
            className={`px-4 py-2 rounded ${imageMode === "url" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          >
            Use URL
          </button>
          <button
            type="button"
            onClick={() => setImageMode("device")}
            className={`px-4 py-2 rounded ${imageMode === "device" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          >
            Upload from Device
          </button>
        </div>

        {/* Images Section */}
        <div className="space-y-2 mt-2">
          <label className="font-semibold">Product Images</label>
          {images.map((img, idx) => (
            <div key={idx} className="flex gap-2 items-center">
              {imageMode === "url" ? (
                <input
                  type="text"
                  placeholder={`Image URL ${idx + 1}`}
                  value={img.data}
                  onChange={(e) => handleImageChange(idx, e.target.value)}
                  className="border p-2 rounded flex-1"
                />
              ) : (
                <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, idx)} className="flex-1"/>
              )}

              {/* Live Preview */}
              {img.data && (
                <img
                  src={img.type === "url" ? img.data : URL.createObjectURL(img.data)}
                  alt={`Preview ${idx + 1}`}
                  className="w-16 h-16 object-contain rounded border"
                  onError={(e) => { e.target.src = "https://via.placeholder.com/64?text=No+Image"; }}
                />
              )}

              <button type="button" onClick={() => setImages(images.filter((_, i) => i !== idx))} className="bg-red-500 text-white px-2 py-1 rounded">Delete</button>
            </div>
          ))}

          <button type="button" onClick={() => setImages([...images, { type: imageMode, data: "" }])} className="bg-green-500 text-white px-4 py-2 rounded mt-2">
            + Add Image
          </button>
        </div>

        <div className="flex gap-2">
          <button onClick={handleSubmit} className="bg-blue-600 text-white px-4 py-2 rounded flex-1">
            {editingId ? "Update Product" : "Add Product"}
          </button>
          {editingId && <button onClick={resetForm} className="bg-gray-500 text-white px-4 py-2 rounded flex-1">Cancel</button>}
        </div>
      </div>

      {/* Product List (same as before) */}
      {/* ... */}
    </div>
  );
};

export default OwnerStock;
