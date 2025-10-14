import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Edit2, Check, X, GripVertical } from 'lucide-react';
import {
  getText,
  updateText,
  addChapter,
  deleteChapter,
  addQuote,
  deleteQuote,
  updateQuote,
  deleteText
} from '../utils/storage';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Sortable Quote Card Component
const SortableQuoteCard = ({ quote, chapterId, onEdit, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: quote.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="quote-card flex-shrink-0 w-96 bg-white rounded-lg p-8 shadow-sm border-2 border-stone-200 hover:shadow-lg hover:border-orange-300 transition-all"
    >
      <div className="flex items-start gap-4 mb-6">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing mt-1 p-2 hover:bg-stone-100 rounded-md transition-colors touch-none flex-shrink-0"
        >
          <GripVertical className="w-5 h-5 text-stone-400" />
        </button>
        <p className="flex-1 text-base text-zinc-700 leading-loose">
          {quote.text}
        </p>
      </div>
      <div className="flex gap-3 ml-12">
        <button
          onClick={() => onEdit(quote)}
          className="flex-1 px-5 py-2.5 text-sm font-medium bg-stone-100 text-zinc-700 rounded-md hover:bg-stone-200 transition-colors border border-stone-300"
        >
          <Edit2 className="w-3.5 h-3.5 inline mr-2" />
          Edit
        </button>
        <button
          onClick={() => onDelete(chapterId, quote.id)}
          className="px-5 py-2.5 text-sm font-medium bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors border border-red-200"
        >
          <Trash2 className="w-3.5 h-3.5 inline" />
        </button>
      </div>
    </div>
  );
};

const TextEditor = ({ textId, onBack, onRevise }) => {
  const [text, setText] = useState(null);
  const [newChapterName, setNewChapterName] = useState('');
  const [showChapterInput, setShowChapterInput] = useState(false);
  const [editingChapter, setEditingChapter] = useState(null);
  const [editChapterName, setEditChapterName] = useState('');
  const [newQuote, setNewQuote] = useState({});
  const [editingQuote, setEditingQuote] = useState(null);
  const [editQuoteText, setEditQuoteText] = useState('');
  const [editQuoteChapter, setEditQuoteChapter] = useState(null);

  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    loadText();
  }, [textId]);

  const loadText = () => {
    const loadedText = getText(textId);
    setText(loadedText);
  };

  const handleAddChapter = () => {
    if (newChapterName.trim()) {
      addChapter(textId, newChapterName.trim());
      setNewChapterName('');
      setShowChapterInput(false);
      loadText();
    }
  };

  const handleDeleteChapter = (chapterId) => {
    const chapter = text.chapters.find(ch => ch.id === chapterId);
    if (window.confirm(`Delete "${chapter.name}" and all its quotes?`)) {
      deleteChapter(textId, chapterId);
      loadText();
    }
  };

  const handleAddQuote = (chapterId) => {
    const quoteText = newQuote[chapterId];
    if (quoteText && quoteText.trim()) {
      addQuote(textId, chapterId, quoteText.trim());
      setNewQuote({ ...newQuote, [chapterId]: '' });
      loadText();
    }
  };

  const handleDeleteQuote = (chapterId, quoteId) => {
    if (window.confirm('Delete this quote?')) {
      deleteQuote(textId, chapterId, quoteId);
      loadText();
    }
  };

  const handleEditChapter = (chapter) => {
    setEditingChapter(chapter.id);
    setEditChapterName(chapter.name);
  };

  const handleSaveChapter = () => {
    if (editChapterName.trim()) {
      const updatedText = { ...text };
      const chapter = updatedText.chapters.find(ch => ch.id === editingChapter);
      if (chapter) {
        chapter.name = editChapterName.trim();
        updateText(textId, updatedText);
        setEditingChapter(null);
        setEditChapterName('');
        loadText();
      }
    }
  };

  const handleEditQuote = (quote, chapterId) => {
    setEditingQuote(quote.id);
    setEditQuoteText(quote.text);
    setEditQuoteChapter(chapterId);
  };

  const handleSaveQuote = () => {
    if (editQuoteText.trim()) {
      updateQuote(textId, editQuoteChapter, editingQuote, editQuoteText.trim());
      setEditingQuote(null);
      setEditQuoteText('');
      setEditQuoteChapter(null);
      loadText();
    }
  };

  const handleDragEnd = (event, chapterId) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const updatedText = { ...text };
    const chapter = updatedText.chapters.find(ch => ch.id === chapterId);
    
    if (chapter) {
      const oldIndex = chapter.quotes.findIndex(q => q.id === active.id);
      const newIndex = chapter.quotes.findIndex(q => q.id === over.id);
      
      chapter.quotes = arrayMove(chapter.quotes, oldIndex, newIndex);
      updateText(textId, updatedText);
      loadText();
    }
  };

  if (!text) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <p className="text-zinc-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-white border-b border-stone-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-[1800px] mx-auto px-16 py-6">
            <div className="flex justify-between items-center">
                <button
                    onClick={onBack}
                    className="flex items-center gap-3 px-6 py-3 text-zinc-600 hover:text-zinc-900 hover:bg-stone-100 rounded-md transition-all border-2 border-stone-200"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span className="font-medium">Back to Texts</span>
                </button>
                
                <h1 className="text-3xl font-bold text-zinc-800">{text.name}</h1>

                <div className="flex items-center gap-3">
                    <button
                    onClick={() => {
                        if (window.confirm(`Delete "${text.name}" and all its content?`)) {
                        deleteText(textId);
                        onBack();
                        }
                    }}
                    className="px-6 py-3 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-all shadow-sm font-semibold border-2 border-red-200"
                    >
                    Delete Text
                    </button>
                    <button
                    onClick={() => onRevise(textId)}
                    className="px-8 py-3 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-all shadow-sm hover:shadow-md font-semibold border-2 border-orange-600"
                    >
                    Revise Text
                    </button>
                </div>
                </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1800px] mx-auto px-16 py-12">
        {/* Chapters */}
        <div className="space-y-12 flex flex-col gap-4">
          {text.chapters.map((chapter) => (
            <div key={chapter.id} className="bg-white rounded-lg shadow-sm border-2 border-stone-200 overflow-hidden">
              {/* Chapter Header */}
              <div className="px-10 py-6 bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 border-b-2 border-stone-200">
                {editingChapter === chapter.id ? (
                  <div className="flex items-center gap-4">
                    <input
                      type="text"
                      value={editChapterName}
                      onChange={(e) => setEditChapterName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveChapter();
                        if (e.key === 'Escape') setEditingChapter(null);
                      }}
                      className="flex-1 px-5 py-3 rounded-md border-2 border-orange-400 focus:border-orange-500 bg-white text-lg font-semibold"
                      autoFocus
                    />
                    <button
                      onClick={handleSaveChapter}
                      className="p-3 text-green-600 hover:bg-green-50 rounded-md transition-colors border border-green-300"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setEditingChapter(null)}
                      className="p-3 text-red-600 hover:bg-red-50 rounded-md transition-colors border border-red-300"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-zinc-800 mb-2">{chapter.name}</h2>
                      <p className="text-sm text-zinc-600 font-medium">
                        {chapter.quotes.length} {chapter.quotes.length === 1 ? 'quote' : 'quotes'}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleEditChapter(chapter)}
                        className="p-3 text-zinc-600 hover:bg-white rounded-md transition-colors border border-stone-300"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteChapter(chapter.id)}
                        className="p-3 text-red-600 hover:bg-red-50 rounded-md transition-colors border border-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Quotes Row */}
              <div className="p-10">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={(event) => handleDragEnd(event, chapter.id)}
                >
                  <SortableContext
                    items={chapter.quotes.map(q => q.id)}
                    strategy={horizontalListSortingStrategy}
                  >
                    <div className="flex gap-8 overflow-x-auto pb-6 quote-scroll">
                      {chapter.quotes.map((quote) => (
                        editingQuote === quote.id && editQuoteChapter === chapter.id ? (
                          <div
                            key={quote.id}
                            className="flex-shrink-0 w-96 bg-orange-50 rounded-lg p-8 border-2 border-orange-400"
                          >
                            <textarea
                              value={editQuoteText}
                              onChange={(e) => setEditQuoteText(e.target.value)}
                              className="w-full px-5 py-4 rounded-md border-2 border-orange-300 focus:border-orange-500 bg-white min-h-[160px] text-sm resize-none mb-4 leading-relaxed"
                              autoFocus
                            />
                            <div className="flex gap-3">
                              <button
                                onClick={handleSaveQuote}
                                className="flex-1 px-5 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-semibold border border-green-700"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => {
                                  setEditingQuote(null);
                                  setEditQuoteText('');
                                  setEditQuoteChapter(null);
                                }}
                                className="flex-1 px-5 py-3 bg-stone-200 text-zinc-700 rounded-md hover:bg-stone-300 transition-colors text-sm font-semibold border border-stone-300"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <SortableQuoteCard
                            key={quote.id}
                            quote={quote}
                            chapterId={chapter.id}
                            onEdit={(q) => handleEditQuote(q, chapter.id)}
                            onDelete={handleDeleteQuote}
                          />
                        )
                      ))}

                      {/* Add Quote Card */}
                      <div className="flex-shrink-0 w-96 bg-orange-50/60 border-2 border-dashed border-orange-400 rounded-lg p-8 hover:bg-orange-50 transition-colors">
                        <textarea
                          value={newQuote[chapter.id] || ''}
                          onChange={(e) => setNewQuote({ ...newQuote, [chapter.id]: e.target.value })}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.ctrlKey) {
                              handleAddQuote(chapter.id);
                            }
                          }}
                          placeholder="Add a new quote... (Ctrl+Enter to add)"
                          className="w-full px-5 py-4 rounded-md border-2 border-orange-300 focus:border-orange-400 bg-white/90 min-h-[160px] text-sm resize-none mb-4 leading-relaxed"
                        />
                        <button
                          onClick={() => handleAddQuote(chapter.id)}
                          disabled={!newQuote[chapter.id]?.trim()}
                          className="w-full px-5 py-3 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 border border-orange-600"
                        >
                          <Plus className="w-4 h-4" />
                          Add Quote
                        </button>
                      </div>
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
            </div>
          ))}
        </div>

        {/* Add Chapter */}
        <div className="mt-12">
          {showChapterInput ? (
            <div className="bg-white rounded-lg p-8 shadow-sm border-2 border-stone-200">
              <div className="flex gap-4">
                <input
                  type="text"
                  value={newChapterName}
                  onChange={(e) => setNewChapterName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddChapter();
                    if (e.key === 'Escape') {
                      setShowChapterInput(false);
                      setNewChapterName('');
                    }
                  }}
                  placeholder="Chapter name..."
                  className="flex-1 px-5 py-4 rounded-md border-2 border-stone-300 focus:border-orange-500 text-lg"
                  autoFocus
                />
                <button
                  onClick={handleAddChapter}
                  className="px-10 py-4 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors font-semibold border border-orange-600"
                >
                  Add Chapter
                </button>
                <button
                  onClick={() => {
                    setShowChapterInput(false);
                    setNewChapterName('');
                  }}
                  className="px-10 py-4 bg-stone-200 text-zinc-700 rounded-md hover:bg-stone-300 transition-colors font-semibold border border-stone-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowChapterInput(true)}
              className="w-full py-8 border-2 border-dashed border-stone-300 rounded-lg hover:border-orange-400 hover:bg-orange-50/30 transition-all flex items-center justify-center gap-4 group"
            >
              <div className="w-12 h-12 rounded-md bg-orange-100 flex items-center justify-center group-hover:bg-orange-200 transition-colors border border-orange-300">
                <Plus className="w-6 h-6 text-orange-600" />
              </div>
              <span className="font-semibold text-zinc-600 group-hover:text-orange-600 transition-colors text-lg">
                New Chapter
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TextEditor;