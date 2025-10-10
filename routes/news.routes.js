import express from "express";

import { verifyToken } from "../middlewares/verifyToken.js";
import { verifyAdmin } from "../middlewares/verifyAdmin.js";
import {
  createOneNews,
  deleteNews,
  getAllNews,
  getNewsById,
  updateNews,
} from "../controllers/news.controller.js";

const router = express.Router();

router.get("/", getAllNews);
router.get("/:id", getNewsById);
router.post("/", verifyToken, verifyAdmin, createOneNews);
router.patch("/:id", verifyToken, verifyAdmin, updateNews);
router.delete("/:id", verifyToken, verifyAdmin, deleteNews);

export default router;
