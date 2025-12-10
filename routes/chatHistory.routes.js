import express from "express";

import {
  getChatHistories,
  getChatHistoryById,
  uploadChatHistory,
  deleteChatHistory,
} from "../controllers/chatHistory.controller.js";
import { authenticate } from "../middleware/auth.js";
const router = express.Router();

router.post("/", authenticate, uploadChatHistory);
router.get("/", authenticate, getChatHistories);
router.get("/:id", authenticate, getChatHistoryById);
router.delete("/:id", authenticate, deleteChatHistory);

export default router;
