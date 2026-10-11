/**
 * FinMate Node.js REST API Server.
 * Document-oriented microservice for AI Conversations and Financial Notes.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB, isMongoConnected } = require('./db');
const authMiddleware = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler');

const notesRouter = require('./routes/notes');
const conversationsRouter = require('./routes/conversations');

const app = express();
const PORT = process.env.NODE_PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// Health & System Info
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'finmate-node-service',
    engine: 'Express.js',
    database: isMongoConnected() ? 'MongoDB (Mongoose)' : 'Embedded JSON Document Store',
    mongoConnected: isMongoConnected(),
    timestamp: new Date().toISOString(),
  });
});

// Protected Document API Routes
app.use('/api/notes', authMiddleware, notesRouter);
app.use('/api/conversations', authMiddleware, conversationsRouter);

// Centralized Error Handling
app.use(errorHandler);

// Start server
async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`[NodeService] FinMate Node.js Document Service listening on http://localhost:${PORT}`);
  });
}

if (require.main === module) {
  start();
}

module.exports = app;
