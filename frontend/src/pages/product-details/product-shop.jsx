import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";

import "./product.css"; // Your enhanced CSS file
// const API_URL = "http://127.0.0.1:8000/api/v1";
const REACT_APP_API_URL =
  process.env.REACT_APP_API_URL ||
  "https://sweetdrop-backend.onrender.com/api/v1";

const LOG_LEVEL = process.env.REACT_APP_LOG_LEVEL || "error";
// Helper: log differently in dev vs prod
function logError(message, error) {
  if (LOG_LEVEL === "debug") {
    console.error(message, error);
  } else {
    console.error(message);
  }
}
function Product({ addToCart, setCart }) {
  const { productId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(true);

  // Capture influencer code from URL and save to localStorage
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const influencerCode = params.get("influencer");
    if (influencerCode) {
      localStorage.setItem("influencerCode", influencerCode.toLowerCase());
      console.log("Saved influencer code:", influencerCode.toLowerCase());
    }
  }, [location.search]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${REACT_APP_API_URL}/products/${productId}`,
        );
        console.log(res);

        const productData = res.data.data;

        setProduct({
          id: productData._id,
          name: productData.name,
          description: productData.description,
          price: productData.price,
          stock: productData.stock || 99,
          imageCover: productData.imageCover,
          slug: productData.slug,
        });
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    } else {
      setLoading(false);
    }
  }, [productId]);

  const getImageUrl = (imageCover) => {
    if (!imageCover)
      return "https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?auto=format&fit=crop&w=800&q=80";
    return `${REACT_APP_API_URL.replace("/api/v1", "")}/img/products/${imageCover}`;
  };

  const handleBuyNow = () => {
    if (product) {
      // Cancel addToCart to avoid opening sidebar
      setCart([{ ...product, quantity }]); // Directly set cart for checkout
      navigate("/checkout"); // Navigate to checkout page
    }
  };

  const handleQuantityChange = (e) => {
    const newQuantity = parseInt(e.target.value);
    const maxStock = product?.stock || 99;

    if (!isNaN(newQuantity) && newQuantity >= 1 && newQuantity <= maxStock) {
      setQuantity(newQuantity);
    }
  };

  const incrementQuantity = (e) => {
    e.preventDefault();
    const maxStock = product?.stock || 99;
    if (quantity < maxStock) {
      setQuantity((prev) => prev + 1);
    }
  };

  const decrementQuantity = (e) => {
    e.preventDefault();
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  if (loading) {
    return (
      <div className="product-page">
        <div className="product-container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <div className="loading-text">Loading product details...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-page">
        <div className="product-container">
          <div className="loading-container">
            <div className="loading-text">Product not found</div>
            <button
              onClick={() => navigate("/")}
              className="btn-primary"
              style={{
                padding: "0.75rem 1.5rem",
                background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
                color: "white",
                border: "none",
                borderRadius: "0.75rem",
                cursor: "pointer",
                marginTop: "1rem",
              }}
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const maxStock = product.stock || 99;

  return (
    <div className="product-page">
      <div className="product-container">
        <div
          className="product-card"
          style={{ display: "flex", gap: "0", alignItems: "stretch" }}
        >
          <div className="product-image" style={{ flex: "1" }}>
            {imageLoading && (
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  zIndex: 1,
                }}
              >
                <div
                  className="loading-spinner"
                  style={{ width: "40px", height: "40px" }}
                ></div>
              </div>
            )}
            <img
              src={getImageUrl(product?.imageCover)}
              alt={product.name}
              onLoad={() => setImageLoading(false)}
              onError={(e) => {
                e.target.src =
                  "https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?auto=format&fit=crop&w=800&q=80";
                e.target.alt = "Sweet Drops Product";
                setImageLoading(false);
              }}
              crossOrigin="anonymous"
              style={{
                opacity: imageLoading ? 0 : 1,
                transition: "opacity 0.3s ease",
              }}
            />
          </div>

          <div className="product-details" style={{ flex: "1" }}>
            <h2>{product.name}</h2>

            <p className="product-description">{product.description}</p>

            <div className="product-price">AED {product.price.toFixed(2)}</div>

            <div className="quantity-wrapper">
              <label htmlFor="quantity">Quantity:</label>
              <div className="quantity-controls">
                <button
                  type="button"
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                  className="quantity-btn"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  min="1"
                  max={maxStock}
                  value={quantity}
                  onChange={handleQuantityChange}
                  className="quantity-input"
                />
                <button
                  type="button"
                  onClick={incrementQuantity}
                  disabled={quantity >= maxStock}
                  className="quantity-btn"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

            <div className="btn">
              <button className="buy-now" onClick={handleBuyNow}>
                Buy Now - AED {(product.price * quantity).toFixed(2)}
              </button>
            </div>

            {/* Stock indicator */}
            <div
              style={{
                marginTop: "1.5rem",
                fontSize: "0.9rem",
                color: product.stock > 10 ? "#059669" : "#dc2626",
                fontWeight: "500",
              }}
            >
              {product.stock > 10
                ? "✅ In Stock"
                : `⚠️ Only ${product.stock} left in stock`}
            </div>
          </div>
        </div>

        <div className="shipping-info">
          <h3>Shipping & Delivery</h3>
          <p>
            Orders placed before 3 PM are shipped the same day. We deliver
            across the UAE within 1–3 business days. Free delivery on orders
            over AED 100.
          </p>
          <ul>
            <li>Same-day shipping on weekdays</li>
            <li>Tracking number provided after dispatch</li>
            <li>Secure & eco-friendly packaging</li>
            <li>30-day money-back guarantee</li>
            <li>Customer support available 24/7</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Product;
