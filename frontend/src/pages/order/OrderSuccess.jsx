import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./OrderSuccess.css";

function OrderSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showConfetti, setShowConfetti] = useState(true);

  const order = location.state?.order;
  console.log(order);
  // Redirect to home if no order is passed
  useEffect(() => {
    if (!order) {
      navigate("/");
    }
  }, [order, navigate]);

  // Hide confetti after animation
  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!order) return null;

  const {
    _id,
    createdAt,
    totalPrice,
    paymentMethod,
    product,
    quantity,
    orderNumber,
    shipping,
  } = order;

  const handleContinueShopping = () => {
    navigate("/");
  };

  return (
    <div className="success-page">
      {/* Floating background elements */}
      <div className="floating-element floating-element-1"></div>
      <div className="floating-element floating-element-2"></div>

      {/* Confetti Animation */}
      {showConfetti && (
        <div className="confetti-container">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className={`confetti confetti-${i % 4}`}
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random()}s`,
              }}
            />
          ))}
        </div>
      )}

      <div className="success-container">
        {/* Success Card */}
        <div className="success-card">
          <div className="success-header">
            <div className="success-icon">🎉</div>
            <h1>Order Placed Successfully!</h1>
            <p className="subtitle">Thank you for shopping with us! 💚</p>
          </div>

          {/* Order Info Grid */}
          <div className="info-grid">
            <div className="info-item">
              <div className="info-icon">📄</div>
              <div className="info-label">Order Number</div>
              <div className="info-value">
                {orderNumber || _id.slice(-6).toUpperCase()}
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon">📅</div>
              <div className="info-label">Order Date</div>
              <div className="info-value">
                {new Date(createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon">💰</div>
              <div className="info-label">Total Amount</div>
              <div className="info-value">AED {totalPrice?.toFixed(2)}</div>
            </div>

            <div className="info-item">
              <div className="info-icon">💳</div>
              <div className="info-label">Payment Method</div>
              <div className="info-value">
                {paymentMethod === "cod"
                  ? "Cash on Delivery"
                  : paymentMethod?.toUpperCase()}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="order-summary-section">
            <h2 className="section-title">🛒 Order Summary</h2>

            <div className="order-table-container">
              <table className="enhanced-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="product-name">
                      {product?.name || "Sweet Drops Product"}
                    </td>
                    <td>{quantity || 1}</td>
                    <td>AED {product?.price?.toFixed(2) || "0.00"}</td>
                    <td className="total-price">
                      AED {totalPrice?.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Shipping Info */}
          {shipping && (
            <div className="shipping-section">
              <h3 className="shipping-title">🚚 Shipping Details</h3>
              <p className="shipping-details">
                <strong>Address:</strong> {shipping.address}
                <br />
                <strong>City:</strong> {shipping.city}
              </p>
            </div>
          )}

          {/* Footer Note */}
          <div className="footer-note">
            <p>
              📧 We'll send you a confirmation email with delivery details
              shortly.
              <br />
              🚛 Your order will be delivered within 1-3 business days.
            </p>
          </div>

          {/* Action Button */}
          <div className="action-section">
            <button
              className="continue-shopping-btn"
              onClick={handleContinueShopping}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderSuccess;
