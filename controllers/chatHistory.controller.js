import chatHistoryModel from "../models/chatHistory.model.js";
import cloudinary from "../config/cloudinary.js";
import { asyncHandler, AppError } from "../middleware/errorHandler.js";

export const uploadChatHistory = asyncHandler(async (req, res) => {
  const { question, answer } = req.body;
  const userId = req.user.id; // جاية من auth middleware

  let reportImageUrl = null;

  if (req.file) {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "chat_reports",
    });
    reportImageUrl = result.secure_url;
  }

  const chatHistory = await chatHistoryModel.create({
    user: userId,
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
  const userId = req.user.id;
  const chatHistories = await chatHistoryModel
    .find({ user: userId })
    .sort({ createdAt: -1 });
  res.status(200).json({
    success: true,
    data: chatHistories,
  });
});

export const deleteChatHistory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;
  const chatHistory = await chatHistoryModel.findOneAndDelete({
    _id: id,
    user: userId,
  });
  if (!chatHistory) {
    return next(new AppError("Chat history not found or unauthorized", 404));
  }
  res.status(200).json({
    success: true,
    message: "Chat history deleted successfully",
  });
});

export const clearChatHistories = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  await chatHistoryModel.deleteMany({ user: userId });
  res.status(200).json({
    success: true,
    message: "All chat histories cleared successfully",
  });
});
