import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';
import PalmCard from './PalmCard';
import { getText } from '../utils/storage';
import { checkInputs } from '../utils/fuzzyMatch';
import { saveAttempt } from '../utils/storage';
import confetti from 'canvas-confetti';

const PracticeSession = ({ textId, settings, onBack, onComplete }) => {
  const [text, setText] = useState(null);
  const [quotes, setQuotes] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputs, setInputs] = useState([]);
  const [showBack, setShowBack] = useState(false);
  const [results, setResults] = useState([]);
  const [sessionResults, setSessionResults] = useState([]);
  const [skippedQuotes, setSkippedQuotes] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [usedHint, setUsedHint] = useState(false);
    const inputRefs = useRef([]);

  // Add this normalization function
  const normalizeText = (text) => {
    return text
      .replace(/…/g, '...') // Replace ellipsis with three dots
      .replace(/'/g, "'")    // Replace smart quotes with straight quotes
      .replace(/'/g, "'")
      .replace(/"/g, '"')
      .replace(/"/g, '"')
      .replace(/–/g, '-')    // Replace en-dash with hyphen
      .replace(/—/g, '--');  // Replace em-dash with double hyphen
  };
  const [quotesToRevise, setQuotesToRevise] = useState([]);

  useEffect(() => {
    loadQuotes();
  }, []);

  useEffect(() => {
    if (quotes.length > 0 && currentIndex < quotes.length) {
      const currentQuote = quotes[currentIndex];
      const wordCount = currentQuote.visibleWords.filter(w => !w.visible).length;
      setInputs(new Array(wordCount).fill(''));
      setShowBack(false);
      setResults([]);
      setUsedHint(false);
      inputRefs.current = [];
    }
  }, [currentIndex, quotes]);

  const loadQuotes = () => {
    const loadedText = getText(textId);
    setText(loadedText);

    const selectedChapters = loadedText.chapters.filter(ch =>
      settings.selectedChapters.includes(ch.id)
    );

    let allQuotes = [];
    selectedChapters.forEach(chapter => {
      chapter.quotes.forEach(quote => {
        allQuotes.push({
          ...quote,
          text: normalizeText(quote.text), // Normalize the text here
          chapterId: chapter.id,
          chapterName: chapter.name,
        });
      });
    });

    if (settings.order === 'randomized') {
      allQuotes = allQuotes.sort(() => Math.random() - 0.5);
    }

    const processedQuotes = allQuotes.map(quote => {
      // Split by any whitespace (spaces, tabs, newlines, etc.)
      const words = quote.text.split(/\s+/).filter(word => word.length > 0);
      const totalWords = words.length;
      let visibleWords = [];

      if (settings.redactionType === 'full') {
        visibleWords = words.map(word => ({ word, visible: false }));
      } else if (settings.redactionType === 'random') {
        const minVisible = Math.max(2, Math.floor(totalWords * 0.1));
        const maxVisible = Math.max(minVisible, totalWords - 2);
        const numVisible = Math.floor(Math.random() * (maxVisible - minVisible + 1)) + minVisible;
        
        const indices = Array.from({ length: totalWords }, (_, i) => i);
        const shuffled = indices.sort(() => Math.random() - 0.5);
        const visibleIndices = new Set(shuffled.slice(0, numVisible));
        
        visibleWords = words.map((word, i) => ({
          word,
          visible: visibleIndices.has(i),
        }));
      } else if (settings.redactionType === 'percentage') {
        const numVisible = Math.max(1, Math.floor(totalWords * (settings.percentage / 100)));
        
        const indices = Array.from({ length: totalWords }, (_, i) => i);
        const shuffled = indices.sort(() => Math.random() - 0.5);
        const visibleIndices = new Set(shuffled.slice(0, numVisible));
        
        visibleWords = words.map((word, i) => ({
          word,
          visible: visibleIndices.has(i),
        }));
      }

      return {
        ...quote,
        visibleWords,
        totalWords,
      };
    });

    setQuotes(processedQuotes);
  };

  const handleInputChange = (index, value) => {
    const newInputs = [...inputs];
    newInputs[index] = value;
    setInputs(newInputs);
  };

  const handleInputKeyDown = (index, e) => {
    if (e.key === ' ') {
      e.preventDefault();
      if (index < inputs.length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    } else if (e.key === 'Backspace' && inputs[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleFlip = () => {
    if (!showBack) {
      setUsedHint(true);
    }
    setShowBack(!showBack);
  };

const handleMark = () => {
    const currentQuote = quotes[currentIndex];
    const hiddenWords = currentQuote.visibleWords
      .filter(w => !w.visible)
      .map(w => w.word);

    const checkedResults = checkInputs(inputs, hiddenWords);
    setResults(checkedResults);

    const correctCount = checkedResults.filter(r => r.correct).length;
    const attemptedCount = hiddenWords.length;

    // Check for 100% and trigger confetti!
    if (correctCount === attemptedCount && attemptedCount > 0) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f97316', '#fb923c', '#fdba74', '#fed7aa']
      });
      
      // Extra burst for good measure
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#f97316', '#fb923c', '#fdba74']
        });
      }, 200);
      
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#f97316', '#fb923c', '#fdba74']
        });
      }, 400);
    }

    saveAttempt(textId, currentQuote.chapterId, currentQuote.id, {
      usedHints: usedHint,
      totalWords: currentQuote.totalWords,
      attemptedWords: attemptedCount,
      correctWords: correctCount,
      results: checkedResults,
    });

    const quoteResult = {
      quote: currentQuote,
      inputs: [...inputs],
      results: checkedResults,
      usedHint,
    };

    setSessionResults([...sessionResults, quoteResult]);

    if (settings.resultsMode === 'progressive') {
      setShowResults(true);
    } else {
      if (currentIndex < quotes.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        onComplete([...sessionResults, quoteResult]);
      }
    }
  };

  // Update this calculation near the bottom where buttons are rendered
  const isLastQuote = currentIndex === quotes.length - 1 && quotesToRevise.length === 0;
  const hasMoreQuotes = currentIndex < quotes.length - 1 || quotesToRevise.length > 0;

  // Update handleSkip function
  const handleSkip = () => {
    setSkippedQuotes([...skippedQuotes, quotes[currentIndex].id]);
    
    if (currentIndex < quotes.length - 1) {
      // More quotes in the main list
      setCurrentIndex(currentIndex + 1);
    } else if (quotesToRevise.length > 0) {
      // No more in main list, but we have revision quotes
      setQuotes([...quotes, ...quotesToRevise]);
      setQuotesToRevise([]);
      setCurrentIndex(currentIndex + 1);
    } else {
      // Truly no more quotes
      if (settings.resultsMode === 'end') {
        onComplete(sessionResults);
      } else {
        onBack();
      }
    }
  };

  // Update handleNextAfterResults function
  const handleNextAfterResults = () => {
    if (currentIndex < quotes.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowResults(false);
    } else if (quotesToRevise.length > 0) {
      // Add revision quotes and continue
      setQuotes([...quotes, ...quotesToRevise]);
      setQuotesToRevise([]);
      setCurrentIndex(currentIndex + 1);
      setShowResults(false);
    } else {
      onComplete(sessionResults);
    }
  };

  // Replace handleReviseAgain function
    const handleReviseAgain = () => {
    const currentQuote = quotes[currentIndex];
    
    // Add current quote to revision queue
    const updatedRevisionQueue = [...quotesToRevise, { ...currentQuote, isRevision: true }];
    setQuotesToRevise(updatedRevisionQueue);
    
    setShowResults(false);
    
    // Check if there are more quotes in the original list
    if (currentIndex < quotes.length - 1) {
        setCurrentIndex(currentIndex + 1);
    } else {
        // We've finished all original quotes, now do the revision ones
        if (updatedRevisionQueue.length > 0) {
        // Add revision quotes to the main quotes array
        setQuotes([...quotes, ...updatedRevisionQueue]);
        setQuotesToRevise([]);
        setCurrentIndex(currentIndex + 1);
        } else {
        // No revisions needed, complete the session
        onComplete(sessionResults);
        }
    }
    };

  if (!text || quotes.length === 0) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <p className="text-zinc-400">Loading...</p>
      </div>
    );
  }

  const currentQuote = quotes[currentIndex];
  const allInputsFilled = inputs.every(input => input.trim() !== '');
  const hasMarked = results.length > 0;

  return (
    <div className="min-h-screen bg-stone-50 p-12 flex flex-col items-center">
      <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <button
            onClick={onBack}
            className="flex items-center gap-3 px-6 py-3 text-zinc-600 hover:text-zinc-900 hover:bg-white rounded-md transition-all border-2 border-stone-200"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Exit Practice</span>
          </button>
          
          <div className="text-center bg-white px-8 py-4 rounded-md shadow-sm border-2 border-stone-200">
            <p className="text-sm font-bold text-zinc-700">
              Quote {currentIndex + 1} of {quotes.length}
            </p>
            <p className="text-xs text-zinc-500 mt-1 font-medium">{currentQuote.chapterName}</p>
          </div>

          <div className="w-32"></div>
        </div>

        {/* Palm Card - Centered */}
        <div className="flex-1 flex items-center justify-center mb-12">
          <PalmCard
            quote={currentQuote.text}
            showBack={showBack}
            autoFlip={settings.displayMode === 'timed' && !showBack}
            flipDelay={10000}
            onFlip={() => setShowBack(true)}
          >
            <div className="flex flex-col items-center justify-center min-h-full">
              <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-12 text-2xl leading-loose max-w-full" style={{ fontFamily: 'var(--font-palm)' }}>
                {currentQuote.visibleWords.map((item, index) => {
                  if (item.visible) {
                    return (
                      <span key={index} className="text-zinc-800 flex items-center justify-center" style={{ height: '1.5em' }}>
                        {item.word}
                      </span>
                    );
                  } else {
                    const inputIndex = currentQuote.visibleWords
                      .slice(0, index)
                      .filter(w => !w.visible).length;
                    
                    const result = results[inputIndex];
                    const isDisabled = showResults && settings.resultsMode === 'progressive';

                    // Better width calculation
                    const charWidth = 0.6;
                    const inputWidth = Math.max(item.word.length * charWidth, 2.5);
                    
                    return (
                      <div key={index} className="relative flex items-center justify-center" style={{ height: '1.5em' }}>
                        <input
                          ref={el => inputRefs.current[inputIndex] = el}
                          type="text"
                          value={inputs[inputIndex] || ''}
                          onChange={(e) => handleInputChange(inputIndex, e.target.value)}
                          onKeyDown={(e) => handleInputKeyDown(inputIndex, e)}
                          disabled={isDisabled}
                          maxLength={item.word.length}
                          className={`border-b-2 bg-transparent focus:outline-none text-center transition-colors text-2xl ${
                            result
                              ? result.correct
                                ? 'border-green-500 bg-green-50/30'
                                : result.fuzzyMatch
                                ? 'border-yellow-500 bg-yellow-50/30'
                                : 'border-red-500 bg-red-50/30'
                              : 'border-stone-400 focus:border-orange-500'
                          } ${isDisabled ? 'cursor-not-allowed' : ''}`}
                          style={{
                            width: `${inputWidth}em`,
                            fontFamily: 'var(--font-palm)',
                            height: '1.5em',
                            lineHeight: '1.5em',
                            padding: '0',
                          }}
                        />
                        {result && (result.fuzzyMatch || result.incorrect) && isDisabled && (
                          <div className="absolute -top-11 left-1/2 transform -translate-x-1/2 text-sm font-semibold text-orange-600 whitespace-nowrap bg-orange-100 px-3 py-1 rounded-md border border-orange-300 z-10">
                            {item.word}
                          </div>
                        )}
                      </div>
                    );
                  }
                })}
              </div>
            </div>
          </PalmCard>
        </div>

    {/* Action Buttons */}
        {!showResults && (
          <div className="flex gap-4 justify-center">
            <button
              onClick={handleSkip}
              className="px-10 py-3.5 bg-stone-200 text-zinc-700 rounded-md hover:bg-stone-300 transition-all font-semibold shadow-sm border-2 border-stone-300"
            >
              Skip
            </button>
            
            {settings.displayMode === 'relaxed' && !showBack && (
              <button
                onClick={handleFlip}
                className="px-10 py-3.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-all font-semibold shadow-sm border-2 border-blue-600"
              >
                Flip Card
              </button>
            )}

            <button
              onClick={handleMark}
              className="px-10 py-3.5 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-all font-semibold shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none border-2 border-orange-600"
              disabled={!allInputsFilled || !showBack}
            >
              {settings.resultsMode === 'end' && hasMoreQuotes ? 'Next' : 'Mark'}
            </button>
          </div>
        )}

{/* Progressive Results */}
        {showResults && settings.resultsMode === 'progressive' && (
          <div className="flex gap-4 justify-center mt-8">
            {results.every(r => r.correct) ? (
              // 100% correct - show only Next button
              <button
                onClick={handleNextAfterResults}
                className="px-10 py-3.5 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-all font-semibold shadow-md border-2 border-orange-600"
              >
                {hasMoreQuotes ? 'Next' : 'Finish'}
              </button>
            ) : (
              // Not 100% - show Next (orange) and Revise Later (gray)
              <>
                <button
                  onClick={handleNextAfterResults}
                  className="px-10 py-3.5 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-all font-semibold shadow-md border-2 border-orange-600"
                >
                  {hasMoreQuotes ? 'Next' : 'Finish'}
                </button>
                <button
                  onClick={handleReviseAgain}
                  className="px-10 py-3.5 bg-stone-300 text-zinc-700 rounded-md hover:bg-stone-400 transition-all font-semibold border-2 border-stone-400"
                >
                  Revise Later
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PracticeSession;