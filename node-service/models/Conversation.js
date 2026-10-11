/**
 * Mongoose Schema for AI Conversations.
 */

const mongoose = require('mongoose');
const { FallbackStore, isMongoConnected } = require('../db');

const MessageSchema = new mongoose.Schema({
  role: { type: String, required: true, enum: ['user', 'assistant', 'system'] },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const ConversationSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    conversationId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    messages: [MessageSchema],
  },
  { timestamps: true }
);

const MongooseConversation = mongoose.models.Conversation || mongoose.model('Conversation', ConversationSchema);
const fallbackStore = new FallbackStore('ai_conversations');

class ConversationModel {
  static async find(filter = {}) {
    if (isMongoConnected()) {
      return MongooseConversation.find(filter).sort({ updatedAt: -1 });
    }
    return fallbackStore.find(filter);
  }

  static async findById(id) {
    if (isMongoConnected()) {
      return MongooseConversation.findById(id);
    }
    return fallbackStore.findById(id);
  }

  static async create(data) {
    if (isMongoConnected()) {
      return MongooseConversation.create(data);
    }
    return fallbackStore.create(data);
  }

  static async findByIdAndUpdate(id, data, options = {}) {
    if (isMongoConnected()) {
      return MongooseConversation.findByIdAndUpdate(id, data, { new: true, ...options });
    }
    return fallbackStore.findByIdAndUpdate(id, data, options);
  }

  static async findByIdAndDelete(id) {
    if (isMongoConnected()) {
      return MongooseConversation.findByIdAndDelete(id);
    }
    return fallbackStore.findByIdAndDelete(id);
  }
}

module.exports = ConversationModel;
