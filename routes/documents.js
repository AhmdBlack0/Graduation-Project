import express from "express";
const router = express.Router();
import {
  uploadDocument,
  getDocuments,
  getDocument,
  updateDocument,
  deleteDocument,
} from "../controllers/documentController.js";
import { authenticate } from "../middleware/auth.js";
import { authorizeAdmin } from "../middleware/auth.js";

router.post("/upload", authenticate, authorizeAdmin, uploadDocument);
router.get("/", getDocuments);
router.get("/:id", getDocument);
router.patch("/:id", authenticate, authorizeAdmin, updateDocument);
router.delete("/:id", authenticate, authorizeAdmin, deleteDocument);

export default router;
