import mongoose from "mongoose";

const chatHistorySchema = new mongoose.Schema(
  {
    question: {
      type: String,
    },
    answer: {
      type: String,
    },
    reportImageUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("ChatHistory", chatHistorySchema);
