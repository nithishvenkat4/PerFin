/**
 * Mongoose Schema for Financial Notes.
 */

const mongoose = require('mongoose');
const { FallbackStore, isMongoConnected } = require('../db');

const NoteSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    tags: [{ type: String }],
    pinned: { type: Boolean, default: false },
    color: { type: String, default: '#F4F4F0' },
  },
  { timestamps: true }
);

const MongooseNote = mongoose.models.Note || mongoose.model('Note', NoteSchema);
const fallbackStore = new FallbackStore('financial_notes');

class NoteModel {
  static async find(filter = {}) {
    if (isMongoConnected()) {
      return MongooseNote.find(filter).sort({ pinned: -1, updatedAt: -1 });
    }
    const results = await fallbackStore.find(filter);
    return results.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
  }

  static async findById(id) {
    if (isMongoConnected()) {
      return MongooseNote.findById(id);
    }
    return fallbackStore.findById(id);
  }

  static async create(data) {
    if (isMongoConnected()) {
      return MongooseNote.create(data);
    }
    return fallbackStore.create(data);
  }

  static async findByIdAndUpdate(id, data, options = {}) {
    if (isMongoConnected()) {
      return MongooseNote.findByIdAndUpdate(id, data, { new: true, ...options });
    }
    return fallbackStore.findByIdAndUpdate(id, data, options);
  }

  static async findByIdAndDelete(id) {
    if (isMongoConnected()) {
      return MongooseNote.findByIdAndDelete(id);
    }
    return fallbackStore.findByIdAndDelete(id);
  }
}

module.exports = NoteModel;
