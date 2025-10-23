import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Email format is invalid",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Length must be at least 6 characters"],
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    usage: {
      questionsToday: {
        type: Number,
        default: 0,
      },
      lastQuestionDate: {
        type: Date,
        default: Date.now,
      },
      totalQuestions: {
        type: Number,
        default: 0,
      },
      documentsUploaded: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({ createdAt: -1 });

const User = mongoose.model("User", userSchema);
export default User;
