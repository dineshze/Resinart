import dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import express from "express";
import fs from "fs";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./config/db.js";
import { initCloudinary } from "./utils/cloudinary.js";
import authRoutes from "./routes/authRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import productRoutes from "./routes/productRoutes.js";

initCloudinary();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsPath = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadsPath)) fs.mkdirSync(uploadsPath, { recursive: true });

const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174"
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true
}));
app.use(express.json());
app.use(morgan("dev"));
app.use("/uploads", express.static(uploadsPath));

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.get("/api/pincode/:pincode", async (req, res, next) => {
  try {
    const { pincode } = req.params;
    if (!/^\d{6}$/.test(pincode)) {
      return res.status(400).json({ message: "Enter a valid 6 digit pincode" });
    }

    const response = await fetch(`http://www.postalpincode.in/api/pincode/${pincode}`);
    if (!response.ok) {
      return res.status(502).json({ message: "Pincode lookup service is unavailable" });
    }

    const data = await response.json();
    const postOffice = data?.PostOffice?.[0];
    if (data?.Status !== "Success" || !postOffice) {
      return res.status(404).json({ message: "Could not find this pincode" });
    }

    res.json({
      city: postOffice.District,
      district: postOffice.District,
      state: postOffice.State
    });
  } catch (error) {
    next(error);
  }
});
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || "Server error" });
});

const port = process.env.PORT || 5000;
connectDB()
  .then(() => app.listen(port, () => console.log(`API running on ${port}`)))
  .catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
