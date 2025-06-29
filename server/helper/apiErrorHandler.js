const apiErrorhandler = (err, req, res, next) => {
  console.error('API Error:', {
    path: req.path,
    method: req.method,
    error: err.message,
    stack: err.stack
  });

  // Handle API-specific errors
  if (err.isApiError) {
    res.status(err.responseCode).json({
      responseCode: err.responseCode,
      responseMessage: err.responseMessage,
    });
    return;
  }

  // Handle validation errors
  if (err.message === "Validation error") {
    res.status(400).json({
      responseCode: 400,
      responseMessage: err.original ? err.original.message : "Validation failed",
      errors: err.errors || []
    });
    return;
  }

  // Handle MongoDB errors
  if (err.name === 'MongoError' || err.name === 'MongoServerError') {
    if (err.code === 13) {
      res.status(500).json({
        responseCode: 500,
        responseMessage: "Database authentication failed. Please try again later.",
      });
      return;
    }
  }

  // Handle email errors
  if (err.message && err.message.includes('Failed to send OTP email')) {
    res.status(500).json({
      responseCode: 500,
      responseMessage: "Failed to send verification email. Please try again later.",
    });
    return;
  }

  // Handle all other errors
  res.status(err.code || 500).json({
    responseCode: err.code || 500,
    responseMessage: process.env.NODE_ENV === 'production' 
      ? 'An unexpected error occurred. Please try again later.'
      : err.message || 'Internal server error',
  });
  return;
};

export default apiErrorhandler;
