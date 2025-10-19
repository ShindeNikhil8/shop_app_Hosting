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

  // editable URL images coming from DB or manual entry
  const [deviceImages, setDeviceImages] = useState([]);
  // comma-separated extra URL input
  const [googleImage, setGoogleImage] = useState("");
  // files selected from device to upload
  const [selectedFiles, setSelectedFiles] = useState([]); // { file, preview }
  const [editingId, setEditingId] = useState(null);

  const [categories, setCategories] = useState({
    Toys: ["Educational Toys", "Playsets", "Control Toys", "Stuffed Toys", "Eco-Friendly Toys"],
    Stationary: ["Pens", "Pencils", "Notebooks", "Markers"],
    Gifts: ["Gift Cards", "Plush Toys", "Accessories"],
  });
  const [ageGroups, setAgeGroups] = useState(["0-2", "3-5", "6-8", "9-12", "13+"]);
  const [skuOptions, setSkuOptions] = useState(["SKU1", "SKU2", "SKU3"]);
  const [tags, setTags] = useState([
    "Educational Toys","Playsets","Control Toys","Stuffed Toys","Eco-Friendly Toys",
    "Pens","Pencils","Notebooks","Markers",
    "Gift Cards","Plush Toys","Accessories","Featured","New Arrival","Best Seller"
  ]);

  useEffect(() => {
    if (user) fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    return () => {
      selectedFiles.forEach((f) => URL.revokeObjectURL(f.preview));
    };
  }, [selectedFiles]);

  const fetchProducts = async () => {
    try {
      const res = await axios.get("/api/products", {
        headers: user ? { Authorization: `Bearer ${user.token}` } : {},
      });
      setProducts(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Error fetching products ❌");
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

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

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    const mapped = files.map((file) => ({ file, preview: URL.createObjectURL(file) }));
    setSelectedFiles((prev) => [...prev, ...mapped]);
  };

  const removeSelectedFile = (idx) => {
    setSelectedFiles((prev) => {
      const removed = prev[idx];
      if (removed) URL.revokeObjectURL(removed.preview);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const handleSubmit = async () => {
    // Build array of URL-only images (existing editable URLs + comma extra)
    const urlImages = [
      ...deviceImages.filter((i) => i && i.trim() !== ""),
      ...googleImage.split(",").map((s) => s.trim()).filter(Boolean),
    ];

    try {
      const headers = { Authorization: user ? `Bearer ${user.token}` : "" };

      if (editingId) {
        // If new device files were selected, upload them first to append using POST /:id/images
        if (selectedFiles.length > 0) {
          const fdFiles = new FormData();
          selectedFiles.forEach(({ file }) => fdFiles.append("images", file));
          await axios.post(`/api/products/${editingId}/images`, fdFiles, {
            headers: { ...headers, "Content-Type": "multipart/form-data" },
          });
        }

        // Then update product fields (and replace images array with URL images if provided)
        const patchData = { ...formData };
        if (urlImages.length > 0) patchData.images = urlImages;
        await axios.patch(`/api/products/${editingId}`, patchData, { headers });
        toast.success("Product updated successfully ✅");
      } else {
        // Create new product: use FormData so backend can accept files + URLs
        const fd = new FormData();
        Object.entries(formData).forEach(([k, v]) => fd.append(k, v));
        urlImages.forEach((url) => fd.append("images", url)); // append URLs
        selectedFiles.forEach(({ file }) => fd.append("images", file)); // append files
        await axios.post("/api/products", fd, {
          headers: { ...headers, "Content-Type": "multipart/form-data" },
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

    // normalize images -> strings for editing (backend may store objects {url, public_id})
    const urls = (product.images || []).map((it) =>
      typeof it === "string" ? it : (it.url || it.secure_url || "")
    ).filter(Boolean);
    setDeviceImages(urls);

    // clear selected files for new edit
    selectedFiles.forEach((f) => URL.revokeObjectURL(f.preview));
    setSelectedFiles([]);
    setGoogleImage("");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await axios.delete(`/api/products/${id}`, {
        headers: { Authorization: user ? `Bearer ${user.token}` : "" },
      });
      setProducts((prev) => prev.filter((p) => p._id !== id));
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
    selectedFiles.forEach((f) => URL.revokeObjectURL(f.preview));
    setSelectedFiles([]);
    setEditingId(null);
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <ToastContainer position="top-right" autoClose={2000} />
      <h1 className="text-2xl font-bold mb-4">Manage Stock</h1>

      <div className="mb-6 space-y-4">
        <input name="title" placeholder="Title" value={formData.title} onChange={handleChange} className="border p-2 rounded w-full" />
        <textarea name="desc" placeholder="Description" value={formData.desc} onChange={handleChange} className="border p-2 rounded w-full" />

        <div className="flex gap-2 items-center">
          <select name="mainCategory" value={formData.mainCategory} onChange={handleChange} className="border p-2 rounded flex-1">
            <option value="">Select Main Category</option>
            {Object.keys(categories).map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <button type="button" onClick={() => handleAddOption("Main Category")} className="bg-green-500 text-white px-2 py-1 rounded">++</button>
        </div>

        <div className="flex gap-2 items-center">
          <select name="subCategory" value={formData.subCategory} onChange={handleChange} className="border p-2 rounded flex-1">
            <option value="">Select Sub Category</option>
            {formData.mainCategory && categories[formData.mainCategory]?.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button type="button" onClick={() => handleAddOption("Sub Category")} className="bg-green-500 text-white px-2 py-1 rounded">++</button>
        </div>

        <div className="flex gap-2 items-center">
          <select name="ageGroup" value={formData.ageGroup} onChange={handleChange} className="border p-2 rounded flex-1">
            <option value="">Select Age Group</option>
            {ageGroups.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
          <button type="button" onClick={() => handleAddOption("Age Group")} className="bg-green-500 text-white px-2 py-1 rounded">++</button>
        </div>

        <div className="flex gap-2 items-center">
          <select name="sku" value={formData.sku} onChange={handleChange} className="border p-2 rounded flex-1">
            <option value="">Select SKU</option>
            {skuOptions.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button type="button" onClick={() => handleAddOption("SKU")} className="bg-green-500 text-white px-2 py-1 rounded">++</button>
        </div>

        <div className="flex gap-2 items-center">
          <select name="tag" value={formData.tag} onChange={handleChange} className="border p-2 rounded flex-1">
            <option value="">Select Tag</option>
            {tags.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <button type="button" onClick={() => handleAddOption("Tag")} className="bg-green-500 text-white px-2 py-1 rounded">++</button>
        </div>

        <input name="price" placeholder="Price" type="number" value={formData.price} onChange={handleChange} className="border p-2 rounded w-full" />
        <input name="oldPrice" placeholder="Old Price" type="number" value={formData.oldPrice} onChange={handleChange} className="border p-2 rounded w-full" />
        <input name="stock" placeholder="Stock" type="number" value={formData.stock} onChange={handleChange} className="border p-2 rounded w-full" />

        {/* Images Section */}
        <div className="space-y-2">
          <label className="font-semibold">Product Images (URLs)</label>
          {deviceImages.map((img, idx) => (
            <div key={idx} className="flex gap-2 items-center">
              <input type="text" placeholder={`Image URL ${idx + 1}`} value={img}
                onChange={(e) => { const newImages = [...deviceImages]; newImages[idx] = e.target.value; setDeviceImages(newImages); }}
                className="border p-2 rounded flex-1" />
              {img && <img src={img} alt={`preview-${idx}`} className="w-16 h-16 object-contain rounded border" onError={(e)=>e.currentTarget.src="https://via.placeholder.com/64?text=No+Image"} />}
              <button type="button" onClick={() => setDeviceImages(deviceImages.filter((_, i) => i !== idx))} className="bg-red-500 text-white px-2 py-1 rounded">Delete</button>
            </div>
          ))}
          <button type="button" onClick={() => setDeviceImages([...deviceImages, ""])} className="bg-green-500 text-white px-4 py-2 rounded mt-2">+ Add Image URL</button>

          <div className="mt-2">
            <label className="font-semibold">Extra Image URLs (comma separated)</label>
            <input value={googleImage} onChange={(e) => setGoogleImage(e.target.value)} placeholder="url1, url2" className="border p-2 rounded w-full" />
          </div>

          <div className="mt-2">
            <label className="font-semibold">Upload Images from Device</label>
            <input type="file" accept="image/*" multiple onChange={handleFileSelect} className="block mt-2" />
            <div className="flex gap-2 flex-wrap mt-2">
              {selectedFiles.map((f, idx) => (
                <div key={idx} className="relative">
                  <img src={f.preview} alt={`sel-${idx}`} className="w-20 h-20 object-cover rounded border" />
                  <button type="button" onClick={() => removeSelectedFile(idx)} className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-6 h-6 text-xs">×</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={handleSubmit} className="bg-blue-600 text-white px-4 py-2 rounded flex-1">
            {editingId ? "Update Product" : "Add Product"}
          </button>
          {editingId && <button onClick={resetForm} className="bg-gray-500 text-white px-4 py-2 rounded flex-1">Cancel</button>}
        </div>
      </div>

      <h2 className="font-semibold mb-2">Current Stock</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((p) => (
          <div key={p._id} className="border p-2 rounded shadow flex flex-col justify-between">
            <h3 className="font-bold">{p.title}</h3>
            <p>Stock: {p.stock}</p>
            <p>Price: ₹{p.price}</p>
            <div className="flex flex-wrap gap-2">
              {(p.images || []).map((img, idx) => {
                const src = typeof img === "string" ? img : (img.url || img.secure_url || "");
                return <img key={idx} src={src} alt={p.title} className="w-16 h-16 object-cover rounded" onError={(e)=>e.currentTarget.src="https://via.placeholder.com/64?text=No+Image"} />;
              })}
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