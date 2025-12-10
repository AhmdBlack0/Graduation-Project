import mongoose from "mongoose";
const chatHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    question: String,
    answer: String,
    reportImageUrl: String,
  },
  { timestamps: true }
);
const ChatHistory = mongoose.model("ChatHistory", chatHistorySchema);
export default ChatHistory;
