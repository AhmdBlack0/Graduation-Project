import express from "express";
const router = express.Router();
import {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
  registerValidation,
  loginValidation,
  updateProfileValidation,
  changePasswordValidation,
} from "../controllers/authController.js";
import { authenticate } from "../middleware/auth.js";

router.post("/register", registerValidation, register);
router.post("/login", loginValidation, login);
router.get("/profile", authenticate, getProfile);

router.patch("/profile", authenticate, updateProfileValidation, updateProfile);
router.patch(
  "/change-password",
  authenticate,
  changePasswordValidation,
  changePassword
);
router.delete("/profile", authenticate, deleteAccount);

export default router;
