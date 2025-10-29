import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Document", documentSchema);
