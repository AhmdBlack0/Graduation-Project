// 404 Not Found middleware
export const notFound = (req, res, next) => {
  const error = new Error(`المسار غير موجود - ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: error.message,
  });
};
