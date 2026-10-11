/**
 * Notes & Financial Knowledge Base
 * Powered by React, Node.js Express microservice, and Document Store.
 */

import React, { useEffect, useState } from 'react';
import {
  Plus,
  Search,
  Pin,
  Trash2,
  Edit2,
  FileText,
  MessageSquare,
  X,
  FolderOpen,
} from 'lucide-react';
import { Modal } from '../components/common/Modal';
import { api } from '../services/api';
import { ConversationItem, NoteItem } from '../types';
import { formatDate } from '../utils/formatters';

const PRESET_COLORS = [
  { name: 'Default', value: '#FFFFFF', border: '#E2E8F0' },
  { name: 'Warm Amber', value: '#FEF9C3', border: '#FDE047' },
  { name: 'Mint Soft', value: '#ECFDF5', border: '#A7F3D0' },
  { name: 'Sky Soft', value: '#EFF6FF', border: '#BFDBFE' },
  { name: 'Lavender', value: '#F5F3FF', border: '#DDD6FE' },
  { name: 'Rose Soft', value: '#FFF1F2', border: '#FECDD3' },
];

export const NotesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'notes' | 'conversations'>('notes');

  // Notes state
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [notesSearch, setNotesSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [filterPinnedOnly, setFilterPinnedOnly] = useState(false);

  // Conversations state
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [loadingConv, setLoadingConv] = useState(true);

  // Note Modal state
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<NoteItem | null>(null);
  const [noteForm, setNoteForm] = useState({
    title: '',
    content: '',
    tags: '',
    pinned: false,
    color: '#FFFFFF',
  });
  const [noteFormError, setNoteFormError] = useState<string | null>(null);
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);

  // Conversation Modal state
  const [isConvModalOpen, setIsConvModalOpen] = useState(false);
  const [convTitle, setConvTitle] = useState('');
  const [deletingConvId, setDeletingConvId] = useState<string | null>(null);

  const fetchNotes = async () => {
    setLoadingNotes(true);
    try {
      const res = await api.getNotes({
        search: notesSearch || undefined,
        tag: selectedTag || undefined,
      });
      setNotes(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingNotes(false);
    }
  };

  const fetchConversations = async () => {
    setLoadingConv(true);
    try {
      const res = await api.getConversations();
      setConversations(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingConv(false);
    }
  };

  useEffect(() => {
    fetchNotes();
    fetchConversations();
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [notesSearch, selectedTag]);

  // Note Handlers
  const handleOpenAddNote = () => {
    setEditingNote(null);
    setNoteForm({
      title: '',
      content: '',
      tags: '',
      pinned: false,
      color: '#FFFFFF',
    });
    setNoteFormError(null);
    setIsNoteModalOpen(true);
  };

  const handleOpenEditNote = (note: NoteItem) => {
    setEditingNote(note);
    setNoteForm({
      title: note.title,
      content: note.content,
      tags: (note.tags || []).join(', '),
      pinned: Boolean(note.pinned),
      color: note.color || '#FFFFFF',
    });
    setNoteFormError(null);
    setIsNoteModalOpen(true);
  };

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    setNoteFormError(null);
    if (!noteForm.title.trim()) {
      setNoteFormError('Title is required.');
      return;
    }

    const tagsArray = noteForm.tags
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    try {
      const noteId = editingNote?._id || editingNote?.id;
      if (editingNote && noteId) {
        await api.updateNote(noteId, {
          title: noteForm.title.trim(),
          content: noteForm.content.trim(),
          tags: tagsArray,
          pinned: noteForm.pinned,
          color: noteForm.color,
        });
      } else {
        await api.createNote({
          title: noteForm.title.trim(),
          content: noteForm.content.trim(),
          tags: tagsArray,
          pinned: noteForm.pinned,
          color: noteForm.color,
        });
      }
      setIsNoteModalOpen(false);
      fetchNotes();
    } catch (err: any) {
      setNoteFormError(err.message || 'Error saving note to workspace.');
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      await api.deleteNote(id);
      setDeletingNoteId(null);
      fetchNotes();
    } catch (err) {
      console.error(err);
    }
  };

  const handleTogglePin = async (note: NoteItem) => {
    const id = note._id || note.id;
    if (!id) return;
    try {
      await api.updateNote(id, { pinned: !note.pinned });
      fetchNotes();
    } catch (err) {
      console.error(err);
    }
  };

  // Conversation Handlers
  const handleCreateConversation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!convTitle.trim()) return;
    try {
      await api.createConversation({
        title: convTitle.trim(),
        messages: [
          {
            role: 'assistant',
            content: 'Conversation initialized. What financial strategy would you like to review?',
          },
        ],
      });
      setIsConvModalOpen(false);
      setConvTitle('');
      fetchConversations();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteConversation = async (id: string) => {
    try {
      await api.deleteConversation(id);
      setDeletingConvId(null);
      fetchConversations();
    } catch (err) {
      console.error(err);
    }
  };

  // Extract all unique tags
  const allTags = Array.from(new Set(notes.flatMap((n) => n.tags || [])));

  // Filter notes
  const displayedNotes = notes.filter((n) => {
    if (filterPinnedOnly && !n.pinned) return false;
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-200/80 gap-4">
        <div>
          <h1 className="font-heading-tech text-2xl sm:text-3xl font-extrabold text-[#1E1B4B]">
            Notes
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Tab Pill Toggle */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/70 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('notes')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'notes'
                  ? 'bg-white text-[#1E1B4B] shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Notes ({notes.length})
            </button>
            <button
              onClick={() => setActiveTab('conversations')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'conversations'
                  ? 'bg-white text-[#1E1B4B] shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Saved Chats ({conversations.length})
            </button>
          </div>

          <button
            onClick={activeTab === 'notes' ? handleOpenAddNote : () => setIsConvModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-[#5E4AE3] hover:bg-[#4D38D0] text-white font-bold text-xs uppercase flex items-center gap-2 shadow-sm shadow-purple-500/20 active:scale-[0.98] transition-all shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>{activeTab === 'notes' ? 'NEW NOTE' : 'NEW CHAT'}</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Financial Notes */}
      {activeTab === 'notes' && (
        <div className="space-y-5">
          {/* Search & Tag Filter Bar */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="flex-1 flex items-center bg-slate-50 rounded-xl px-3 py-2 border border-slate-200/60 focus-within:border-purple-500 focus-within:bg-white transition-all">
              <Search className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
              <input
                type="text"
                value={notesSearch}
                onChange={(e) => setNotesSearch(e.target.value)}
                placeholder="Search notes by title, tag, or content..."
                className="w-full bg-transparent outline-none text-slate-800 text-xs font-medium placeholder-slate-400"
              />
              {notesSearch && (
                <button
                  onClick={() => setNotesSearch('')}
                  className="text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              <button
                onClick={() => {
                  setSelectedTag(null);
                  setFilterPinnedOnly(false);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedTag === null && !filterPinnedOnly
                    ? 'bg-[#1E1B4B] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterPinnedOnly(!filterPinnedOnly)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                  filterPinnedOnly
                    ? 'bg-amber-500 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Pin className={`w-3 h-3 ${filterPinnedOnly ? 'fill-current' : ''}`} />
                <span>Pinned</span>
              </button>

              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    setSelectedTag(tag === selectedTag ? null : tag);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedTag === tag
                      ? 'bg-[#5E4AE3] text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>

          {/* Notes Grid */}
          {loadingNotes ? (
            <div className="py-16 text-center text-slate-400 text-sm">
              Loading your notes...
            </div>
          ) : displayedNotes.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6 stroke-[1.8]" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No notes found</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto mb-5">
                Capture your tax-saving strategies, investment ideas, budget rules, or meeting takeaways.
              </p>
              <button
                onClick={handleOpenAddNote}
                className="px-4 py-2 rounded-xl bg-[#5E4AE3] hover:bg-[#4D38D0] text-white font-bold text-xs inline-flex items-center gap-2 shadow-sm transition-all"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Create First Note</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {displayedNotes.map((note) => {
                const noteId = note._id || note.id || '';
                const cardColor = note.color && note.color !== '#FFFFFF' ? note.color : '#FFFFFF';
                return (
                  <div
                    key={noteId}
                    className="rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between group relative"
                    style={{ backgroundColor: cardColor }}
                  >
                    <div>
                      {/* Note Header */}
                      <div className="flex items-start justify-between gap-2 pb-2 mb-2 border-b border-slate-200/60">
                        <h3 className="text-sm font-bold text-[#1E1B4B] leading-snug line-clamp-2">
                          {note.title}
                        </h3>
                        <button
                          onClick={() => handleTogglePin(note)}
                          className={`p-1 rounded-lg transition-colors shrink-0 ${
                            note.pinned
                              ? 'text-amber-500 hover:text-amber-600'
                              : 'text-slate-300 hover:text-slate-500'
                          }`}
                          title={note.pinned ? 'Unpin note' : 'Pin note'}
                        >
                          <Pin className={`w-4 h-4 ${note.pinned ? 'fill-current' : ''}`} />
                        </button>
                      </div>

                      {/* Content Preview */}
                      <p className="text-xs text-slate-600 whitespace-pre-line line-clamp-5 leading-relaxed mb-4 font-normal">
                        {note.content}
                      </p>

                      {/* Tag Badges */}
                      {note.tags && note.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {note.tags.map((t) => (
                            <span
                              key={t}
                              className="px-2 py-0.5 rounded-md bg-white/80 border border-slate-200/80 text-[10px] font-semibold text-slate-600 shadow-2xs"
                            >
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-200/60 text-[11px] text-slate-400 font-medium">
                      <span>{formatDate(note.updatedAt || note.createdAt || new Date().toISOString())}</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditNote(note)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-[#5E4AE3] hover:bg-slate-100 transition-colors"
                          title="Edit note"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingNoteId(noteId)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete note"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Saved Chats */}
      {activeTab === 'conversations' && (
        <div className="space-y-4">
          {loadingConv ? (
            <div className="py-16 text-center text-slate-400 text-sm">Loading chats...</div>
          ) : conversations.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-3">
                <MessageSquare className="w-6 h-6 stroke-[1.8]" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No saved chat sessions</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto mb-5">
                Saved conversations with the Financial Advisor appear here.
              </p>
              <button
                onClick={() => setIsConvModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-[#5E4AE3] hover:bg-[#4D38D0] text-white font-bold text-xs inline-flex items-center gap-2 shadow-sm transition-all"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Start New Session</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {conversations.map((c) => {
                const convId = c._id || c.id || '';
                return (
                  <div
                    key={convId}
                    className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-slate-300 transition-all flex items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#1E1B4B]">
                          {c.title}
                        </h4>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {c.messages?.length || 0} messages • Created{' '}
                          {formatDate(c.createdAt || new Date().toISOString())}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setDeletingConvId(convId)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete chat session"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Note Modal */}
      <Modal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        title={editingNote ? 'Edit Note' : 'Create Note'}
      >
        <form onSubmit={handleSaveNote} className="space-y-4">
          {noteFormError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold">
              {noteFormError}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Note Title</label>
            <input
              type="text"
              required
              value={noteForm.title}
              onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
              placeholder="e.g. Tax-Saving ELSS Strategy, Emergency Target"
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 transition-all font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Note Content</label>
            <textarea
              rows={5}
              required
              value={noteForm.content}
              onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
              placeholder="Enter strategy observations, budget rules, or planning notes..."
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 transition-all font-medium resize-none leading-relaxed"
            ></textarea>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={noteForm.tags}
              onChange={(e) => setNoteForm({ ...noteForm, tags: e.target.value })}
              placeholder="strategy, buffer, taxes"
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 transition-all font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Card Color</label>
            <div className="flex items-center gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  type="button"
                  key={c.value}
                  onClick={() => setNoteForm({ ...noteForm, color: c.value })}
                  className={`w-7 h-7 rounded-full border-2 transition-transform ${
                    noteForm.color === c.value ? 'scale-110 ring-2 ring-purple-500' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.value, borderColor: c.border }}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2.5 pt-1">
            <input
              type="checkbox"
              id="pinnedCheck"
              checked={noteForm.pinned}
              onChange={(e) => setNoteForm({ ...noteForm, pinned: e.target.checked })}
              className="w-4 h-4 rounded text-purple-600 accent-[#5E4AE3] focus:ring-purple-500 cursor-pointer"
            />
            <label htmlFor="pinnedCheck" className="text-xs font-semibold text-slate-700 cursor-pointer">
              Pin this note to the top
            </label>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsNoteModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#5E4AE3] hover:bg-[#4D38D0] text-white font-bold text-xs shadow-sm transition-all"
            >
              Save Note
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Note Modal */}
      {deletingNoteId && (
        <Modal
          isOpen={true}
          onClose={() => setDeletingNoteId(null)}
          title="Delete Note"
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600 leading-relaxed">
              Are you sure you want to delete this note? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletingNoteId(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteNote(deletingNoteId)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm"
              >
                Delete Note
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* New Conversation Modal */}
      <Modal
        isOpen={isConvModalOpen}
        onClose={() => setIsConvModalOpen(false)}
        title="Start New Session"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreateConversation} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Session Title</label>
            <input
              type="text"
              required
              value={convTitle}
              onChange={(e) => setConvTitle(e.target.value)}
              placeholder="e.g. Q4 Asset Allocation & Rebalancing"
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-purple-500 font-medium"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsConvModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#5E4AE3] hover:bg-[#4D38D0] text-white font-bold text-xs shadow-sm"
            >
              Start Session
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Conv Modal */}
      {deletingConvId && (
        <Modal
          isOpen={true}
          onClose={() => setDeletingConvId(null)}
          title="Delete Chat Session"
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600 leading-relaxed">
              Are you sure you want to delete this chat session? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletingConvId(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteConversation(deletingConvId)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm"
              >
                Delete Session
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
