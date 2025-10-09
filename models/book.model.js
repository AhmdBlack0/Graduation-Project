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
    category: {
      type: String,
      required: true,
      enum: [
        "العلوم التربوية والاجتماعية",
        "العلوم الإنسانية",
        "العلوم الاقتصادية والإدارية",
        "كتب القانون",
        "كتب اللغة والأدب",
      ],
    },
    subCategory: {
      type: String,
      required: true,
    },
    content: [
      {
        page_number: {
          type: Number,
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

// 🧠 Map تربط كل category بالـ subCategories الخاصة بها
const categorySubMap = {
  "العلوم التربوية والاجتماعية": ["علم النفس", "علم الاجتماع", "علم التربية"],
  "العلوم الإنسانية": [
    "التاريخ",
    "الجغرافيا",
    "الفلسفة والفكر",
    "الثقافة",
    "الآثار",
    "التراث",
    "الإعلام",
    "علم الاجتماع",
  ],
  "العلوم الاقتصادية والإدارية": ["الإدارة", "الاقتصاد", "السياسة"],
  "كتب القانون": ["القانون", "الشريعة والدعوة"],
  "كتب اللغة والأدب": ["الأدب", "اللغة", "المعاجم", "الشعر والقصة"],
};

// ✅ التحقق من أن subCategory صحيحة
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
