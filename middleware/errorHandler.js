// Global error handler middleware
export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for debugging
  console.error("Error:", err);

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    const message = "المورد غير موجود";
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field} موجود بالفعل`;
    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
    error = { message, statusCode: 400 };
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    const message = "توكن غير صحيح";
    error = { message, statusCode: 401 };
  }

  if (err.name === "TokenExpiredError") {
    const message = "انتهت صلاحية التوكن";
    error = { message, statusCode: 401 };
  }

  // Multer errors
  if (err.code === "LIMIT_FILE_SIZE") {
    const message = "حجم الملف كبير جداً";
    error = { message, statusCode: 400 };
  }

  if (err.code === "LIMIT_FILE_COUNT") {
    const message = "تم تجاوز الحد الأقصى لعدد الملفات";
    error = { message, statusCode: 400 };
  }

  // Cloudinary errors
  if (err.message && err.message.includes("Cloudinary")) {
    const message = "خطأ في رفع الملف";
    error = { message, statusCode: 500 };
  }

  // Stripe errors
  if (err.type && err.type.startsWith("Stripe")) {
    const message = "خطأ في معالجة الدفع";
    error = { message, statusCode: 400 };
  }

  // Default error response
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "خطأ في الخادم",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

// Async error handler wrapper
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Custom error class
export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Validation error handler
export const handleValidationError = (errors) => {
  const errorMessages = errors.map((error) => ({
    field: error.path,
    message: error.message,
    value: error.value,
  }));

  return {
    message: "بيانات غير صحيحة",
    errors: errorMessages,
  };
};

// Rate limit error handler
export const handleRateLimitError = (req, res) => {
  res.status(429).json({
    success: false,
    message: "تم تجاوز الحد الأقصى للطلبات، يرجى المحاولة لاحقاً",
    retryAfter: Math.round(req.rateLimit.resetTime / 1000),
  });
};
