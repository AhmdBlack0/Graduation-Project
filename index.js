import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
dotenv.config();
import connectDB from "./db/connectDB.js";

// Use ES6 imports consistently
import authRoutes from "./routes/auth.js";
import documentRoutes from "./routes/documents.js";
// import bookRoutes from "./routes/books.js";
// import adminRoutes from "./routes/admin.js";

import { errorHandler } from "./middleware/errorHandler.js";
import { notFound } from "./middleware/notFound.js";

const app = express();

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        frameAncestors: ["'self'", "*"],
        imgSrc: ["'self'", "data:", "blob:", "*"],
        mediaSrc: ["'self'", "data:", "blob:", "*"],
        frameSrc: ["'self'", "*"],
        connectSrc: ["'self'", "*"],
      },
    },
  })
);

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    error: "Too many requests from this IP, please try again later.",
    message: "تم تجاوز الحد الأقصى للطلبات، يرجى المحاولة لاحقاً",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path.includes("/health") || req.path.includes("/verify"),
});

app.use("/api/auth/login", limiter);
app.use("/api/auth/register", limiter);

app.use(
  cors({
    origin: "http://localhost:5174",
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(compression());
app.use(
  process.env.NODE_ENV === "development" ? morgan("dev") : morgan("combined")
);

// 📚 Routes
app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);
// app.use("/api/books", bookRoutes);
// app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.send("✅ Server is running successfully!");
});

app.use(notFound);
app.use(errorHandler);

connectDB();

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server running locally on port ${PORT}`);
  });
}

export default app;
