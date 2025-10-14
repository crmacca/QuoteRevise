import React, { useState } from 'react';
import { X } from 'lucide-react';

const ReviseModal = ({ text, onClose, onStart }) => {
  const [redactionType, setRedactionType] = useState('full');
  const [percentage, setPercentage] = useState(50);
  const [selectedChapters, setSelectedChapters] = useState([]);
  const [order, setOrder] = useState('ordered');
  const [displayMode, setDisplayMode] = useState('relaxed');
  const [resultsMode, setResultsMode] = useState('progressive');

  const handleChapterToggle = (chapterId) => {
    setSelectedChapters((prev) =>
      prev.includes(chapterId)
        ? prev.filter((id) => id !== chapterId)
        : [...prev, chapterId]
    );
  };

  const handleSelectAll = () => {
    if (selectedChapters.length === text.chapters.length) {
      setSelectedChapters([]);
    } else {
      setSelectedChapters(text.chapters.map((ch) => ch.id));
    }
  };

  const handleStart = () => {
    if (selectedChapters.length === 0) {
      alert('Please select at least one chapter');
      return;
    }

    onStart({
      redactionType,
      percentage,
      selectedChapters,
      order,
      displayMode,
      resultsMode,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-8">
      <div className="bg-stone-50 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl border-2 border-stone-300 flex flex-col">
        {/* Header */}
        <div className="px-12 py-8 border-b-2 border-stone-200 flex justify-between items-center bg-white flex-shrink-0">
          <div className="flex flex-col gap-2">
            <h2 className="text-3xl font-bold text-zinc-800">Practice Settings</h2>
            <p className="text-base text-zinc-600 font-medium">Customize your revision session</p>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-stone-100 rounded-md transition-colors"
          >
            <X className="w-7 h-7 text-zinc-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-stone-50 px-12 py-10">
          <div className="flex flex-col gap-12">
            {/* Redaction Type */}
            <div className="flex flex-col gap-5">
              <label className="text-lg font-bold text-zinc-800">
                Redaction Type
              </label>
              <div className="flex flex-col gap-4">
                {[
                  { value: 'full', label: 'Full Redaction', desc: 'All words hidden' },
                  { value: 'random', label: 'Random Words', desc: 'Minimum 2 words visible' },
                  { value: 'percentage', label: 'Percentage Based', desc: 'Choose how much to keep' },
                ].map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-start gap-5 p-6 border-2 rounded-md cursor-pointer transition-all ${
                      redactionType === option.value
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-stone-300 hover:border-stone-400 hover:bg-white bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="redactionType"
                      value={option.value}
                      checked={redactionType === option.value}
                      onChange={(e) => setRedactionType(e.target.value)}
                      className="mt-1 w-5 h-5 text-orange-500 focus:ring-orange-500 flex-shrink-0"
                    />
                    <div className="flex flex-col gap-1 flex-1">
                      <span className="font-bold text-zinc-800 text-lg">{option.label}</span>
                      <span className="text-sm text-zinc-600">{option.desc}</span>
                    </div>
                  </label>
                ))}
              </div>

              {redactionType === 'percentage' && (
                <div className="p-7 bg-orange-50 rounded-md border-2 border-orange-300 flex flex-col gap-5">
                  <div className="flex justify-between items-center">
                    <label className="text-base font-bold text-zinc-800">
                      Words to Keep
                    </label>
                    <span className="text-3xl font-bold text-orange-600">{percentage}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={percentage}
                    onChange={(e) => setPercentage(Number(e.target.value))}
                    className="w-full h-3 bg-orange-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                  />
                </div>
              )}
            </div>

            {/* Selected Chapters */}
            <div className="flex flex-col gap-5">
              <div className="flex justify-between items-center">
                <label className="text-lg font-bold text-zinc-800">
                  Select Chapters
                </label>
                <button
                  onClick={handleSelectAll}
                  className="text-sm text-orange-600 hover:text-orange-700 font-bold"
                >
                  {selectedChapters.length === text.chapters.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              <div className="flex flex-col gap-3 max-h-64 overflow-y-auto">
                {text.chapters.map((chapter) => (
                  <label
                    key={chapter.id}
                    className={`flex items-center gap-5 p-6 border-2 rounded-md cursor-pointer transition-all ${
                      selectedChapters.includes(chapter.id)
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-stone-300 hover:border-stone-400 hover:bg-white bg-white'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedChapters.includes(chapter.id)}
                      onChange={() => handleChapterToggle(chapter.id)}
                      className="w-5 h-5 text-orange-500 focus:ring-orange-500 rounded border-2 border-stone-400 flex-shrink-0"
                    />
                    <span className="flex-1 font-bold text-zinc-800 text-base">{chapter.name}</span>
                    <span className="text-sm text-zinc-500 font-medium flex-shrink-0">
                      {chapter.quotes.length} {chapter.quotes.length === 1 ? 'quote' : 'quotes'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Order & Display Mode - Side by Side */}
            <div className="grid md:grid-cols-2 gap-10">
              {/* Order */}
              <div className="flex flex-col gap-5">
                <label className="text-lg font-bold text-zinc-800">Order</label>
                <div className="flex flex-col gap-4">
                  {[
                    { value: 'ordered', label: 'Sequential' },
                    { value: 'randomized', label: 'Randomized' },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-center gap-5 p-5 border-2 rounded-md cursor-pointer transition-all ${
                        order === option.value
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-stone-300 hover:border-stone-400 bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="order"
                        value={option.value}
                        checked={order === option.value}
                        onChange={(e) => setOrder(e.target.value)}
                        className="w-5 h-5 text-orange-500 focus:ring-orange-500 flex-shrink-0"
                      />
                      <span className="font-bold text-zinc-800 text-base">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Display Mode */}
              <div className="flex flex-col gap-5">
                <label className="text-lg font-bold text-zinc-800">Display Mode</label>
                <div className="flex flex-col gap-4">
                  {[
                    { value: 'relaxed', label: 'Relaxed' },
                    { value: 'timed', label: 'Timed (10s)' },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-center gap-5 p-5 border-2 rounded-md cursor-pointer transition-all ${
                        displayMode === option.value
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-stone-300 hover:border-stone-400 bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="displayMode"
                        value={option.value}
                        checked={displayMode === option.value}
                        onChange={(e) => setDisplayMode(e.target.value)}
                        className="w-5 h-5 text-orange-500 focus:ring-orange-500 flex-shrink-0"
                      />
                      <span className="font-bold text-zinc-800 text-base">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Results Mode */}
            <div className="flex flex-col gap-5">
              <label className="text-lg font-bold text-zinc-800">Results Display</label>
              <div className="flex flex-col gap-4">
                {[
                  { value: 'progressive', label: 'Progressive', desc: 'See results after each card' },
                  { value: 'end', label: 'At End', desc: 'Review all cards at the end' },
                ].map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-start gap-5 p-6 border-2 rounded-md cursor-pointer transition-all ${
                      resultsMode === option.value
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-stone-300 hover:border-stone-400 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="resultsMode"
                      value={option.value}
                      checked={resultsMode === option.value}
                      onChange={(e) => setResultsMode(e.target.value)}
                      className="mt-1 w-5 h-5 text-orange-500 focus:ring-orange-500 flex-shrink-0"
                    />
                    <div className="flex flex-col gap-1 flex-1">
                      <span className="font-bold text-zinc-800 text-lg">{option.label}</span>
                      <span className="text-sm text-zinc-600">{option.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-12 py-8 border-t-2 border-stone-200 bg-white flex gap-5 flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-4 bg-white border-2 border-stone-300 text-zinc-700 rounded-md hover:bg-stone-100 transition-all font-bold text-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleStart}
            className="flex-1 px-6 py-4 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-all font-bold shadow-lg border-2 border-orange-600 text-lg"
          >
            Start Practice
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviseModal;