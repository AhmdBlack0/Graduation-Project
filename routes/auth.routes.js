import express from "express";
import {
  register,
  login,
  verifyEmail,
} from "../controllers/auth.controller.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = express.Router();

router.post("/login", login);
router.post("/signup", register);
router.get("/verify-email/:token", verifyEmail);

export default router;
