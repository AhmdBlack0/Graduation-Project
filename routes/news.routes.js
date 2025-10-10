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

router.get("/news", getAllNews);
router.get("/news/:id", getNewsById);
router.post("/news", verifyToken, verifyAdmin, createOneNews);
router.patch("/news/:id", verifyToken, verifyAdmin, updateNews);
router.delete("/news/:id", verifyToken, verifyAdmin, deleteNews);

export default router;
