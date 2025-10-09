import express from "express";
import { getAllUsers, getUserById } from "../controllers/users.controller.js";
import { verifyAdmin } from "../middlewares/verifyAdmin.js";

const router = express.Router();

router.get("/", verifyAdmin, getAllUsers);
router.get("/:id", getUserById);

export default router;
