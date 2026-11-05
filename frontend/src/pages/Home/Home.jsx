import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Home.css";
import {
  faLocationDot,
  faPhoneAlt,
  faClock,
  faEnvelope,
  faLeaf,
  faUtensils,
  faWallet,
  faShoppingBag,
  faStar,
  faCheckCircle,
  faHeart,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";

// Env vars

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

function Home() {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: "", message: "" });

  // Fetch product with environment-aware error handling
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`${REACT_APP_API_URL}/products`);

        if (res.data?.data?.length > 0) {
          setProduct(res.data.data[0]);
          console.log(res.data.data[0].imageCover);
        }
      } catch (error) {
        logError("Failed to fetch product for home:", error);

        // Show user-friendly or detailed error
        if (LOG_LEVEL === "debug") {
          logError(
            `Dev Error: ${error.response?.data?.message || error.message}`,
          );
        } else {
          logError(
            "Unable to load products at the moment. Please try again later.",
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, []);

  const getImageUrl = (imageCover) => {
    if (!imageCover) return "";

    return `${REACT_APP_API_URL.replace("/api/v1", "")}/img/products/${imageCover}`;
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: "", message: "" });

    try {
      const response = await axios.post(
        `${REACT_APP_API_URL}/contact`,
        formData,
      );

      if (response.data.status === "success") {
        setSubmitStatus({
          type: "success",
          message:
            "Thank you! Your message has been sent successfully. We will get back to you soon.",
        });
        setFormData({ name: "", email: "", subject: "", message: "" });
      }
    } catch (error) {
      logError("Error sending message:", error);

      setSubmitStatus({
        type: "error",
        message:
          LOG_LEVEL === "debug"
            ? error.response?.data?.message ||
              error.message ||
              "Failed to send message."
            : "Failed to send message. Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const productImageUrl = product
    ? getImageUrl(product.imageCover)
    : "https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?auto=format&fit=crop&w=800&q=80";
  const aboutUsImageUrl =
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80";

  const features = [
    {
      title: "100% Natural",
      description:
        "Made with pure stevia extract from organic sources. No artificial chemicals or preservatives.",
      icon: faLeaf,
      className: "natural",
    },
    {
      title: "Rich Flavors",
      description:
        "Choose from vanilla, caramel, berry, and more delicious varieties — all sugar-free.",
      icon: faUtensils,
      className: "flavors",
    },
    {
      title: "Pocket Friendly",
      description:
        "Compact bottle design perfect for travel, office, or on-the-go sweetness anywhere.",
      icon: faWallet,
      className: "portable",
    },
  ];

  const benefits = [
    "Zero calories",
    "Diabetic friendly",
    "Keto compatible",
    "Gluten free",
  ];
  const contactInfo = [
    {
      icon: faLocationDot,
      title: "Address",
      info: "123 Sweet Street, Dubai, UAE",
    },
    { icon: faPhoneAlt, title: "Mobile", info: "+971 56 273 4746" },
    {
      icon: faClock,
      title: "Availability",
      info: "Mon–Fri: 9:00 AM – 6:00 PM",
    },
    { icon: faEnvelope, title: "Email", info: "nouramursal@gmail.com" },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="grid grid-cols-2">
              <div className="hero-text">
                <div className="hero-badge">
                  <FontAwesomeIcon icon={faHeart} />
                  #1 Natural Sweetener in UAE
                </div>
                <h1>
                  {product ? product.name : "SweetDrops Natural Sweetener"}
                </h1>
                <p>
                  {product
                    ? product.description
                    : "Experience the perfect balance of sweetness and health with our premium sugar-free drops made from pure stevia extract."}
                </p>
                <div className="hero-price">
                  {product?.price ? `${product.price} AED` : "49 AED"}
                </div>
                <div className="hero-rating">
                  {[...Array(5)].map((_, i) => (
                    <FontAwesomeIcon key={i} icon={faStar} className="star" />
                  ))}
                  <span className="rating-text">(4.9/5)</span>
                </div>

                <div className="hero-benefits">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="benefit-badge">
                      <FontAwesomeIcon
                        icon={faCheckCircle}
                        style={{ color: "#10b981" }}
                      />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>

                <div className="hero-buttons">
                  {product ? (
                    <Link
                      to={`/product/${product._id}`}
                      className="btn-primary"
                    >
                      <FontAwesomeIcon icon={faShoppingBag} /> Shop Now
                    </Link>
                  ) : (
                    <button className="btn-primary">
                      <FontAwesomeIcon icon={faShoppingBag} /> Shop Now
                    </button>
                  )}
                  <button className="btn-secondary">Learn More</button>
                </div>
              </div>

              <div className="hero-image">
                {loading ? (
                  <div className="loading-placeholder">Loading...</div>
                ) : (
                  <div style={{ position: "relative" }}>
                    <img
                      src={getImageUrl(product?.imageCover)}
                      alt={product?.name || "Sweet Drops"}
                      crossOrigin="anonymous"
                    />
                    <div className="discount-badge">50% OFF</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2>Why Choose SweetDrops?</h2>
            <p>
              Discover the perfect blend of health, taste, and convenience in
              every drop
            </p>
          </div>
          <div className="grid grid-cols-3">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className={`feature-icon ${feature.className}`}>
                  <FontAwesomeIcon icon={feature.icon} />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* About Section */}
      <section id="about" className="about-section">
        <div className="container">
          <div className="grid grid-cols-2">
            <div className="about-image">
              <img
                src={aboutUsImageUrl}
                alt="About SweetDrops"
                crossOrigin="anonymous"
              />
            </div>
            <div className="about-text">
              <h2>Our Story</h2>
              <p>
                At SweetDrops, we believe everyone deserves to enjoy life's
                sweetest moments without compromise...
              </p>
              <p>
                Crafted from the finest stevia extracts and natural ingredients,
                our drops represent years of research...
              </p>
              <div className="stats-grid">
                <div className="stat">
                  <span className="stat-number">100%</span>
                  <span className="stat-label">Natural</span>
                </div>
                <div className="stat">
                  <span className="stat-number">0</span>
                  <span className="stat-label">Calories</span>
                </div>
                <div className="stat">
                  <span className="stat-number">5★</span>
                  <span className="stat-label">Rating</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Contact Section */}
      <section id="contact" className="contact-section">
        <div className="container">
          <div className="grid grid-cols-2">
            <div className="contact-form">
              <h2>Get In Touch</h2>
              {submitStatus.message && (
                <div className={`status-message ${submitStatus.type}`}>
                  {submitStatus.message}
                </div>
              )}
              <form onSubmit={handleContactSubmit}>
                <div className="form-row">
                  <input
                    type="text"
                    name="name"
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Your Email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div className="form-group">
                  <input
                    type="text"
                    name="subject"
                    placeholder="Subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div className="form-group">
                  <textarea
                    name="message"
                    placeholder="Your Message"
                    rows="6"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="btn-primary "
                  style={{ width: "100%" }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} spin /> Sending...
                    </>
                  ) : (
                    "Send Message"
                  )}
                </button>
              </form>
            </div>
            <div className="contact-info">
              <h3>Contact Information</h3>
              {contactInfo.map((item, index) => (
                <div key={index} className="info-card">
                  <div className="info-icon-wrapper">
                    <FontAwesomeIcon icon={item.icon} className="info-icon" />
                  </div>
                  <div className="info-content">
                    <h4>{item.title}</h4>
                    <p>{item.info}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Home;
