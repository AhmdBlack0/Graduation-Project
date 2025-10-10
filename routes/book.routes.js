import express from "express";
import {
  createBook,
  getBooks,
  getBookById,
  updatePageContent,
  deleteBook,
  updateBook,
  updateCategoryImage,
} from "../controllers/book.controller.js";

import { verifyToken } from "../middlewares/verifyToken.js";
import { verifyAdmin } from "../middlewares/verifyAdmin.js";

const router = express.Router();

router.post("/", verifyToken, verifyAdmin, createBook);
router.get("/", getBooks);
router.get("/:id", getBookById);
router.patch("/:id", verifyToken, verifyAdmin, updateBook);
router.put("/:id/page", verifyToken, verifyAdmin, updatePageContent);
router.delete("/:id", verifyToken, verifyAdmin, deleteBook);
router.put(
  "/update-category-image",
  verifyToken,
  verifyAdmin,
  updateCategoryImage
);

export default router;
