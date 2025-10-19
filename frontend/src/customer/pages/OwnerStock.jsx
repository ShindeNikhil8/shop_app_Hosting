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
  const [imageMode, setImageMode] = useState("url");

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
    "Gift Cards", "Plush Toys", "Accessories", "Featured", "New Arrival", "Best Seller"
  ]);

  useEffect(() => { if(user) fetchProducts(); }, [user]);

  const fetchProducts = async () => {
    try {
      const res = await axios.get("https://shop-app-hosting.vercel.app/api/products", {
        headers: { Authorization: `Bearer ${user.token}` }
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
      setCategories({ ...categories, [formData.mainCategory]: [...categories[formData.mainCategory], value] });
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
      Object.entries(formData).forEach(([key, value]) => form.append(key, value));

      const urlImages = images.filter(img => img.type === "url").map(img => img.data);
      const fileImages = images.filter(img => img.type === "file");

      urlImages.forEach(url => form.append("images[]", url));
      fileImages.forEach(f => form.append("images", f.data));

      if (editingId) {
        await axios.patch(`https://shop-app-hosting.vercel.app/api/products/${editingId}`, form, {
          headers: { Authorization: `Bearer ${user.token}`, "Content-Type": "multipart/form-data" }
        });
        toast.success("Product updated successfully ✅");
      } else {
        await axios.post("https://shop-app-hosting.vercel.app/api/products", form, {
          headers: { Authorization: `Bearer ${user.token}`, "Content-Type": "multipart/form-data" }
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
      stock: product.stock || 10
    });
    setEditingId(product._id);
    setImages(product.images?.map(img => ({ type: "url", data: img.url || img })) || []);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await axios.delete(`https://shop-app-hosting.vercel.app/api/products/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setProducts(products.filter(p => p._id !== id));
      toast.success("Product deleted successfully ✅");
    } catch (err) {
      console.error(err);
      toast.error("Error deleting product ❌");
    }
  };

  const resetForm = () => {
    setFormData({ title:"", desc:"", price:0, oldPrice:0, tag:"", mainCategory:"", subCategory:"", ageGroup:"", sku:"", stock:10 });
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
        {/* ... Categories, Tags, SKU, Age Group select sections remain same as before ... */}
        {/* Images Section */}
        <div className="space-y-2">
          <label className="font-semibold">Product Images</label>
          <div className="flex gap-2">
            <button type="button" onClick={() => setImageMode("url")} className={`px-3 py-1 rounded ${imageMode==="url"?"bg-blue-600 text-white":"bg-gray-300"}`}>Use URL</button>
            <button type="button" onClick={() => setImageMode("device")} className={`px-3 py-1 rounded ${imageMode==="device"?"bg-blue-600 text-white":"bg-gray-300"}`}>Upload File</button>
          </div>
          {images.map((img, idx) => (
            <div key={idx} className="flex gap-2 items-center">
              {imageMode==="url" && <input type="text" placeholder={`Image URL ${idx+1}`} value={img.data} onChange={e=>handleImageChange(idx,e.target.value)} className="border p-2 rounded flex-1"/>}
              {imageMode==="device" && <input type="file" onChange={e=>handleFileUpload(e,idx)} className="flex-1"/>}
              {img.data && <img src={img.type==="file"?URL.createObjectURL(img.data):img.data} alt="Preview" className="w-16 h-16 object-contain rounded border"/>}
              <button type="button" onClick={()=>setImages(images.filter((_,i)=>i!==idx))} className="bg-red-500 text-white px-2 py-1 rounded">Delete</button>
            </div>
          ))}
          <button type="button" onClick={()=>setImages([...images,{type:imageMode,data:""}])} className="bg-green-500 text-white px-4 py-2 rounded mt-2">+ Add Image</button>
        </div>

        <div className="flex gap-2">
          <button onClick={handleSubmit} className="bg-blue-600 text-white px-4 py-2 rounded flex-1">{editingId?"Update Product":"Add Product"}</button>
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
              {p.images?.map((img, idx) => <img key={idx} src={img.url || img} alt={p.title} className="w-16 h-16 object-cover rounded"/>)}
            </div>
            <div className="flex gap-2 mt-2">
              <button onClick={()=>handleEdit(p)} className="bg-blue-600 text-white p-1 rounded flex-1">Edit</button>
              <button onClick={()=>handleDelete(p._id)} className="bg-red-600 text-white p-1 rounded flex-1">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OwnerStock;
