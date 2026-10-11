/**
 * Centralized JSON Error Handling Middleware for Node.js Service.
 */

function errorHandler(err, req, res, next) {
  console.error('[NodeService Error]', err);

  const status = err.status || 500;
  const code = err.code || 'INTERNAL_SERVER_ERROR';
  const message = err.message || 'An unexpected server error occurred.';

  res.status(status).json({
    success: false,
    error: {
      code,
      message,
    },
  });
}

module.exports = errorHandler;
