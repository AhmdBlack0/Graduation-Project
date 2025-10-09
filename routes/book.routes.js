import express from "express";
import {
  createBook,
  getBooks,
  getBookById,
  updatePageContent,
  deleteBook,
} from "../controllers/book.controller.js";

import { verifyToken } from "../middlewares/verifyToken.js";
import { verifyAdmin } from "../middlewares/verifyAdmin.js";

const router = express.Router();

router.post("/", verifyToken, verifyAdmin, createBook);
router.get("/", getBooks);
router.get("/:id", getBookById);
router.put("/:id/page", verifyToken, verifyAdmin, updatePageContent);
router.delete("/:id", verifyToken, verifyAdmin, deleteBook);

export default router;
