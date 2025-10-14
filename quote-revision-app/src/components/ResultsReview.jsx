import React, { useState } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import PalmCard from './PalmCard';

const ResultsReview = ({ sessionResults, onBack }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showBack, setShowBack] = useState(true);
  const [direction, setDirection] = useState('');

  const handleNext = () => {
    if (currentIndex < sessionResults.length - 1) {
      setDirection('slide-left');
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
        setShowBack(true);
        setDirection('');
      }, 400);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setDirection('slide-right');
      setTimeout(() => {
        setCurrentIndex(currentIndex - 1);
        setShowBack(true);
        setDirection('');
      }, 400);
    }
  };

  const handleFlip = () => {
    setShowBack(!showBack);
  };

  if (sessionResults.length === 0) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-400 text-lg mb-6">No results to display</p>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-all font-medium shadow-lg border-2 border-orange-600"
          >
            Back to Text
          </button>
        </div>
      </div>
    );
  }

  const currentResult = sessionResults[currentIndex];
  const correctCount = currentResult.results.filter(r => r.correct).length;
  const totalAttempted = currentResult.results.length;
  const accuracy = totalAttempted > 0 ? Math.round((correctCount / totalAttempted) * 100) : 0;

  return (
    <div className="min-h-screen bg-stone-50 p-12 flex justify-center">
      <div className="max-w-5xl mx-auto flex-grow">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <button
            onClick={onBack}
            className="flex items-center gap-3 px-6 py-3 text-zinc-600 hover:text-zinc-900 hover:bg-white rounded-md transition-all border-2 border-stone-200"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Finish Review</span>
          </button>
          
          <div className="text-center bg-white px-8 py-4 rounded-md shadow-sm border-2 border-stone-200">
            <p className="text-sm font-bold text-zinc-700">
              Card {currentIndex + 1} of {sessionResults.length}
            </p>
            <p className="text-xs text-zinc-500 mt-1 font-medium">{currentResult.quote.chapterName}</p>
          </div>

          <div className="text-right bg-white px-6 py-4 rounded-md shadow-sm border-2 border-stone-200">
            <p className="text-2xl font-bold text-green-600">
              {correctCount} / {totalAttempted}
            </p>
            <p className="text-xs text-zinc-500 mt-1 font-medium">
              {accuracy}% correct
            </p>
            {currentResult.usedHint && (
              <p className="text-xs text-orange-500 font-semibold mt-1">Used hint</p>
            )}
          </div>
        </div>

        {/* Card */}
        <div className={`transition-all duration-500 ease-in-out ${direction}`}>
          <div className="mb-12">
            <PalmCard
              quote={currentResult.quote.text}
              showBack={showBack}
              onFlip={handleFlip}
            >
              <div className="flex flex-col items-center justify-center min-h-full">
                <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-12 text-2xl leading-loose max-w-full" style={{ fontFamily: 'var(--font-palm)' }}>
                  {currentResult.quote.visibleWords.map((item, index) => {
                    if (item.visible) {
                      return (
                        <span key={index} className="text-zinc-800 flex items-center justify-center" style={{ height: '1.5em' }}>
                          {item.word}
                        </span>
                      );
                    } else {
                      const inputIndex = currentResult.quote.visibleWords
                        .slice(0, index)
                        .filter(w => !w.visible).length;
                      
                      const result = currentResult.results[inputIndex];

                      const charWidth = 0.6;
                      const inputWidth = Math.max(item.word.length * charWidth, 2.5);

                      return (
                        <div key={index} className="relative flex items-center justify-center" style={{ height: '1.5em' }}>
                          <input
                            type="text"
                            value={currentResult.inputs[inputIndex] || ''}
                            disabled
                            className={`border-b-2 bg-transparent cursor-not-allowed text-center ${
                              result.correct
                                ? 'border-green-500 bg-green-50/30'
                                : result.fuzzyMatch
                                ? 'border-yellow-500 bg-yellow-50/30'
                                : 'border-red-500 bg-red-50/30'
                            }`}
                            style={{
                              width: `${inputWidth}em`,
                              fontFamily: 'var(--font-palm)',
                              height: '1.5em',
                              lineHeight: '1.5em',
                              padding: '0',
                              fontSize: '1.5rem',
                            }}
                          />
                          {(result.fuzzyMatch || result.incorrect) && (
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

            {/* Flip Button */}
            <div className="text-center mt-6">
              <button
                onClick={handleFlip}
                className="px-8 py-3 bg-stone-200 text-zinc-700 rounded-md hover:bg-stone-300 transition-colors font-semibold border-2 border-stone-300"
              >
                {showBack ? 'Show Full Quote' : 'Show Results'}
              </button>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-4 justify-center items-center mb-12">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="p-4 bg-white border-2 border-stone-300 rounded-md hover:bg-stone-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
          >
            <ChevronLeft className="w-6 h-6 text-zinc-700" />
          </button>
          
          <div className="px-10 py-3 bg-white border-2 border-stone-300 rounded-md shadow-sm">
            <span className="font-bold text-zinc-800 text-lg">
              {currentIndex + 1} / {sessionResults.length}
            </span>
          </div>

          <button
            onClick={handleNext}
            disabled={currentIndex === sessionResults.length - 1}
            className="p-4 bg-white border-2 border-stone-300 rounded-md hover:bg-stone-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
          >
            <ChevronRight className="w-6 h-6 text-zinc-700" />
          </button>
        </div>

        {/* Summary */}
        <div className="bg-white rounded-2xl p-10 border-2 border-stone-200 shadow-sm">
          <h3 className="text-2xl font-bold text-zinc-800 mb-8">Session Summary</h3>
          <div className="grid grid-cols-3 gap-8">
            <div className="text-center p-8 bg-green-50 rounded-xl border-2 border-green-200">
              <p className="text-5xl font-bold text-green-600 mb-3">
                {sessionResults.reduce((acc, r) => acc + r.results.filter(res => res.correct).length, 0)}
              </p>
              <p className="text-sm font-semibold text-zinc-700">Correct</p>
            </div>
            <div className="text-center p-8 bg-yellow-50 rounded-xl border-2 border-yellow-200">
              <p className="text-5xl font-bold text-yellow-600 mb-3">
                {sessionResults.reduce((acc, r) => acc + r.results.filter(res => res.fuzzyMatch).length, 0)}
              </p>
              <p className="text-sm font-semibold text-zinc-700">Close</p>
            </div>
            <div className="text-center p-8 bg-red-50 rounded-xl border-2 border-red-200">
              <p className="text-5xl font-bold text-red-600 mb-3">
                {sessionResults.reduce((acc, r) => acc + r.results.filter(res => res.incorrect).length, 0)}
              </p>
              <p className="text-sm font-semibold text-zinc-700">Incorrect</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsReview;