const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const orderRoutes = require("./routes/orders");
const userRoutes = require("./routes/users");
const categoryRoutes = require("./routes/categories");
const tagRoutes = require("./routes/tags");
const couponRoutes = require("./routes/coupons");
const cartRoutes = require("./routes/cart");
const wishlistRoutes = require("./routes/wishlist");
const appSettingsRoutes = require("./routes/appSettings");

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://besiks-full-stack.vercel.app",
  process.env.FRONTEND_URL,
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // ✅ allow cookies
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "Authorization"],
  exposedHeaders: ["set-cookie"],
  optionsSuccessStatus: 200,
};

// Middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(compression());
app.use(morgan("combined"));
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/ecommerce", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use("/v1/api/auth", authRoutes);
app.use("/v1/api/settings", appSettingsRoutes);
app.use("/v1/api/products", productRoutes);
app.use("/v1/api/orders", orderRoutes);
app.use("/v1/api/users", userRoutes);
app.use("/v1/api/categories", categoryRoutes);
app.use("/v1/api/tags", tagRoutes);
app.use("/v1/api/coupons", couponRoutes);
app.use("/v1/api/cart", cartRoutes);
app.use("/v1/api/wishlist", wishlistRoutes);

// Handle preflight requests
app.options("*", cors(corsOptions));

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Server is running" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
