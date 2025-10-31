import express from "express";
import {
  getUsers,
  getUser,
  getAdmins,
} from "../controllers/users.controller.js";
import { authenticate } from "../middleware/auth.js";
import { authorizeAdmin } from "../middleware/auth.js";

const router = express.Router();

router.get("/", authenticate, authorizeAdmin, getUsers);
router.get("/:id", authenticate, authorizeAdmin, getUser);
router.get("/admins", authenticate, authorizeAdmin, getAdmins);

export default router;
