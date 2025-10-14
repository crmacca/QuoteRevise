// Calculate analytics for a text
export const calculateTextAnalytics = (textId, texts, analyticsData) => {
  const text = texts.find(t => t.id === textId);
  if (!text) return null;
  
  const textAttempts = analyticsData.filter(a => a.textId === textId);
  
  // Overall stats
  const withHints = textAttempts.filter(a => a.usedHints);
  const withoutHints = textAttempts.filter(a => !a.usedHints);
  
  const calculateStats = (attempts) => {
    if (attempts.length === 0) return null;
    
    let totalAttempted = 0;
    let totalCorrect = 0;
    let totalWords = 0;
    
    attempts.forEach(attempt => {
      totalAttempted += attempt.attemptedWords;
      totalCorrect += attempt.correctWords;
      totalWords += attempt.totalWords;
    });
    
    const accuracy = totalAttempted > 0 ? (totalCorrect / totalAttempted) * 100 : 0;
    const coverage = totalWords > 0 ? (totalAttempted / totalWords) * 100 : 0;
    
    return {
      attempts: attempts.length,
      accuracy: accuracy.toFixed(1),
      coverage: coverage.toFixed(1),
      totalWords,
      totalAttempted,
      totalCorrect,
    };
  };
  
  // Chapter-level stats
  const chapterStats = text.chapters.map(chapter => {
    const chapterAttempts = textAttempts.filter(a => a.chapterId === chapter.id);
    const withHintsChapter = chapterAttempts.filter(a => a.usedHints);
    const withoutHintsChapter = chapterAttempts.filter(a => !a.usedHints);
    
    return {
      chapterId: chapter.id,
      chapterName: chapter.name,
      withHints: calculateStats(withHintsChapter),
      withoutHints: calculateStats(withoutHintsChapter),
      all: calculateStats(chapterAttempts),
    };
  });
  
  // Quote-level stats
  const quoteStats = [];
  text.chapters.forEach(chapter => {
    chapter.quotes.forEach(quote => {
      const quoteAttempts = textAttempts.filter(a => a.quoteId === quote.id);
      const withHintsQuote = quoteAttempts.filter(a => a.usedHints);
      const withoutHintsQuote = quoteAttempts.filter(a => !a.usedHints);
      
      quoteStats.push({
        quoteId: quote.id,
        chapterId: chapter.id,
        chapterName: chapter.name,
        quoteText: quote.text,
        withHints: calculateStats(withHintsQuote),
        withoutHints: calculateStats(withoutHintsQuote),
        all: calculateStats(quoteAttempts),
      });
    });
  });
  
  return {
    textId,
    textName: text.name,
    overall: {
      withHints: calculateStats(withHints),
      withoutHints: calculateStats(withoutHints),
      all: calculateStats(textAttempts),
    },
    chapters: chapterStats,
    quotes: quoteStats,
  };
};