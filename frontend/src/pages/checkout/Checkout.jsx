import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Checkout.css";
import { useNavigate } from "react-router-dom";
const uaeCitiesFallback = [
  { city: "Dubai", fee: 40 },
  { city: "Abu Dhabi", fee: 25 },
  { city: "Sharjah", fee: 20 },
  { city: "Ajman", fee: 20 },
  { city: "Ras Al Khaimah", fee: 30 },
  { city: "Fujairah", fee: 35 },
  { city: "Umm Al Quwain", fee: 25 },
];

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
function Checkout({ cart, setCart }) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    whatsapp: "",
    city: "",
    shippingAddress: "",
    orderNotes: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cities, setCities] = useState([]);
  const [loadingCities, setLoadingCities] = useState(true);

  // New: product state & loading
  const [product, setProduct] = useState(null);
  const [loadingProduct, setLoadingProduct] = useState(true);

  const navigate = useNavigate();

  // Fetch cities for shipping fees
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const res = await fetch(`${REACT_APP_API_URL}/deliveryFee`);
        const data = await res.json();
        const fetchedCities = data.data || [];
        setCities(fetchedCities.length > 0 ? fetchedCities : uaeCitiesFallback);
      } catch (err) {
        console.error("Error fetching cities:", err);
        setCities(uaeCitiesFallback); // fallback on error too
      } finally {
        setLoadingCities(false);
      }
    };
    fetchCities();
  }, []);

  // Fetch the product info same as Home.jsx (load first product)
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`${REACT_APP_API_URL}/products`);
        if (res.data.data && res.data.data.length > 0) {
          setProduct(res.data.data[0]);
        }
      } catch (error) {
        console.error("Failed to fetch product for checkout:", error);
      } finally {
        setLoadingProduct(false);
      }
    };

    fetchProduct();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const getImageUrl = (imageCover) => {
    if (!imageCover || imageCover === "undefined" || imageCover.trim() === "") {
      return "/images.jpeg"; // fallback
    }
    return `${REACT_APP_API_URL.replace("/api/v1", "")}/img/products/${imageCover}`;
  };

  const subtotal = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );
  const selectedCity = cities.find((city) => city.city === formData.city);
  const shippingFee = selectedCity?.fee || 0;
  const total = subtotal + shippingFee;

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (
      !formData.fullName ||
      !formData.email ||
      !formData.phone ||
      !formData.city ||
      !formData.shippingAddress
    ) {
      setError("Please fill in all required fields");
      return;
    }

    if (cart.length === 0) {
      setError("Your cart is empty");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const influencerCode = localStorage.getItem("influencerCode") || null;

      const orderData = {
        customerName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        shipping: {
          address: formData.shippingAddress,
          city: formData.city,
        },
        product: cart[0]?.id || null,
        quantity: cart.reduce((total, item) => total + item.quantity, 0),
        deliveryFee: shippingFee,
        productPrice: subtotal,
        totalPrice: total,
        paymentMethod: "cod",
        status: "pending",
        message: formData.orderNotes?.trim() || null,
        influencerCode,
      };

      const response = await fetch(`${REACT_APP_API_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      if (!response.ok || result.status !== "success" || !result.data) {
        setError(result.message || "Failed to place order");
        setLoading(false);
        return;
      }

      const order = Array.isArray(result.data)
        ? result.data[result.data.length - 1]
        : result.data;

      setCart([]);
      localStorage.removeItem("influencerCode");

      navigate("/success", {
        state: { order },
      });
    } catch (error) {
      console.error("Error placing order:", error);
      setError("Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Get product image like Home.jsx
  const productImageUrl = product
    ? getImageUrl(product.imageCover)
    : "/images.jpeg";

  return (
    <div className="checkout-wrapper">
      <div className="checkout-grid">
        {/* Billing Form */}
        <div className="checkout-form">
          <h2>Billing Details</h2>
          {error && (
            <div
              style={{
                color: "red",
                backgroundColor: "#ffebee",
                padding: "10px",
                borderRadius: "4px",
                marginBottom: "20px",
              }}
            >
              {error}
            </div>
          )}
          <form onSubmit={handlePlaceOrder}>
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={handleInputChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleInputChange}
              required
            />
            <input
              type="text"
              name="whatsapp"
              placeholder="WhatsApp (Optional)"
              value={formData.whatsapp}
              onChange={handleInputChange}
            />

            <select
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              required
              style={{
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                width: "100%",
                marginBottom: "15px",
                backgroundColor: "white",
                color: "black",
              }}
            >
              <option value="">
                {loadingCities ? "Loading cities..." : "Select City"}
              </option>
              {cities.map((city, idx) => (
                <option key={city._id || idx} value={city.city}>
                  {city.city}
                </option>
              ))}
            </select>

            <input
              type="text"
              name="shippingAddress"
              placeholder="Shipping Address"
              value={formData.shippingAddress}
              onChange={handleInputChange}
              required
            />
            <textarea
              name="orderNotes"
              placeholder="Order Notes / Special Instructions (Optional)"
              rows="4"
              value={formData.orderNotes}
              onChange={handleInputChange}
              style={{
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                width: "100%",
                marginBottom: "15px",
                fontFamily: "inherit",
                resize: "vertical",
              }}
            />

            <button
              type="submit"
              className="place-order"
              disabled={loading || cart.length === 0}
              style={{ opacity: loading ? 0.6 : 1 }}
            >
              {loading ? "Processing..." : "Place Order"}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="checkout-summary">
          <h2>Your Order</h2>
          <div className="order-items">
            {cart.length > 0 ? (
              cart.map((item, idx) => (
                <div key={idx} className="order-item">
                  <img
                    src={getImageUrl(product?.imageCover)}
                    alt={product ? product.name : item.name}
                    onError={(e) => {
                      e.target.src = "/images.jpeg";
                      e.target.alt = "Image not found";
                    }}
                    crossOrigin="anonymous"
                  />
                  <div className="details">
                    <p>{item.name}</p>
                    <p>Qty: {item.quantity}</p>
                    <p>AED {(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p>Your cart is empty</p>
            )}
          </div>

          <div className="order-totals">
            <div>
              <span>Subtotal:</span>
              <span>AED {subtotal.toFixed(2)}</span>
            </div>
            <div>
              <span>Shipping {formData.city ? `(${formData.city})` : ""}:</span>
              <span>
                {loadingCities ? "Loading..." : `AED ${shippingFee.toFixed(2)}`}
              </span>
            </div>
            <div className="total">
              <span>Total:</span>
              <span>AED {total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
