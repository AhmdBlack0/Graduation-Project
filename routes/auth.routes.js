import express from "express";
import {
  register,
  login,
  verifyEmail,
  resendVerification,
} from "../controllers/auth.controller.js";

const router = express.Router();

// Register new user (sends verification code via email)
router.post("/register", register);

// Verify email with code
router.post("/verify-email", verifyEmail);

// Resend verification code
router.post("/resend-verification", resendVerification);

// Login (only works if email is verified)
router.post("/login", login);

export default router;
