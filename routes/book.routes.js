import express from "express";
import { createBook, getBooks } from "../controllers/book.controller.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { verifyAdmin } from "../middlewares/verifyAdmin.js";

const router = express.Router();

router.post("/", verifyToken, verifyAdmin, createBook);
router.get("/", getBooks);

export default router;
