import express from "express";
import {
  register,
  login,
  verifyEmail,
  resendVerification,
  // forgotPassword,
  getMe,
  updateProfile,
  deleteAccount,
  logout,
  changePassword,
} from "../controllers/auth.controller.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", verifyToken, getMe);
router.patch("/update-me", verifyToken, updateProfile);
router.delete("/delete-me", verifyToken, deleteAccount);
router.post("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerification);
// router.post("/forget-password", forgotPassword);
router.post("/logout", verifyToken, logout);
router.post("/reset-password", verifyToken, changePassword);

export default router;
