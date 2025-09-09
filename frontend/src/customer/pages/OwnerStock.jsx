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

  const [deviceImages, setDeviceImages] = useState([]);
  const [googleImage, setGoogleImage] = useState("");
  const [editingId, setEditingId] = useState(null);

  // Categories, subcategories, ageGroups, SKU options
  const [categories, setCategories] = useState({
    Toys: ["Educational Toys", "Playsets", "Control Toys", "Stuffed Toys", "Eco-Friendly Toys"],
    Stationary: ["Pens", "Pencils", "Notebooks", "Markers"],
    Gifts: ["Gift Cards", "Plush Toys", "Accessories"],
  });
  const [ageGroups, setAgeGroups] = useState(["0-2", "3-5", "6-8", "9-12", "13+"]);
  const [skuOptions, setSkuOptions] = useState(["SKU1", "SKU2", "SKU3"]);

  // Tags combining all categories and subcategories
  const [tags, setTags] = useState([
    "Toys", "Educational Toys", "Playsets", "Control Toys", "Stuffed Toys", "Eco-Friendly Toys",
    "Stationary", "Pens", "Pencils", "Notebooks", "Markers",
    "Gifts", "Gift Cards", "Plush Toys", "Accessories"
  ]);

  useEffect(() => {
    if (user) fetchProducts();
  });

  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/products", {
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



  const handleSubmit = async () => {
    const submitData = {
  ...formData,
  images: [
    ...deviceImages.filter(img => img.trim() !== ""), // add deviceImages
    ...googleImage.split(",").map(img => img.trim()).filter(img => img !== ""), // add Google images if any
  ],
};


    try {
      if (editingId) {
        await axios.patch(`http://localhost:5000/api/products/${editingId}`, submitData, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        toast.success("Product updated successfully ✅");
      } else {
        await axios.post("http://localhost:5000/api/products", submitData, {
          headers: { Authorization: `Bearer ${user.token}` },
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
    setFormData({ ...product });
    setEditingId(product._id);
    setDeviceImages([]);
    setGoogleImage("");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/products/${id}`, {
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
    setDeviceImages([]);
    setGoogleImage("");
    setEditingId(null);
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <ToastContainer position="top-right" autoClose={2000} />
      <h1 className="text-2xl font-bold mb-4">Manage Stock</h1>

      {/* Form */}
      <div className="mb-6 space-y-4">
        <input
          name="title"
          placeholder="Title"
          value={formData.title}
          onChange={handleChange}
          className="border p-2 rounded w-full"
        />
        <textarea
          name="desc"
          placeholder="Description"
          value={formData.desc}
          onChange={handleChange}
          className="border p-2 rounded w-full"
        />

        {/* Main Category */}
        <div className="flex gap-2 items-center">
          <select
            name="mainCategory"
            value={formData.mainCategory}
            onChange={handleChange}
            className="border p-2 rounded flex-1"
          >
            <option value="">Select Main Category</option>
            {Object.keys(categories).map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <button type="button" onClick={() => handleAddOption("Main Category")} className="bg-green-500 text-white px-2 py-1 rounded">++</button>
        </div>

        {/* Sub Category */}
        <div className="flex gap-2 items-center">
          <select
            name="subCategory"
            value={formData.subCategory}
            onChange={handleChange}
            className="border p-2 rounded flex-1"
          >
            <option value="">Select Sub Category</option>
            {formData.mainCategory && categories[formData.mainCategory]?.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button type="button" onClick={() => handleAddOption("Sub Category")} className="bg-green-500 text-white px-2 py-1 rounded">++</button>
        </div>

        {/* Age Group */}
        <div className="flex gap-2 items-center">
          <select
            name="ageGroup"
            value={formData.ageGroup}
            onChange={handleChange}
            className="border p-2 rounded flex-1"
          >
            <option value="">Select Age Group</option>
            {ageGroups.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
          <button type="button" onClick={() => handleAddOption("Age Group")} className="bg-green-500 text-white px-2 py-1 rounded">++</button>
        </div>

        {/* SKU */}
        <div className="flex gap-2 items-center">
          <select
            name="sku"
            value={formData.sku}
            onChange={handleChange}
            className="border p-2 rounded flex-1"
          >
            <option value="">Select SKU</option>
            {skuOptions.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button type="button" onClick={() => handleAddOption("SKU")} className="bg-green-500 text-white px-2 py-1 rounded">++</button>
        </div>

        {/* Tag */}
        <div className="flex gap-2 items-center">
          <select
            name="tag"
            value={formData.tag}
            onChange={handleChange}
            className="border p-2 rounded flex-1"
          >
            <option value="">Select Tag</option>
            {tags.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <button type="button" onClick={() => handleAddOption("Tag")} className="bg-green-500 text-white px-2 py-1 rounded">++</button>
        </div>

        <input
          name="price"
          placeholder="Price"
          type="number"
          value={formData.price}
          onChange={handleChange}
          className="border p-2 rounded w-full"
        />
        <input
          name="oldPrice"
          placeholder="Old Price"
          type="number"
          value={formData.oldPrice}
          onChange={handleChange}
          className="border p-2 rounded w-full"
        />

        <input
          name="stock"
          placeholder="Stock"
          type="number"
          value={formData.stock}
          onChange={handleChange}
          className="border p-2 rounded w-full"
        />

        {/* Images Section */}
<div className="space-y-2">
  <label className="font-semibold">Product Images</label>
  {deviceImages.map((img, idx) => (
    <div key={idx} className="flex gap-2 items-center">
      <input
        type="text"
        placeholder={`Image URL ${idx + 1}`}
        value={img}
        onChange={(e) => {
          const newImages = [...deviceImages];
          newImages[idx] = e.target.value;
          setDeviceImages(newImages);
        }}
        className="border p-2 rounded flex-1"
      />
      <button
        type="button"
        onClick={() => {
          setDeviceImages(deviceImages.filter((_, i) => i !== idx));
        }}
        className="bg-red-500 text-white px-2 py-1 rounded"
      >
        Delete
      </button>
    </div>
  ))}

  <button
    type="button"
    onClick={() => setDeviceImages([...deviceImages, ""])}
    className="bg-green-500 text-white px-4 py-2 rounded mt-2"
  >
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
                <img key={idx} src={img} alt={p.title} className="w-16 h-16 object-cover rounded"/>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <button onClick={() => handleEdit(p)} className="bg-blue-600 text-white p-1 rounded flex-1">Edit</button>
              <button onClick={() => handleDelete(p._id)} className="bg-red-600 text-white p-1 rounded flex-1">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OwnerStock;
