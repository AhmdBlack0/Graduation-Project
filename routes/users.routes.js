import express from "express";
import { getAllUsers, getUserById } from "../controllers/users.controller.js";
import { verifyAdmin } from "../middlewares/verifyAdmin.js";

const router = express.Router();

router.get("/users", verifyAdmin, getAllUsers);
router.get("/user/:id", getUserById);

export default router;
