import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const verifyToken = async (req, res, next) => {
  try {
    const token =
      req.cookies?.jwt || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ error: "Not authorized, no token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    const user = await User.findById(decoded.userId).select(
      "-password -__v -verificationCode -verificationCodeExpires"
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // ⚠️ هنا التأكد من التفعيل لازم يكون من قاعدة البيانات مش من التوكن
    if (!user.isVerified) {
      return res
        .status(403)
        .json({ error: "Email not verified. Please verify your account." });
    }

    req.userId = user._id;
    req.user = user;
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    res.status(401).json({ error: "Invalid or expired token" });
  }
};
