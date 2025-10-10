import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    enum: [
      "educational and social sciences",
      "humanities",
      "economic and administrative sciences",
      "law books",
      "language and literature books",
    ],
  },
  image: {
    type: String,
    required: true,
    default: "",
  },
});

const Category = mongoose.model("Category", categorySchema);
export default Category;
