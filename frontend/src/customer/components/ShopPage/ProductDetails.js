import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import ProductCard from "../ProductCard";
import { AuthContext } from "../../../context/AuthContext";
import { useCart } from "../../../context/CartContext";
import { toast } from "react-toastify";

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [qty, setQty] = useState(1);
  const [review, setReview] = useState({ name: "", rating: 0, comment: "" });
  const [showReviews, setShowReviews] = useState(false);
  const [mainImage, setMainImage] = useState("");

  useEffect(() => {
    axios
      .get(`https://shop-app-hosting.vercel.app/api/products/${id}`)
      .then((res) => {
        setProduct(res.data.product);
        setRelated(res.data.relatedProducts);
        setMainImage(res.data.product.images[0]);
      })
      .catch((err) => console.error(err));
  }, [id]);

  const increaseQty = () => {
    if (qty + 1 > product.stock) {
      toast.warn(`Only ${product.stock} items available!`);
      return;
    }
    setQty(qty + 1);
  };

  const decreaseQty = () => {
    if (qty - 1 < 1) return;
    setQty(qty - 1);
  };

  const handleAddToCart = () => {
    if (!user) {
      toast.info("Please login to add to cart");
      navigate("/login");
      return;
    }
    if (qty > product.stock) {
      toast.error(`Cannot add ${qty} items. Only ${product.stock} left in stock!`);
      return;
    }
    addToCart(product._id, qty);
  };

  const handleAddReview = async () => {
    if (!user) {
      toast.info("You must be logged in to add a review!");
      navigate("/login");
      return;
    }

    try {
      await axios.patch(`https://shop-app-hosting.vercel.app/api/products/${id}/review`, {
        review: { name: user.username, comment: review.comment },
        rating: Number(review.rating),
      });

      setReview({ name: "", rating: 0, comment: "" });

      const res = await axios.get(`https://shop-app-hosting.vercel.app/api/products/${id}`);
      setProduct(res.data.product);
      setShowReviews(true);
      toast.success("Review added ✅");
    } catch (err) {
      console.error(err);
      toast.error("Error adding review");
    }
  };

  if (!product) return <p>Loading...</p>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Images */}
        <div className="flex-1 flex flex-col gap-2">
          <div className="w-[400px] h-[400px] flex justify-center items-center">
            <img
              src={mainImage}
              alt={product.title}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto mt-2">
            {product.images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`${product.title}-${idx}`}
                className={`w-20 h-20 object-cover cursor-pointer border rounded ${
                  img === mainImage ? "border-blue-600" : ""
                }`}
                onClick={() => setMainImage(img)}
              />
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{product.title}</h1>
          <p className="text-xl text-red-600 font-bold">₹{product.price}</p>
          {product.oldPrice && (
            <span className="line-through text-gray-400">₹{product.oldPrice}</span>
          )}
          <p className="mt-2">{product.desc}</p>

          <div className="mt-4 flex flex-col gap-2">
            <span>Main Category: {product.mainCategory}</span>
            <span>Sub Category: {product.subCategory}</span>
            <span>Age: {product.ageGroup}</span>
            <span>SKU: {product.sku}</span>
            <span>
              Stock:{" "}
              {product.stock > 0 ? (
                <span className="text-green-600">{product.stock}</span>
              ) : (
                <span className="text-red-600 font-bold">Out of Stock</span>
              )}
            </span>
          </div>

          {/* Qty Selector */}
          <div className="mt-4 flex items-center gap-2">
            <button onClick={decreaseQty}>-</button>
            <span>{qty}</span>
            <button onClick={increaseQty}>+</button>
          </div>

          {/* Add to Cart / Sell Item */}
          {user?.isOwner ? (
            <button
              className={`mt-4 px-4 py-2 rounded font-semibold text-white ${
                product.stock > 0 ? "bg-green-600 hover:bg-green-700" : "bg-gray-400 cursor-not-allowed"
              }`}
              onClick={async () => {
                if (qty > product.stock) {
                  toast.error(`Cannot sell ${qty} items. Only ${product.stock} left in stock!`);
                  return;
                }
                try {
                  const res = await axios.patch(
                    `https://shop-app-hosting.vercel.app/api/products/${id}/sell`,
                    { quantity: qty }
                  );
                  setProduct(res.data); // update product stock
                  toast.success(`Sold ${qty} items ✅`);
                  setQty(1);
                } catch (err) {
                  console.error(err);
                  toast.error("Error selling product");
                }
              }}
              disabled={product.stock <= 0}
            >
              {product.stock > 0 ? "Sell Item" : "Out of Stock"}
            </button>
          ) : (
            <button
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
            >
              Add to Cart
            </button>
          )}

          {/* Reviews */}
          <div className="mt-6">
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded mb-2"
              onClick={() => setShowReviews(!showReviews)}
            >
              {showReviews
                ? "Hide Reviews"
                : `Show Reviews (${product.reviews.length})`}
            </button>

            {showReviews && (
              <div className="max-h-64 overflow-y-auto border p-2 rounded mb-4">
                {product.reviews.length > 0 ? (
                  product.reviews.map((r, i) => (
                    <div key={i} className="border-b p-2">
                      <p>
                        <strong>{r.name}</strong> - {r.rating}⭐
                      </p>
                      <p>{r.comment}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No reviews yet.</p>
                )}
              </div>
            )}

            {user ? (
              <div>
                <h3 className="font-semibold mb-2">Add Review</h3>
                <input
                  type="number"
                  placeholder="Rating (1-5)"
                  value={review.rating}
                  onChange={(e) => setReview({ ...review, rating: e.target.value })}
                  className="border p-1 w-full mb-2"
                />
                <textarea
                  placeholder="Comment"
                  value={review.comment}
                  onChange={(e) => setReview({ ...review, comment: e.target.value })}
                  className="border p-1 w-full mb-2"
                />
                <button
                  onClick={handleAddReview}
                  className="px-3 py-1 bg-blue-600 text-white rounded"
                >
                  Submit
                </button>
              </div>
            ) : (
              <p className="text-red-600 font-semibold">
                Please{" "}
                <span
                  className="underline cursor-pointer"
                  onClick={() => navigate("/login")}
                >
                  login
                </span>{" "}
                to add a review.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Related Products */}
      <div className="mt-10">
        <h2 className="text-2xl font-bold mb-4">Related Products</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {related.map((rp) => (
            <ProductCard key={rp._id} product={rp} onUpdate={() => {}} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
