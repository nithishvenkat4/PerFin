/**
 * Request Validation Middleware for Node.js Service.
 */

function validateNotePayload(req, res, next) {
  const { title, content } = req.body;
  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Field "title" is required and must be a non-empty string.',
      },
    });
  }
  if (!content || typeof content !== 'string') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Field "content" is required and must be a string.',
      },
    });
  }
  next();
}

function validateConversationPayload(req, res, next) {
  const { title } = req.body;
  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Field "title" is required and must be a non-empty string.',
      },
    });
  }
  next();
}

module.exports = {
  validateNotePayload,
  validateConversationPayload,
};
