import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { body, validationResult } from "express-validator";
import { generateToken, authenticate } from "../middleware/auth.js";
import { asyncHandler, AppError } from "../middleware/errorHandler.js";

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new AppError("Email Exists ", 400);
  }

  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password: hashedPassword,
  });

  const token = generateToken(user._id);

  const userResponse = user.toObject();
  delete userResponse.password;

  res.status(201).json({
    success: true,
    message: "Account created successfully",
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Input validation
  if (!email || !password) {
    throw new AppError("Email and password are required", 400);
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select(
    "+password"
  );

  // Check user exists and password is valid
  const isPasswordValid =
    user && (await bcrypt.compare(password, user.password));

  if (!user || !isPasswordValid) {
    throw new AppError("Invalid email or password", 401);
  }

  // Remove the unnecessary save
  // await user.save();

  const token = generateToken(user);

  // Remove password from response
  const userResponse = user.toObject();
  delete userResponse.password;

  res.json({
    success: true,
    message: "Logged in successfully",
    token,
    user: userResponse,
  });
});

const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");

  if (!user) {
    throw new AppError("User Not Found", 404);
  }

  res.json({
    success: true,
    user,
  });
});

const updateProfile = asyncHandler(async (req, res) => {
  const { name, email } = req.body;
  const userId = req.user._id;

  if (email && email !== req.user.email) {
    const existingUser = await User.findOne({
      email: email.toLowerCase(),
      _id: { $ne: userId },
    });

    if (existingUser) {
      throw new AppError("Email Taken", 400);
    }
  }

  const updateData = {};
  if (name) updateData.name = name.trim();
  if (email) updateData.email = email.toLowerCase().trim();

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: updateData },
    { new: true, runValidators: true }
  ).select("-password");

  res.json({
    success: true,
    message: "Profile updated successfully",
    user,
  });
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user._id;

  const user = await User.findById(userId).select("+password");
  if (!user) {
    throw new AppError("User Not Found", 404);
  }

  const isCurrentPasswordValid = await bcrypt.compare(
    currentPassword,
    user.password
  );
  if (!isCurrentPasswordValid) {
    throw new AppError("Current Password Is Wrong", 400);
  }

  const salt = await bcrypt.genSalt(12);
  const hashedNewPassword = await bcrypt.hash(newPassword, salt);

  user.password = hashedNewPassword;
  await user.save();

  res.json({
    success: true,
    message: "Password changed successfully",
  });
});

const deleteAccount = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  await User.findByIdAndUpdate(userId);
  res.json({
    success: true,
    message: "Account deleted successfully",
  });
});

const registerValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),

  body("email")
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail()
    .toLowerCase(),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/^(?=.*[a-zA-Z])(?=.*\d)/)
    .withMessage("Password must contain both letters and numbers"),
];

const loginValidation = [
  body("email")
    .isEmail()
    .withMessage("Email format is invalid")
    .normalizeEmail()
    .toLowerCase(),

  body("password").notEmpty().withMessage("Password is required"),
];

const updateProfileValidation = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),

  body("email")
    .optional()
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail()
    .toLowerCase(),
];

const changePasswordValidation = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),

  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters long")
    .matches(/^(?=.*[a-zA-Z])(?=.*\d)/)
    .withMessage("New password must contain both letters and numbers"),
];

export {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
  registerValidation,
  loginValidation,
  updateProfileValidation,
  changePasswordValidation,
};
