import jwt from "jsonwebtoken";
import User from "../models/User.js";

// ✅ Token Generation
export const generateToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }

  return jwt.sign(
    {
      userId: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "2h" }
  );
};

// ✅ Token Verification
export const verifyToken = (token) => {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined");
    }
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new Error("Token has expired");
    }
    if (error.name === "JsonWebTokenError") {
      throw new Error("Invalid token");
    }
    throw error;
  }
};

// ✅ User Authentication Middleware
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const token = authHeader.substring(7); // or use .replace("Bearer ", "")

    // Verify token
    const decoded = verifyToken(token);

    // Fetch user from database
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found or has been deleted",
      });
    }

    // Optional: Check if user is active/verified
    // if (!user.isActive) {
    //   return res.status(401).json({
    //     success: false,
    //     message: "Account has been deactivated",
    //   });
    // }

    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error.message);

    // Handle specific errors
    if (error.message === "Token has expired") {
      return res.status(401).json({
        success: false,
        message: "Token has expired, please login again",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Authentication failed",
    });
  }
};

// ✅ Optional Authentication (for public pages)
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
  } catch (error) {
    // Silently fail for optional auth
    console.log("Optional auth failed:", error.message);
  }

  next();
};

// ✅ Admin Authorization
export const authorizeAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied: Admin privileges required",
    });
  }

  next();
};

// ✅ BONUS: Role-based authorization (flexible)
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied: Requires one of these roles: ${roles.join(
          ", "
        )}`,
      });
    }

    next();
  };
};

// ✅ BONUS: Refresh Token Generation (for better security)
export const generateRefreshToken = (user) => {
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error("JWT_REFRESH_SECRET is not defined");
  }

  return jwt.sign({ userId: user._id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
};

// ✅ BONUS: Account ownership verification
export const authorizeOwnerOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  const isOwner = req.user._id.toString() === req.params.userId;
  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isAdmin) {
    return res.status(403).json({
      success: false,
      message: "Access denied: You can only access your own resources",
    });
  }

  next();
};
