/**
 * AI Conversations Express Router.
 * Full CRUD connected to MongoDB / Document Store.
 */

const express = require('express');
const router = express.Router();
const Conversation = require('../models/Conversation');
const { validateConversationPayload } = require('../middleware/validation');

// GET /api/conversations - List conversations for current user
router.get('/', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const conversations = await Conversation.find({ userId });
    res.json({
      success: true,
      data: conversations,
      count: conversations.length,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/conversations - Create a new conversation
router.post('/', validateConversationPayload, async (req, res, next) => {
  try {
    const { title, messages = [] } = req.body;
    const conversationId = 'conv_' + Date.now();
    const conversation = await Conversation.create({
      userId: req.user.id,
      conversationId,
      title: title.trim(),
      messages,
    });

    res.status(201).json({
      success: true,
      data: conversation,
      message: 'Conversation created successfully',
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/conversations/:id - Get conversation by ID
router.get('/:id', async (req, res, next) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation || conversation.userId !== req.user.id) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Conversation not found or access denied.' },
      });
    }

    res.json({ success: true, data: conversation });
  } catch (err) {
    next(err);
  }
});

// PUT /api/conversations/:id - Append message or update title
router.put('/:id', async (req, res, next) => {
  try {
    const existing = await Conversation.findById(req.params.id);
    if (!existing || existing.userId !== req.user.id) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Conversation not found or access denied.' },
      });
    }

    const { title, newMessage } = req.body;
    const updateData = {};
    if (title) updateData.title = title.trim();

    if (newMessage && newMessage.role && newMessage.content) {
      const messages = existing.messages ? [...existing.messages] : [];
      messages.push({
        role: newMessage.role,
        content: newMessage.content,
        timestamp: new Date(),
      });
      updateData.messages = messages;
    }

    const updated = await Conversation.findByIdAndUpdate(req.params.id, updateData);
    res.json({
      success: true,
      data: updated,
      message: 'Conversation updated successfully',
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/conversations/:id - Delete conversation
router.delete('/:id', async (req, res, next) => {
  try {
    const existing = await Conversation.findById(req.params.id);
    if (!existing || existing.userId !== req.user.id) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Conversation not found or access denied.' },
      });
    }

    await Conversation.findByIdAndDelete(req.params.id);
    res.json({
      success: true,
      message: 'Conversation deleted successfully',
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
