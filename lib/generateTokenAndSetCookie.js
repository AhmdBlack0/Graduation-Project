import jwt from "jsonwebtoken";

export const generateTokenAndSetCookie = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET_KEY, {
    expiresIn: "1d",
  });

  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // ← true فقط لما ترفع المشروع (Vercel أو Railway)
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax", // ← مهم جدًا
    maxAge: 24 * 60 * 60 * 1000, // يوم واحد
  });
};
