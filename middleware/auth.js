import jwt from "jsonwebtoken";
import User from "../models/User.js";

// في middleware/auth.js
export const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "2h" }
  );
};
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error("Invalid token");
  }
};

// ✅ مصادقة المستخدم
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    // 🔹 جلب المستخدم من قاعدة البيانات
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    req.user = user; // يتيح الوصول لاحقًا للـ role والبيانات الأخرى
    next();
  } catch (error) {
    console.log("Authentication error:", error.message);
    return res.status(401).json({
      success: false,
      message: error.message || "Authentication failed",
    });
  }
};

// ✅ مصادقة اختيارية (مثلاً لصفحات عامة)
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.userId).select("-password");

      if (user) {
        req.user = user;
      }
    }

    next();
  } catch {
    next();
  }
};

// ✅ السماح فقط للمشرفين
export const authorizeAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied: Admins only",
    });
  }
  next();
};
