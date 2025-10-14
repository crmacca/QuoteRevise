// LocalStorage keys
const TEXTS_KEY = 'quote-revision-texts';
const ANALYTICS_KEY = 'quote-revision-analytics';

// Get all texts
export const getTexts = () => {
  const texts = localStorage.getItem(TEXTS_KEY);
  return texts ? JSON.parse(texts) : [];
};

// Save all texts
export const saveTexts = (texts) => {
  localStorage.setItem(TEXTS_KEY, JSON.stringify(texts));
};

// Get a single text by ID
export const getText = (id) => {
  const texts = getTexts();
  return texts.find(text => text.id === id);
};

// Create a new text
export const createText = (name) => {
  const texts = getTexts();
  const newText = {
    id: Date.now().toString(),
    name,
    chapters: [],
    createdAt: new Date().toISOString(),
  };
  texts.push(newText);
  saveTexts(texts);
  return newText;
};

// Update a text
export const updateText = (id, updates) => {
  const texts = getTexts();
  const index = texts.findIndex(text => text.id === id);
  if (index !== -1) {
    texts[index] = { ...texts[index], ...updates };
    saveTexts(texts);
    return texts[index];
  }
  return null;
};

// Delete a text
export const deleteText = (id) => {
  const texts = getTexts();
  const filtered = texts.filter(text => text.id !== id);
  saveTexts(filtered);
};

// Reorder texts
export const reorderTexts = (reorderedTexts) => {
  saveTexts(reorderedTexts);
};

// Add a chapter to a text
export const addChapter = (textId, chapterName) => {
  const text = getText(textId);
  if (text) {
    const newChapter = {
      id: Date.now().toString(),
      name: chapterName,
      quotes: [],
    };
    text.chapters.push(newChapter);
    updateText(textId, text);
    return newChapter;
  }
  return null;
};

// Delete a chapter
export const deleteChapter = (textId, chapterId) => {
  const text = getText(textId);
  if (text) {
    text.chapters = text.chapters.filter(chapter => chapter.id !== chapterId);
    updateText(textId, text);
  }
};

// Add a quote to a chapter
export const addQuote = (textId, chapterId, quoteText) => {
  const text = getText(textId);
  if (text) {
    const chapter = text.chapters.find(ch => ch.id === chapterId);
    if (chapter) {
      const newQuote = {
        id: Date.now().toString(),
        text: quoteText,
        createdAt: new Date().toISOString(),
      };
      chapter.quotes.push(newQuote);
      updateText(textId, text);
      return newQuote;
    }
  }
  return null;
};

// Update a quote
export const updateQuote = (textId, chapterId, quoteId, quoteText) => {
  const text = getText(textId);
  if (text) {
    const chapter = text.chapters.find(ch => ch.id === chapterId);
    if (chapter) {
      const quote = chapter.quotes.find(q => q.id === quoteId);
      if (quote) {
        quote.text = quoteText;
        updateText(textId, text);
        return quote;
      }
    }
  }
  return null;
};

// Delete a quote
export const deleteQuote = (textId, chapterId, quoteId) => {
  const text = getText(textId);
  if (text) {
    const chapter = text.chapters.find(ch => ch.id === chapterId);
    if (chapter) {
      chapter.quotes = chapter.quotes.filter(q => q.id !== quoteId);
      updateText(textId, text);
    }
  }
};

// Analytics functions
export const getAnalytics = () => {
  const analytics = localStorage.getItem(ANALYTICS_KEY);
  return analytics ? JSON.parse(analytics) : [];
};

export const saveAttempt = (textId, chapterId, quoteId, attempt) => {
  const analytics = getAnalytics();
  
  const attemptRecord = {
    id: Date.now().toString(),
    textId,
    chapterId,
    quoteId,
    timestamp: new Date().toISOString(),
    usedHints: attempt.usedHints,
    totalWords: attempt.totalWords,
    attemptedWords: attempt.attemptedWords,
    correctWords: attempt.correctWords,
    results: attempt.results, // Array of {word, input, correct, fuzzyMatch}
  };
  
  analytics.push(attemptRecord);
  localStorage.setItem(ANALYTICS_KEY, JSON.stringify(analytics));
};

export const getTextAnalytics = (textId) => {
  const analytics = getAnalytics();
  return analytics.filter(a => a.textId === textId);
};