/**
 * Database connection module for FinMate Node.js Service.
 * Connects to MongoDB via Mongoose with auto-reconnect and persistent fallback.
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

let isMongoConnected = false;

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/finmate';

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 2000,
    });
    isMongoConnected = true;
    console.log(`[MongoService] Connected to MongoDB at: ${MONGODB_URI}`);
  } catch (err) {
    isMongoConnected = false;
    console.log(`[MongoService] MongoDB connection unavailable (${err.message}). Using persistent JSON document store fallback.`);
  }
}

// Resilient Fallback Document Storage in case standalone Mongo isn't running
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

class FallbackStore {
  constructor(collectionName) {
    this.filePath = path.join(DATA_DIR, `${collectionName}.json`);
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify([]));
    }
  }

  _read() {
    try {
      const data = fs.readFileSync(this.filePath, 'utf-8');
      return JSON.parse(data || '[]');
    } catch {
      return [];
    }
  }

  _write(data) {
    fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
  }

  async find(filter = {}) {
    const list = this._read();
    return list.filter((item) => {
      for (const [k, v] of Object.entries(filter)) {
        if (item[k] !== v) return false;
      }
      return true;
    });
  }

  async findById(id) {
    const list = this._read();
    return list.find((item) => item._id === id || item.id === id) || null;
  }

  async create(doc) {
    const list = this._read();
    const newDoc = {
      _id: doc._id || 'doc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      ...doc,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    list.push(newDoc);
    this._write(list);
    return newDoc;
  }

  async findByIdAndUpdate(id, update, options = {}) {
    const list = this._read();
    const idx = list.findIndex((item) => item._id === id || item.id === id);
    if (idx === -1) return null;
    list[idx] = {
      ...list[idx],
      ...update,
      updatedAt: new Date().toISOString(),
    };
    this._write(list);
    return list[idx];
  }

  async findByIdAndDelete(id) {
    const list = this._read();
    const idx = list.findIndex((item) => item._id === id || item.id === id);
    if (idx === -1) return null;
    const removed = list.splice(idx, 1)[0];
    this._write(list);
    return removed;
  }
}

module.exports = {
  connectDB,
  isMongoConnected: () => isMongoConnected,
  FallbackStore,
};
