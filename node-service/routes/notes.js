/**
 * Financial Notes Express Router.
 * Full CRUD connected to MongoDB / Document Store.
 */

const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const { validateNotePayload } = require('../middleware/validation');

// GET /api/notes - List notes for current user
router.get('/', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { search, tag } = req.query;
    let notes = await Note.find({ userId });

    if (search) {
      const q = search.toLowerCase();
      notes = notes.filter((n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q));
    }
    if (tag) {
      notes = notes.filter((n) => n.tags && n.tags.includes(tag));
    }

    res.json({
      success: true,
      data: notes,
      count: notes.length,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/notes - Create a new note
router.post('/', validateNotePayload, async (req, res, next) => {
  try {
    const { title, content, tags = [], pinned = false, color = '#F4F4F0' } = req.body;
    const note = await Note.create({
      userId: req.user.id,
      title: title.trim(),
      content: content.trim(),
      tags: Array.isArray(tags) ? tags : [],
      pinned: Boolean(pinned),
      color,
    });

    res.status(201).json({
      success: true,
      data: note,
      message: 'Note created successfully',
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/notes/:id - Get note by ID
router.get('/:id', async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note || note.userId !== req.user.id) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Note not found or access denied.' },
      });
    }

    res.json({ success: true, data: note });
  } catch (err) {
    next(err);
  }
});

// PUT /api/notes/:id - Update note
router.put('/:id', async (req, res, next) => {
  try {
    const existing = await Note.findById(req.params.id);
    if (!existing || existing.userId !== req.user.id) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Note not found or access denied.' },
      });
    }

    const updateData = {};
    if (req.body.title !== undefined) updateData.title = req.body.title.trim();
    if (req.body.content !== undefined) updateData.content = req.body.content.trim();
    if (req.body.tags !== undefined) updateData.tags = req.body.tags;
    if (req.body.pinned !== undefined) updateData.pinned = req.body.pinned;
    if (req.body.color !== undefined) updateData.color = req.body.color;

    const updated = await Note.findByIdAndUpdate(req.params.id, updateData);
    res.json({
      success: true,
      data: updated,
      message: 'Note updated successfully',
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/notes/:id - Delete note
router.delete('/:id', async (req, res, next) => {
  try {
    const existing = await Note.findById(req.params.id);
    if (!existing || existing.userId !== req.user.id) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Note not found or access denied.' },
      });
    }

    await Note.findByIdAndDelete(req.params.id);
    res.json({
      success: true,
      message: 'Note deleted successfully',
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
