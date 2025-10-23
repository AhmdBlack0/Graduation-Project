import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { body, validationResult } from "express-validator";
import { generateToken, authenticate } from "../middleware/auth.js";
import { asyncHandler, AppError } from "../middleware/errorHandler.js";

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new AppError("البريد الإلكتروني مستخدم بالفعل", 400);
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
    message: "تم إنشاء الحساب بنجاح",
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() }).select(
    "+password"
  );
  if (!user) {
    throw new AppError("بيانات الدخول غير صحيحة", 401);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new AppError("بيانات الدخول غير صحيحة", 401);
  }

  await user.save();

  const token = generateToken(user._id);

  const userResponse = user.toObject();
  delete userResponse.password;

  res.json({
    success: true,
    message: "تم تسجيل الدخول بنجاح",
    token,
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
    message: "تم تحديث البيانات بنجاح",
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
    message: "تم تغيير كلمة المرور بنجاح",
  });
});

const deleteAccount = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  await User.findByIdAndUpdate(userId);
  res.json({
    success: true,
    message: "تم حذف الحساب بنجاح",
  });
});

const registerValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("الاسم مطلوب")
    .isLength({ min: 2, max: 50 })
    .withMessage("الاسم يجب أن يكون بين 2 و 50 حرف"),

  body("email")
    .isEmail()
    .withMessage("البريد الإلكتروني غير صحيح")
    .normalizeEmail()
    .toLowerCase(),

  body("password")
    .isLength({ min: 6 })
    .withMessage("كلمة المرور يجب أن تكون 6 أحرف على الأقل")
    .matches(/^(?=.*[a-zA-Z])(?=.*\d)/)
    .withMessage("كلمة المرور يجب أن تحتوي على أحرف وأرقام"),
];

const loginValidation = [
  body("email")
    .isEmail()
    .withMessage("البريد الإلكتروني غير صحيح")
    .normalizeEmail()
    .toLowerCase(),

  body("password").notEmpty().withMessage("كلمة المرور مطلوبة"),
];

const updateProfileValidation = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("الاسم يجب أن يكون بين 2 و 50 حرف"),

  body("email")
    .optional()
    .isEmail()
    .withMessage("البريد الإلكتروني غير صحيح")
    .normalizeEmail()
    .toLowerCase(),
];

const changePasswordValidation = [
  body("currentPassword").notEmpty().withMessage("كلمة المرور الحالية مطلوبة"),

  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل")
    .matches(/^(?=.*[a-zA-Z])(?=.*\d)/)
    .withMessage("كلمة المرور الجديدة يجب أن تحتوي على أحرف وأرقام"),
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
