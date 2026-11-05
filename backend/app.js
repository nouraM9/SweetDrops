const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const path = require("path");

require("dotenv").config();

const app = express();

// Set security HTTP headers
app.use(helmet());

app.use(
  cors({
    origin: ["http://localhost:3000", "https://sweetdrops.nouradev.com'"],
  }),
);
// Add this middleware before your stSatic file serving
app.use("/img", (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header("Access-Control-Allow-Methods", "GET");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.use("/img", express.static(path.join(__dirname, "public/img")));

// Development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev")); // only log in development
}

// limit requests from same IP
const limiter = rateLimit({
  max: 1000,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});

app.use("/api", limiter);

// Body parser , reading data from body into req.body
app.use(express.json({ limit: "10kb" }));
// Data sanitization against NoSQL query injection
// app.use(mongoSanitize());

// Data protection against xss

// app.use(xss());

// Route import
const userRouter = require("./routes/userRouter");
const productRouter = require("./routes/productRouter");
const influencerRouter = require("./routes/influencerRouter");
const orderRouter = require("./routes/orderRouter");
// const webhookRoute = require('./routes/webhookRoutes');
const deliveryFee = require("./routes/deliveryFeesRouter");
const contactRouter = require("./routes/contactRouter");
// Route usage
app.use("/api/v1/users", userRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/influencers", influencerRouter);
app.use("/api/v1/orders", orderRouter);
app.use("/api/v1/deliveryFee", deliveryFee);
app.use("/api/v1/contact", contactRouter);
// app.use('/api/v1', webhookRoute);

//unhandled routes
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// add global error handler
app.use(globalErrorHandler);

//export app
module.exports = app;
