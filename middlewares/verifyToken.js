import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    req.isVerified = decoded.isVerified;
    if (!req.isVerified) {
      return res.status(403).json({ error: "Email not verified" });
    }
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
};
