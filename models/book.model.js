import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
    details: {
      type: String,
    },
    bookImg: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      required: true,
      enum: [
        "educational and social sciences",
        "humanities",
        "economic and administrative sciences",
        "law books",
        "language and literature books",
      ],
    },
    subCategory: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const categorySubMap = {
  "educational and social sciences": ["psychology", "sociology", "education"],
  humanities: [
    "history",
    "geography",
    "philosophy and thought",
    "culture",
    "archaeology",
    "heritage",
    "media",
    "sociology",
  ],
  "economic and administrative sciences": [
    "management",
    "economics",
    "politics",
  ],
  "law books": ["law", "sharia and preaching"],
  "language and literature books": [
    "literature",
    "language",
    "dictionaries",
    "poetry and stories",
  ],
};

bookSchema.pre("validate", function (next) {
  const validSubs = categorySubMap[this.category];
  if (validSubs && !validSubs.includes(this.subCategory)) {
    return next(
      new Error(
        `Subcategory "${this.subCategory}" is not valid for category "${this.category}".`
      )
    );
  }
  next();
});

const Book = mongoose.model("Book", bookSchema);
export default Book;
