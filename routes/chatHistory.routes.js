import express from "express";

import {
  uploadChatHistory,
  getChatHistories,
  deleteChatHistory,
  clearChatHistories,
} from "../controllers/chatHistory.controller.js";
import { authenticate } from "../middleware/auth.js";
const router = express.Router();

router.post("/", authenticate, uploadChatHistory);
router.get("/", authenticate, getChatHistories);
router.delete("/:id", authenticate, deleteChatHistory);
router.delete("/", authenticate, clearChatHistories);

export default router;
