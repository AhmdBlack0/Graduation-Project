import chatHistoryModel from "../models/chatHistory.model.js";
import cloudinary from "../config/cloudinary.js";
import { asyncHandler, AppError } from "../middleware/errorHandler.js";

export const uploadChatHistory = asyncHandler(async (req, res) => {
  const { question, answer } = req.body;
  let reportImageUrl = null;

  if (req.file) {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "chat_reports",
    });
    reportImageUrl = result.secure_url;
  }
  const chatHistory = await chatHistoryModel.create({
    question,
    answer,
    reportImageUrl,
  });
  res.status(201).json({
    success: true,
    message: "Chat history uploaded successfully",
    data: chatHistory,
  });
});

export const getChatHistories = asyncHandler(async (req, res) => {
  const chatHistories = await chatHistoryModel.find().sort({ createdAt: -1 });
  res.status(200).json({
    success: true,
    data: chatHistories,
  });
});

export const getChatHistoryById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const chatHistory = await chatHistoryModel.findById(id);
  if (!chatHistory) {
    throw new AppError("Chat history not found", 404);
  }
  res.status(200).json({
    success: true,
    data: chatHistory,
  });
});

export const deleteChatHistory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const chatHistory = await chatHistoryModel.findByIdAndDelete(id);
  if (!chatHistory) {
    throw new AppError("Chat history not found", 404);
  }
  res.status(200).json({
    success: true,
    message: "Chat history deleted successfully",
  });
});
