import jwt from "jsonwebtoken";

export const generateTokenAndSetCookie = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET_KEY, {
    expiresIn: "1d",
  });

  res.cookie("jwt", token, {
    maxAge: 60 * 60 * 24 * 1000,
    httpOnly: true,
    sameSite: "strict",
    secure: false,
  });
};
