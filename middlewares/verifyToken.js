import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  try {
    // التأكد من وجود التوكن في الكوكيز
    const token = req.cookies?.jwt;
    if (!token) {
      return res
        .status(401)
        .json({ error: "Access denied. No token provided." });
    }

    // فك التوكن باستخدام المفتاح السري
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    // تخزين البيانات في كائن الطلب
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    req.isVerified = decoded.isVerified;

    // التأكد من أن البريد الإلكتروني تم التحقق منه
    if (!req.isVerified) {
      return res
        .status(403)
        .json({ error: "Email not verified. Please verify your account." });
    }

    // الانتقال إلى الخطوة التالية (المسار المحمي)
    next();
  } catch (error) {
    console.error("JWT verification failed:", error.message);
    return res.status(401).json({ error: "Invalid or expired token." });
  }
};
