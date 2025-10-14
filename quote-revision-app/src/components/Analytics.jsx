import React, { useState, useEffect } from 'react';
import { ArrowLeft, TrendingUp, Award, Target } from 'lucide-react';
import { getTexts, getAnalytics } from '../utils/storage';
import { calculateTextAnalytics } from '../utils/analytics';

const Analytics = ({ onBack }) => {
  const [texts, setTexts] = useState([]);
  const [selectedTextId, setSelectedTextId] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    loadTexts();
  }, []);

  useEffect(() => {
    if (selectedTextId) {
      loadAnalytics();
    }
  }, [selectedTextId]);

  const loadTexts = () => {
    const loadedTexts = getTexts();
    setTexts(loadedTexts);
    if (loadedTexts.length > 0 && !selectedTextId) {
      setSelectedTextId(loadedTexts[0].id);
    }
  };

  const loadAnalytics = () => {
    const analyticsData = getAnalytics();
    const textAnalytics = calculateTextAnalytics(selectedTextId, texts, analyticsData);
    setAnalytics(textAnalytics);
  };

  const renderStats = (stats, title) => {
    if (!stats) {
      return (
        <div className="text-center py-8 text-zinc-400 text-sm">
          No data yet
        </div>
      );
    }

    return (
      <div>
        <h4 className="font-semibold text-zinc-700 mb-4 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-orange-500"></div>
          {title}
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
            <p className="text-xs text-blue-700 font-medium mb-1">Attempts</p>
            <p className="text-3xl font-bold text-blue-900">{stats.attempts}</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
            <p className="text-xs text-green-700 font-medium mb-1">Accuracy</p>
            <p className="text-3xl font-bold text-green-900">{stats.accuracy}%</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
            <p className="text-xs text-purple-700 font-medium mb-1">Coverage</p>
            <p className="text-3xl font-bold text-purple-900">{stats.coverage}%</p>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
            <p className="text-xs text-orange-700 font-medium mb-1">Words Practiced</p>
            <p className="text-3xl font-bold text-orange-900">{stats.totalAttempted}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center">
      {/* Header */}
      <div className="bg-white border-b border-stone-200 sticky top-0 z-40 shadow-sm w-full flex-grow">
        <div className="w-full mx-auto px-8 py-6">
          <div className="flex justify-between items-center">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 text-zinc-600 hover:text-zinc-900 hover:bg-stone-100 rounded-lg transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Texts</span>
            </button>
            
            <div className="text-center">
              <h1 className="text-3xl font-bold text-zinc-800 flex items-center gap-3 justify-center">
                <TrendingUp className="w-8 h-8 text-orange-500" />
                Analytics
              </h1>
              <p className="text-sm text-zinc-500 mt-1">Track your progress and performance</p>
            </div>

            <div className="w-28"></div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        {texts.length > 0 ? (
          <>
            {/* Text Selector */}
            <div className="mb-8">
              <label className="block text-sm font-bold text-zinc-800 mb-3">
                Select Text
              </label>
              <select
                value={selectedTextId || ''}
                onChange={(e) => setSelectedTextId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-stone-200 focus:border-orange-500 bg-white font-medium text-zinc-800"
              >
                {texts.map(text => (
                  <option key={text.id} value={text.id}>
                    {text.name}
                  </option>
                ))}
              </select>
            </div>

            {analytics ? (
              <div className="space-y-8">
                {/* Overall Stats */}
                <div className="bg-white rounded-2xl p-8 border border-stone-200 shadow-sm">
                  <h2 className="text-2xl font-bold text-zinc-800 mb-6 flex items-center gap-3">
                    <Award className="w-7 h-7 text-orange-500" />
                    Overall Performance
                  </h2>
                  
                  <div className="grid md:grid-cols-3 gap-8">
                    <div>
                      {renderStats(analytics.overall.all, 'All Attempts')}
                    </div>
                    <div>
                      {renderStats(analytics.overall.withoutHints, 'Without Hints')}
                    </div>
                    <div>
                      {renderStats(analytics.overall.withHints, 'With Hints')}
                    </div>
                  </div>
                </div>

                {/* Chapter Stats */}
                <div className="bg-white rounded-2xl p-8 border border-stone-200 shadow-sm">
                  <h2 className="text-2xl font-bold text-zinc-800 mb-6 flex items-center gap-3">
                    <Target className="w-7 h-7 text-orange-500" />
                    Chapter Breakdown
                  </h2>
                  
                  <div className="space-y-8">
                    {analytics.chapters.map(chapter => (
                      <div key={chapter.chapterId} className="border-b border-stone-100 pb-8 last:border-b-0 last:pb-0">
                        <h3 className="text-lg font-bold text-zinc-800 mb-6 bg-orange-50 px-4 py-2 rounded-lg border border-orange-200">
                          {chapter.chapterName}
                        </h3>
                        
                        <div className="grid md:grid-cols-3 gap-6">
                          <div>
                            {renderStats(chapter.all, 'All Attempts')}
                          </div>
                          <div>
                            {renderStats(chapter.withoutHints, 'Without Hints')}
                          </div>
                          <div>
                            {renderStats(chapter.withHints, 'With Hints')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quote Stats */}
                <div className="bg-white rounded-2xl p-8 border border-stone-200 shadow-sm">
                  <h2 className="text-2xl font-bold text-zinc-800 mb-6">Quote Performance</h2>
                  
                  <div className="space-y-4">
                    {analytics.quotes.map(quote => (
                      <details key={quote.quoteId} className="group">
                        <summary className="cursor-pointer list-none p-5 bg-stone-50 rounded-xl hover:bg-stone-100 transition-colors border border-stone-200">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-zinc-800 line-clamp-2 leading-relaxed">
                                {quote.quoteText}
                              </p>
                              <p className="text-xs text-zinc-500 mt-2">{quote.chapterName}</p>
                            </div>
                            {quote.all && (
                              <div className="ml-4 text-right">
                                <p className="text-sm font-bold text-green-600">
                                  {quote.all.accuracy}% accuracy
                                </p>
                                <p className="text-xs text-zinc-500">
                                  {quote.all.attempts} {quote.all.attempts === 1 ? 'attempt' : 'attempts'}
                                </p>
                              </div>
                            )}
                          </div>
                        </summary>
                        
                        <div className="mt-4 pl-4 grid md:grid-cols-3 gap-6 pt-4 border-t border-stone-200">
                          <div>
                            {renderStats(quote.all, 'All Attempts')}
                          </div>
                          <div>
                            {renderStats(quote.withoutHints, 'Without Hints')}
                          </div>
                          <div>
                            {renderStats(quote.withHints, 'With Hints')}
                          </div>
                        </div>
                      </details>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center border border-stone-200">
                <p className="text-zinc-400 text-lg">No analytics data available for this text yet.</p>
                <p className="text-sm text-zinc-500 mt-2">Complete some practice sessions to see your stats!</p>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center border border-stone-200">
            <p className="text-zinc-400 text-lg">No texts available.</p>
            <p className="text-sm text-zinc-500 mt-2">Create a text to start tracking your progress!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;