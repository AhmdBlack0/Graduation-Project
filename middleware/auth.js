import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "2h",
  });
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error("Invalid token");
  }
};

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");

    console.log("Authentication check:", {
      hasAuthHeader: !!authHeader,
      authHeader: authHeader ? authHeader.substring(0, 20) + "..." : "none",
      method: req.method,
      url: req.url,
    });

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log("Authentication error:", error.message);
    return res.status(401).json({
      success: false,
      message: error.message || "Authentication failed",
    });
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.userId).select("-password");

      if (user && user.isActive) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    next();
  }
};

export const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "الوصول مرفوض، يجب أن تكون مدير",
    });
  }
  next();
};
